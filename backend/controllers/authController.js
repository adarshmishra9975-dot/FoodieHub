const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, address, role } = req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phone, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user with email already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // Default role is customer unless explicitly set to admin during initial development
    const userRole = role === 'admin' ? 'admin' : 'customer';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      address: address || '',
      role: userRole,
    });

    if (user) {
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        success: true,
        message: 'Registration successful! Welcome to FoodieHub.',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to create user account with provided data',
      });
    }
  } catch (error) {
    console.error('[Register Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during registration',
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Find user by lowercase email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id, user.role);

      res.status(200).json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          address: user.address,
          role: user.role,
          createdAt: user.createdAt,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
  } catch (error) {
    console.error('[Login Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during authentication',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[GetMe Error]', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving user profile',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
