const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const Order = require('../models/Order');
const ProductListing = require('../models/ProductListing');
const Bid = require('../models/Bid');
const Payment = require('../models/Payment');
const { isValidPrice, isValidQuantity, sanitizeInput } = require('../utils/validation');

// @route   POST api/orders
// @desc    Create a new order from accepted bid
// @access  Private (Buyer only)
router.post('/', auth, authorize('buyer'), async (req, res) => {
  try {
    const { bidId, specialInstructions } = req.body;

    // Validate input
    if (!bidId) {
      return res.status(400).json({ 
        success: false,
        message: 'Bid ID is required' 
      });
    }

    // Get the bid
    const bid = await Bid.findById(bidId).populate('productListingId');
    if (!bid) {
      return res.status(404).json({ 
        success: false,
        message: 'Bid not found' 
      });
    }

    // Check if bid is accepted
    if (bid.bidStatus !== 'accepted') {
      return res.status(400).json({ 
        success: false,
        message: 'Only accepted bids can be converted to orders' 
      });
    }

    // Check if user is the buyer who received this bid
    if (bid.buyerId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to create order from this bid' 
      });
    }

    // Check if order already exists for this bid
    const existingOrder = await Order.findOne({ bidId });
    if (existingOrder) {
      return res.status(400).json({ 
        success: false,
        message: 'Order already exists for this bid' 
      });
    }

    // Create new order
    const newOrder = new Order({
      productListingId: bid.productListingId._id,
      buyerId: req.userId,
      farmerId: bid.farmerId,
      bidId: bid._id,
      quantity: bid.quantityOffered,
      unit: bid.productListingId.unit,
      unitPrice: bid.unitPrice,
      totalPrice: bid.totalPrice,
      deliveryDate: bid.deliveryDate,
      deliveryLocation: bid.productListingId.deliveryLocation,
      qualityInfo: bid.qualityInfo,
      specialInstructions
    });

    const order = await newOrder.save();

    // Update bid status to ordered
    await Bid.findByIdAndUpdate(bidId, { bidStatus: 'ordered' });

    // Update product listing status
    await ProductListing.findByIdAndUpdate(bid.productListingId._id, { status: 'completed' });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (err) {
    console.error('Order creation error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating order',
      error: err.message 
    });
  }
});

// @route   POST api/orders/direct
// @desc    Create a new order directly from a farmer offer
// @access  Private (Farmer only)
router.post('/direct', auth, authorize('farmer'), async (req, res) => {
  try {
    const { productListingId, quantity, unitPrice, deliveryDate, qualityInfo, specialInstructions } = req.body;

    if (!productListingId || !quantity || !unitPrice) {
      return res.status(400).json({
        success: false,
        message: 'Product listing, quantity and unit price are required'
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity format'
      });
    }

    if (!isValidPrice(unitPrice)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid unit price format'
      });
    }

    const productListing = await ProductListing.findById(productListingId);
    if (!productListing) {
      return res.status(404).json({
        success: false,
        message: 'Product listing not found'
      });
    }

    if (productListing.postedBy.toString() === req.userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create order on your own listing'
      });
    }

    const totalPrice = parseFloat(unitPrice) * parseFloat(quantity);

    const newOrder = new Order({
      productListingId: productListing._id,
      buyerId: productListing.postedBy,
      farmerId: req.userId,
      quantity: parseInt(quantity),
      unit: productListing.unit,
      unitPrice: parseFloat(unitPrice),
      totalPrice: totalPrice,
      deliveryDate: deliveryDate ? new Date(deliveryDate) : productListing.deliveryDate,
      deliveryLocation: productListing.deliveryLocation,
      qualityInfo: sanitizeInput(qualityInfo || ''),
      specialInstructions: sanitizeInput(specialInstructions || ''),
      status: 'pending'
    });

    const order = await newOrder.save();

    return res.status(201).json({
      success: true,
      message: 'Order created successfully from offer',
      order
    });
  } catch (err) {
    console.error('Direct order creation error:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error creating order from offer',
      error: err.message
    });
  }
});

// @route   GET api/orders
// @desc    Get all orders for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (req.userType === 'buyer') {
      query.buyerId = req.userId;
    } else if (req.userType === 'farmer') {
      query.farmerId = req.userId;
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid user type' 
      });
    }
    
    // Add filters
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const orders = await Order.find(query)
      .populate('productListingId', ['title', 'description', 'category'])
      .populate('buyerId', ['name', 'location', 'businessDetails'])
      .populate('farmerId', ['name', 'location', 'farmDetails'])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Order.countDocuments(query);
    
    res.json({
      success: true,
      orders,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Orders fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching orders',
      error: err.message 
    });
  }
});

// @route   GET api/orders/:id
// @desc    Get a specific order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('productListingId', ['title', 'description', 'quantityRequired', 'unit', 'category'])
      .populate('buyerId', ['name', 'location', 'businessDetails', 'phone'])
      .populate('farmerId', ['name', 'location', 'farmDetails', 'phone'])
      .populate('bidId', ['unitPrice', 'quantityOffered']);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check authorization
    if (order.buyerId._id.toString() !== req.userId && order.farmerId._id.toString() !== req.userId && req.userType !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this order' 
      });
    }

    // Get payment information
    const payment = await Payment.findOne({ orderId: order._id });
    
    res.json({
      success: true,
      order,
      payment: payment || null
    });
  } catch (err) {
    console.error('Order fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching order',
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check authorization
    if (req.userType === 'buyer' && order.buyerId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this order' 
      });
    }
    
    if (req.userType === 'farmer' && order.farmerId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this order' 
      });
    }

    // Validate status transition
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    // Handle cancellation
    if (status === 'cancelled') {
      if (!cancellationReason) {
        return res.status(400).json({ 
          success: false,
          message: 'Cancellation reason is required' 
        });
      }
      order.cancellationReason = cancellationReason;
    }

    // Update status and timestamps
    order.status = status;
    if (status === 'confirmed') {
      order.confirmedDate = new Date();
    } else if (status === 'completed' || status === 'delivered') {
      order.completedDate = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order
    });
  } catch (err) {
    console.error('Order status update error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating order status',
      error: err.message 
    });
  }
});

// @route   PUT api/orders/:id/payment
// @desc    Update payment status
// @access  Private (Buyer only)
router.put('/:id/payment', auth, authorize('buyer'), async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if user is the buyer
    if (order.buyerId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update payment status' 
      });
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment status' 
      });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      order
    });
  } catch (err) {
    console.error('Payment status update error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating payment status',
      error: err.message 
    });
  }
});

module.exports = router;
