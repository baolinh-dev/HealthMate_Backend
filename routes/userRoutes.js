const express = require('express');
const { getAllUsers, searchUsers, addUser, deleteUser, editUser, completeWorkout, getCurrentUser, getCaloriesStats } = require('../controllers/userController');
const { checkAdmin, authenticateUser } = require('../middlewares/authMiddleware');
const router = express.Router();

// Lấy tất cả người dùng - Chỉ admin mới có quyền
router.get('/', checkAdmin, getAllUsers);

// Tìm kiếm người dùng
router.get('/search', searchUsers);

// Thêm người dùng mới - Chỉ admin mới có quyền
router.post('/', checkAdmin, addUser);

// Xóa người dùng - Chỉ admin mới có quyền
router.delete('/:email', checkAdmin, deleteUser);

// Sửa người dùng - Chỉ admin mới có quyền
router.put('/:email', checkAdmin, editUser);

// Hoàn thành buổi tập - Cập nhật số calo đã đốt cháy cho người dùng
router.put('/completeWorkout/:email', completeWorkout); 

// Route trả về thông tin người đăng nhập
router.get('/me', authenticateUser, getCurrentUser); 

// Route trả về thông tin người đăng nhập
router.get('/stats/calories', authenticateUser, getCaloriesStats);

module.exports = router;
