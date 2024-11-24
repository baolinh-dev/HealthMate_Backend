require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Đảm bảo bạn đã require cors
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes'); 
const exerciseRoutes = require('./routes/exerciseRoutes');

const app = express();
app.use(express.json());  // Body parser middleware

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000', // Đảm bảo yêu cầu từ localhost:3000 được chấp nhận
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các phương thức HTTP cho phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Các header cho phép
}));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes); 
app.use('/api/exercises', exerciseRoutes)

// Port từ environment hoặc mặc định 5004
const PORT = process.env.PORT || 5004;

console.log("SECRET_KEY", process.env.SECRET_KEY);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
