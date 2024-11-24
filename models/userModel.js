const mongoose = require('mongoose');

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

module.exports = mongoose.model('User', userSchema);
