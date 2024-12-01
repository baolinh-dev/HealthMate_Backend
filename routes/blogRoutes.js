const express = require('express');
const { addBlog } = require('../controllers/blogController');
const { authenticateUser } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/add', authenticateUser, addBlog);

module.exports = router;
