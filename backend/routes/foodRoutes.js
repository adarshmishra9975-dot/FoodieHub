const express = require('express');
const router = express.Router();
const {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
} = require('../controllers/foodController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllFoods)
  .post(protect, adminOnly, createFood);

router.route('/:id')
  .get(getFoodById)
  .put(protect, adminOnly, updateFood)
  .delete(protect, adminOnly, deleteFood);

module.exports = router;
