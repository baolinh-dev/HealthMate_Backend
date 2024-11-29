require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const Exercise = require('../models/exerciseModel') 

// Lấy tất cả người dùng
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
};

// Tìm kiếm người dùng
const searchUsers = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: 'Please provide a search query.' });
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    });

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found matching your search.' });
    }

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error searching users:', err);
    res.status(500).json({ message: 'An error occurred while searching for users.' });
  }
};

// Thêm người dùng mới
const addUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'Please enter your name, email, password, and role!' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new User({ name, email, password: hashedPassword, role, workOut: [] });
    await newUser.save();

    res.status(201).json({ message: 'User added successfully', user: { name, email, role } });
  } catch (err) {
    console.error('Error during adding user:', err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.deleteOne({ email });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'An error occurred while deleting the user.' });
  }
};

// Sửa thông tin người dùng
const editUser = async (req, res) => {
  const { email } = req.params;
  const { name, password, role } = req.body;

  if (!name && !password && !role) {
    return res.status(400).json({ message: 'Please provide at least one field to update (name, password, or role).' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (password) user.password = bcrypt.hashSync(password, 8);
    if (role) user.role = role;

    await user.save();
    res.status(200).json({ message: 'User updated successfully', user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'An error occurred while updating the user.' });
  }
}; 

const completeWorkout = async (req, res) => {
  const { email } = req.params; // Nhận email từ URL params
  console.log("email", email); // Kiểm tra xem email có được truyền đúng không
  
  const { exercise, setsCompleted } = req.body; // Nhận bài tập và số sets từ body
  
  if (!exercise || !setsCompleted) {
    return res.status(400).json({ message: 'Exercise and setsCompleted are required' });
  }
  
  try {
    const user = await User.findOne({ email }); // Tìm người dùng qua email
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Tính số calo đã đốt cháy từ số sets
    const caloriesBurned = exercise.caloriesPerSet;

    // Cập nhật workOut của người dùng
    user.workOut.push({
      date: new Date(),
      calories: caloriesBurned,
    });

    await user.save(); // Lưu thay đổi vào cơ sở dữ liệu

    res.status(200).json({ message: 'Workout completed successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error completing workout', error: err.message });
  }
}; 

const getCurrentUser = (req, res) => {
  try {
    // Sử dụng thông tin người dùng đã được lưu trong middleware `authenticateUser`
    const user = req.user;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Trả về thông tin người dùng
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      workOut: user.workOut,
      role: user.role,
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
}; 

const groupCaloriesByDate = (workOut) => {
  return workOut.reduce((acc, session) => {
    const date = new Date(session.date).toISOString().split('T')[0]; // Lấy ngày (YYYY-MM-DD)
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += session.calories;
    return acc;
  }, {});
};

const groupCaloriesByWeek = (workOut) => {
  return workOut.reduce((acc, session) => {
    const date = new Date(session.date);
    const year = date.getFullYear();
    const week = Math.ceil(((date - new Date(year, 0, 1)) / 86400000 + date.getDay() + 1) / 7); // Số tuần
    const weekKey = `${year}-W${week}`;

    if (!acc[weekKey]) {
      acc[weekKey] = 0;
    }
    acc[weekKey] += session.calories;
    return acc;
  }, {});
};

const getCaloriesStats = (req, res) => {
  const { workOut } = req.user; // Dữ liệu workOut lấy từ `req.user`

  const dailyStats = groupCaloriesByDate(workOut);
  const weeklyStats = groupCaloriesByWeek(workOut);

  res.status(200).json({
    daily: dailyStats,
    weekly: weeklyStats,
  });
};



module.exports = { getAllUsers, searchUsers, addUser, deleteUser, editUser, completeWorkout, getCurrentUser, getCaloriesStats };
