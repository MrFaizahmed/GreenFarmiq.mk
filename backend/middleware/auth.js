const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Basic authentication middleware
const auth = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ 
      success: false,
      message: 'No token, authorization denied' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is deactivated' 
      });
    }

    req.userId = user._id;
    req.userType = user.userType;
    req.user = user;

    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    res.status(401).json({ 
      success: false,
      message: 'Token is not valid' 
    });
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.userType)) {
      return res.status(403).json({ 
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}` 
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: 'Authentication required' 
    });
  }

  if (req.userType !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: 'Admin access required' 
    });
  }

  next();
};

module.exports = auth;
module.exports.authorize = authorize;
module.exports.adminOnly = adminOnly;