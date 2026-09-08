const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes for authenticated users
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const secret =
        process.env.JWT_SECRET || 'foodiehub_super_secret_jwt_key_2026_bsc_it';
      const decoded = jwt.verify(token, secret);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: 'User account not found' });
      }

      next();
    } catch (error) {
      console.error('[Auth Middleware] Token error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }
  } else {
    return res.status(401).json({
      success: false,
      message: 'Access denied: No authentication token provided',
    });
  }
};

// Middleware to restrict access to Admin role only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Admin access privileges required',
    });
  }
};

module.exports = { protect, adminOnly };
