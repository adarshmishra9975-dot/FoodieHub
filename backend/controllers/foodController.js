const Food = require('../models/Food');

// @desc    Get all foods with filtering, searching, and sorting
// @route   GET /api/foods
// @access  Public
const getAllFoods = async (req, res) => {
  try {
    const { search, category, isVeg, sort, available } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Veg / Non-Veg filter
    if (isVeg !== undefined && isVeg !== '') {
      query.isVeg = isVeg === 'true';
    }

    // Availability filter (e.g. only show available for customers, or both for admin)
    if (available !== undefined && available !== '') {
      query.available = available === 'true';
    }

    // Search keyword
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { ingredients: { $in: [searchRegex] } },
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    } else if (sort === 'name') {
      sortOptions = { name: 1 };
    }

    const foods = await Food.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: foods.length,
      foods,
    });
  } catch (error) {
    console.error('[Get Foods Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve food menu items',
    });
  }
};

// @desc    Get single food by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found',
      });
    }

    res.status(200).json({
      success: true,
      food,
    });
  } catch (error) {
    console.error('[Get Food By ID Error]', error);
    res.status(500).json({
      success: false,
      message: 'Invalid food item identifier or server error',
    });
  }
};

// @desc    Create a new food item
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      ingredients,
      isVeg,
      rating,
      available,
    } = req.body;

    if (!name || !description || price === undefined || !category || !image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, description, price, category, and image URL',
      });
    }

    const ingredientsList = Array.isArray(ingredients)
      ? ingredients
      : typeof ingredients === 'string'
      ? ingredients.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

    const food = await Food.create({
      name,
      description,
      price: Number(price),
      category,
      image,
      ingredients: ingredientsList,
      isVeg: isVeg === undefined ? true : Boolean(isVeg),
      rating: rating ? Number(rating) : 4.5,
      available: available === undefined ? true : Boolean(available),
    });

    res.status(201).json({
      success: true,
      message: 'Food item created successfully',
      food,
    });
  } catch (error) {
    console.error('[Create Food Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating food item',
    });
  }
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res) => {
  try {
    let food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found to update',
      });
    }

    const {
      name,
      description,
      price,
      category,
      image,
      ingredients,
      isVeg,
      rating,
      available,
    } = req.body;

    if (name) food.name = name;
    if (description) food.description = description;
    if (price !== undefined) food.price = Number(price);
    if (category) food.category = category;
    if (image) food.image = image;
    if (ingredients !== undefined) {
      food.ingredients = Array.isArray(ingredients)
        ? ingredients
        : typeof ingredients === 'string'
        ? ingredients.split(',').map((item) => item.trim()).filter(Boolean)
        : food.ingredients;
    }
    if (isVeg !== undefined) food.isVeg = Boolean(isVeg);
    if (rating !== undefined) food.rating = Number(rating);
    if (available !== undefined) food.available = Boolean(available);

    const updatedFood = await food.save();

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      food: updatedFood,
    });
  } catch (error) {
    console.error('[Update Food Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating food item',
    });
  }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: 'Food item not found to delete',
      });
    }

    await food.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully from database',
    });
  } catch (error) {
    console.error('[Delete Food Error]', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting food item',
    });
  }
};

module.exports = {
  getAllFoods,
  getFoodById,
  createFood,
  updateFood,
  deleteFood,
};
