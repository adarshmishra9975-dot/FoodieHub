const User = require('../models/User');

// @desc    Get all registered users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('[Get All Users Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve registered users list',
    });
  }
};

// @desc    Get user by ID (Admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('[Get User By ID Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user details',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const userToUpdateId = req.params.id;

    // Check authorization: users can only update their own profile unless they are an admin
    if (userToUpdateId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this profile',
      });
    }

    const user = await User.findById(userToUpdateId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found to update',
      });
    }

    const { name, phone, address, password, role } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address !== undefined) user.address = address;

    // Admin can update role, but prevent demoting the sole primary admin
    if (role && req.user.role === 'admin') {
      user.role = role;
    }

    // Password update
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }
      user.password = password; // pre-save hook will hash it
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('[Update Profile Error]', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating user profile',
    });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    // Critical safety constraint: Admin cannot delete themselves accidentally
    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Self-deletion prohibited: You cannot delete your currently active admin account.',
      });
    }

    const user = await User.findById(targetUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found to delete',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: `User account "${user.name}" (${user.email}) deleted successfully.`,
    });
  } catch (error) {
    console.error('[Delete User Error]', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user account',
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserProfile,
  deleteUser,
};
