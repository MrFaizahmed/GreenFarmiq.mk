const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authorize, adminOnly } = require('../middleware/auth');
const { sanitizeUserData, isValidEmail, isValidPhone, isStrongPassword } = require('../utils/validation');

// @route   POST api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('userType').isIn(['farmer', 'buyer', 'admin']).withMessage('Invalid user type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    // Sanitize inputs (convert sanitize exceptions to 400 instead of 500)
    let clean;
    try {
      clean = sanitizeUserData(req.body);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input',
        error: e.message
      });
    }
    const { name, email, password, userType, phone, location, farmDetails, businessDetails } = clean;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      userType,
      phone,
      location,
      ...(userType === 'farmer' && farmDetails && { farmDetails }),
      ...(userType === 'buyer' && businessDetails && { businessDetails })
    });

    // Hash password
    const salt = await bcrypt.genSalt(12);
    newUser.password = await bcrypt.hash(password, salt);

    // Save user
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        userType: newUser.userType,
        phone: newUser.phone,
        location: newUser.location
      }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    console.error('Registration error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: err.message 
    });
  }
});

// @route   POST api/users/login
// @desc    Login a user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(400).json({ 
        success: false,
        message: 'Account is deactivated. Please contact admin.' 
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        phone: user.phone,
        location: user.location,
        kyc: user.kyc,
        wallet: user.wallet
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: err.message 
    });
  }
});

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching profile',
      error: err.message 
    });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().notEmpty().withMessage('Phone cannot be empty'),
  body('location').optional().notEmpty().withMessage('Location cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, phone, location, preferences } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (location) updateFields.location = location;
    if (preferences) updateFields.preferences = preferences;
    
    updateFields.updatedAt = Date.now();
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    console.error('Profile update error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating profile',
      error: err.message 
    });
  }
});

// @route   GET api/users/wallet
// @desc    Get user wallet balance and transactions
// @access  Private
router.get('/wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('wallet');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      wallet: user.wallet
    });
  } catch (err) {
    console.error('Wallet fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching wallet',
      error: err.message 
    });
  }
});

// @route   GET api/users/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/admin/users', auth, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 10, userType, isActive } = req.query;
    
    const query = {};
    if (userType) query.userType = userType;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Admin users fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching users',
      error: err.message 
    });
  }
});

// @route   PUT api/users/admin/:userId/status
// @desc    Update user status (Admin only)
// @access  Private/Admin
router.put('/admin/:userId/status', auth, adminOnly, async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (err) {
    console.error('User status update error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating user status',
      error: err.message 
    });
  }
});

module.exports = router;
