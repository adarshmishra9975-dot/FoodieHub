const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, adminOnly, getAllUsers);

router.route('/:id')
  .get(protect, adminOnly, getUserById)
  .put(protect, updateUserProfile)
  .delete(protect, adminOnly, deleteUser);

module.exports = router;
