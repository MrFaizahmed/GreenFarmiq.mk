const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const ProductListing = require('../models/ProductListing');
const Order = require('../models/Order');
const Bid = require('../models/Bid');

// Admin middleware - check if user is admin
const adminAuth = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(401).json({ msg: 'Access denied. Admin access required.' });
  }
  next();
};

// @route   GET api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    // Get statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$userType',
          count: { $sum: 1 }
        }
      }
    ]);

    const listingStats = await ProductListing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const orderStats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalPrice' }
        }
      }
    ]);

    // Recent activities
    const recentUsers = await User.find({}).sort({ createdAt: -1 }).limit(5);
    const recentOrders = await Order.find({}).populate('buyerId farmerId').sort({ createdAt: -1 }).limit(5);

    // Convert to object for easier frontend use
    const stats = {
      users: {
        farmers: userStats.find(s => s._id === 'farmer')?.count || 0,
        buyers: userStats.find(s => s._id === 'buyer')?.count || 0,
        admins: userStats.find(s => s._id === 'admin')?.count || 0,
        total: userStats.reduce((sum, s) => sum + s.count, 0)
      },
      listings: {
        active: listingStats.find(s => s._id === 'active')?.count || 0,
        completed: listingStats.find(s => s._id === 'completed')?.count || 0,
        total: listingStats.reduce((sum, s) => sum + s.count, 0)
      },
      orders: {
        total: orderStats.reduce((sum, s) => sum + s.count, 0),
        totalValue: orderStats.reduce((sum, s) => sum + s.totalValue, 0)
      }
    };

    res.json({
      stats,
      recentUsers: recentUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
        kycStatus: user.kyc?.status || 'pending'
      })),
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        buyer: order.buyerId?.name,
        farmer: order.farmerId?.name,
        total: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt
      }))
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/users
// @desc    Get all users with filtering and pagination
// @access  Private (Admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, userType, kycStatus, search } = req.query;
    
    let query = {};
    
    if (userType) query.userType = userType;
    if (kycStatus) query['kyc.status'] = kycStatus;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .populate('ratings.reviews.reviewerId', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        location: user.location,
        isActive: user.isActive,
        isVerified: user.isVerified,
        kyc: user.kyc,
        ratings: user.ratings,
        createdAt: user.createdAt
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/users/:id/kyc
// @desc    Update KYC status for a user
// @access  Private (Admin only)
router.put('/users/:id/kyc', auth, adminAuth, async (req, res) => {
  try {
    const { status, documents } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.kyc = {
      status,
      documents: documents || user.kyc?.documents || [],
      verifiedAt: status === 'verified' ? new Date() : undefined,
      verifiedBy: status === 'verified' ? req.userId : undefined
    };

    await user.save();

    res.json({
      msg: 'KYC status updated successfully',
      user: {
        id: user._id,
        name: user.name,
        kyc: user.kyc
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/admin/users/:id/status
// @desc    Update user active status
// @access  Private (Admin only)
router.put('/users/:id/status', auth, adminAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      msg: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/orders
// @desc    Get all orders with filtering
// @access  Private (Admin only)
router.get('/orders', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query)
      .populate('buyerId', 'name email')
      .populate('farmerId', 'name email')
      .populate('productListingId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders: orders.map(order => ({
        id: order._id,
        orderId: order.orderId,
        buyer: order.buyerId,
        farmer: order.farmerId,
        product: order.productListingId?.title,
        quantity: order.quantity,
        unit: order.unit,
        totalPrice: order.totalPrice,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/admin/analytics
// @desc    Get business analytics
// @access  Private (Admin only)
router.get('/analytics', auth, adminAuth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Revenue by month
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $in: ['completed', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalRevenue: { $sum: '$totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top categories
    const topCategories = await ProductListing.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'productListingId',
          as: 'orders'
        }
      },
      {
        $group: {
          _id: '$category',
          listingCount: { $sum: 1 },
          orderCount: { $sum: { $size: '$orders' } }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      monthlyRevenue,
      topCategories
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;