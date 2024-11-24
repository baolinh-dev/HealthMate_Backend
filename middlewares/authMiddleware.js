require('dotenv').config();
const { SECRET_KEY } = process.env;
const jwt = require('jsonwebtoken');

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

module.exports = { checkAdmin };
