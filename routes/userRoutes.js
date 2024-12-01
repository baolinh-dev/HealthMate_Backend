const express = require('express');
const { getAllUsers, searchUsers, addUser, deleteUser, editUser, completeWorkout, getCurrentUser, getCaloriesStats, searchUserById } = require('../controllers/userController');
const { checkAdmin, verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', verifyToken, checkAdmin, getAllUsers);
router.get('/search', searchUsers); 
router.get('/search/:id', searchUserById);
router.post('/', verifyToken, checkAdmin, addUser);
router.delete('/:email', verifyToken, checkAdmin, deleteUser);
router.put('/:email', verifyToken, checkAdmin, editUser);
router.put('/completeWorkout/:email', completeWorkout); 
router.get('/me', verifyToken, getCurrentUser); 
router.get('/stats/calories', verifyToken, getCaloriesStats);

module.exports = router;
