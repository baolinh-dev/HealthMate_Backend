const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Kết nối MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/healthTracker')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


// Tạo User model
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

// Tạo server
const app = express();
const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Route đăng ký
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Kiểm tra email đã tồn tại chưa
    const userExists = await User.findOne({ email }); 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin!' });
    }
    if (userExists) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    // Hash mật khẩu và lưu thông tin người dùng
    const hashedPassword = bcrypt.hashSync(password, 8);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công', user: { name, email } });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

// Route đăng nhập
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Tạo JWT token
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
});

// Chạy server
const PORT = 5002;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
