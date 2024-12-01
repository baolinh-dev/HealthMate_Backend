const express = require('express');
const { addBlog, updateBlogUser, updateBlogAdmin, getAllBlogs, getAllBlogsAdmin } = require('../controllers/blogController');
const { verifyToken, checkAdmin } = require('../middlewares/authMiddleware');


const router = express.Router();

router.post('/add', verifyToken, addBlog); 
router.put('/updateUser/:id', verifyToken, updateBlogUser);
router.put('/updateAdmin/:id', verifyToken, checkAdmin, updateBlogAdmin); 
router.get('/all', verifyToken, getAllBlogs);
router.get('/allAdmin', verifyToken, checkAdmin, getAllBlogsAdmin);

module.exports = router;
