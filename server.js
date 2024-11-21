require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); 

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/healthTracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Create User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  workOut: [
    {
      date: { type: Date, required: true },   // Đảm bảo là kiểu dữ liệu ngày tháng
      calories: { type: Number, required: true },  // Số calo đốt cháy trong ngày
    }
  ],
  role: {
    type: String,
    enum: ['admin', 'user'], // Chỉ chấp nhận giá trị 'admin' hoặc 'user'
    default: 'user', // Mặc định là 'user'
  }
});

// Tạo model User
const User = mongoose.model('User', userSchema);

// Create server
const app = express();
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; 

app.use(cors());
app.use(bodyParser.json());  

// Middleware kiểm tra quyền truy cập
const checkAdmin = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token.' });
    } 

    console.log(decoded);
    
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    next();
  });
};

// Route đăng ký
app.post('/register', async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  // Kiểm tra thiếu thông tin
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter your name, email, and password!' });
  }

  // Kiểm tra định dạng email
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.',
    });
  }

  try {
    // Kiểm tra email đã tồn tại
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash mật khẩu và lưu thông tin người dùng
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new User({ name, email, password: hashedPassword, role, workOut: [] });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful', user: { name, email, role } });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
  }
});


// Route đăng nhập
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Kiểm tra thiếu thông tin
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter your email and password!' });
  }

  // Kiểm tra định dạng email
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    // Kiểm tra email có tồn tại không
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    // Kiểm tra mật khẩu
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { email: user.email, role: user.role }, 
      SECRET_KEY, 
      { expiresIn: '1d' }
    );

    // Trả về thông tin đăng nhập
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role, // Trả thêm role của user
      },
    });

  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
  }
});

app.get('/users', checkAdmin,  async (req, res) => {
  try {
    // Lấy tất cả người dùng từ cơ sở dữ liệu, không giới hạn trường nào
    const users = await User.find();

    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json({ users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
});



// Start server
const PORT = 5004;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));