const express = require('express');
const { getAllUsers, searchUsers, addUser, deleteUser, editUser } = require('../controllers/userController');
const { checkAdmin } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', checkAdmin, getAllUsers);   // Lấy tất cả người dùng - Chỉ admin mới có quyền
router.get('/search', searchUsers);   // Tìm kiếm người dùng
router.post('/', checkAdmin, addUser);   // Thêm người dùng mới - Chỉ admin mới có quyền
router.delete('/:email', checkAdmin, deleteUser);   // Xóa người dùng - Chỉ admin mới có quyền
router.put('/:email', checkAdmin, editUser);   // Sửa người dùng - Chỉ admin mới có quyền

module.exports = router;
