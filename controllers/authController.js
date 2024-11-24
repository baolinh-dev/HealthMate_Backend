require('dotenv').config();
const { SECRET_KEY } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// Đăng ký
const register = async (req, res) => {
  const { name, email, password, role = 'user' } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please enter your name, email, and password!' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new User({ name, email, password: hashedPassword, role, workOut: [] });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful', user: { name, email, role } });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
  }
};

// Đăng nhập
const login = async (req, res) => {
  const { email, password } = req.body; 
  console.log("SECRET_KEY", process.env.SECRET_KEY); 
  

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter your email and password!' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email does not exist' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Error during login:', err.message || err);
    res.status(500).json({ message: 'An error occurred, please try again.' });
  }
};

module.exports = { register, login };
