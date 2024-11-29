require('dotenv').config();
const { SECRET_KEY } = process.env;
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');


const checkAdmin = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(403).json({ message: 'Invalid token format.' });
  }

  const actualToken = tokenParts[1]; 

  jwt.verify(actualToken, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Failed to authenticate token.' });
    }

    req.user = decoded;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required.' });
    }

    next();
  });
}; 

const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]; // Lấy token từ header Authorization 

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // Xác minh token
    const decoded = jwt.verify(token, process.env.SECRET_KEY); 

    
    // Tìm người dùng bằng email (trong token)
    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user; // Lưu thông tin người dùng vào `req` để các API khác sử dụng
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

module.exports = { checkAdmin, authenticateUser };
