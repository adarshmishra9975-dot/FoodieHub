const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide food name'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide food description'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide food price in INR'],
      min: [0, 'Price must be positive'],
    },
    category: {
      type: String,
      required: [true, 'Please select a food category'],
      enum: [
        'Pizza',
        'Burger',
        'Indian',
        'Chinese',
        'South Indian',
        'Snacks',
        'Desserts',
        'Beverages',
      ],
    },
    image: {
      type: String,
      required: [true, 'Please provide a food image URL'],
      trim: true,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    isVeg: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Food = mongoose.model('Food', foodSchema);
module.exports = Food;
