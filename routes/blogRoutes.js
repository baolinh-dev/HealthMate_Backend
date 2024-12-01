const express = require('express');
const { addBlog, updateBlogUser, updateBlogAdmin } = require('../controllers/blogController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/add', verifyToken, addBlog); 
router.put('/updateUser/:id', verifyToken, updateBlogUser);
router.put('/updateAdmin/:id', verifyToken, checkAdmin, updateBlogAdmin);

module.exports = router;
