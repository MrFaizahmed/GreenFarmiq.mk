const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const stripe = require('stripe');
const { v4: uuidv4 } = require('uuid');
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const User = require('../models/User');

// Initialize payment gateways
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

// @route   POST /api/payments/create-order
// @desc    Create payment order for Razorpay
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    
    // Validate order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Check if order belongs to user (for buyers) or user is the farmer
    if (req.userType === 'buyer' && order.buyerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to pay for this order' 
      });
    }
    
    if (req.userType === 'farmer' && order.farmerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to process payment for this order' 
      });
    }
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${orderId}_${uuidv4().substring(0, 8)}`,
      payment_capture: 1 // Auto-capture payment
    };
    
    const razorpayOrder = await razorpay.orders.create(options);
    
    // Create payment record
    const payment = new Payment({
      orderId: orderId,
      userId: req.userId,
      amount: amount,
      currency: 'INR',
      paymentMethod: 'razorpay',
      paymentId: razorpayOrder.id,
      status: 'pending'
    });
    
    await payment.save();
    
    res.json({
      success: true,
      paymentId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      orderId: razorpayOrder.receipt
    });
    
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating payment order',
      error: error.message 
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Verify payment signature
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');
    
    if (digest !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }
    
    // Find payment record
    const payment = await Payment.findOne({ paymentId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment record not found' 
      });
    }
    
    // Update payment status
    payment.status = 'completed';
    payment.gatewayResponse = req.body;
    await payment.save();
    
    // Update order payment status
    const order = await Order.findById(payment.orderId);
    if (order) {
      order.paymentStatus = 'paid';
      await order.save();
    }
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error verifying payment',
      error: error.message 
    });
  }
});

// @route   POST /api/payments/stripe/create-payment-intent
// @desc    Create Stripe payment intent
// @access  Private
router.post('/stripe/create-payment-intent', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    
    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Create Stripe payment intent
    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'inr',
      metadata: {
        orderId: orderId,
        userId: req.userId
      }
    });
    
    // Create payment record
    const payment = new Payment({
      orderId: orderId,
      userId: req.userId,
      amount: amount,
      currency: 'INR',
      paymentMethod: 'stripe',
      paymentId: paymentIntent.id,
      status: 'pending'
    });
    
    await payment.save();
    
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating payment intent',
      error: error.message 
    });
  }
});

// @route   POST /api/payments/wallet
// @desc    Pay using wallet balance
// @access  Private
router.post('/wallet', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    
    // Validate order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    
    // Get user wallet
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if user has sufficient balance
    if (user.wallet.balance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Insufficient wallet balance' 
      });
    }
    
    // Deduct amount from wallet
    user.wallet.balance -= amount;
    user.wallet.transactions.push({
      type: 'debit',
      amount: amount,
      description: `Payment for order ${order.orderId}`,
      orderId: orderId
    });
    
    // Create payment record
    const payment = new Payment({
      orderId: orderId,
      userId: req.userId,
      amount: amount,
      currency: 'INR',
      paymentMethod: 'wallet',
      paymentId: `wallet_${uuidv4()}`,
      status: 'completed',
      gatewayResponse: { method: 'wallet' }
    });
    
    await payment.save();
    await user.save();
    
    // Update order payment status
    order.paymentStatus = 'paid';
    await order.save();
    
    res.json({
      success: true,
      message: 'Payment completed successfully',
      paymentId: payment.paymentId,
      remainingBalance: user.wallet.balance
    });
    
  } catch (error) {
    console.error('Wallet payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing wallet payment',
      error: error.message 
    });
  }
});

// @route   GET /api/payments/user/:userId
// @desc    Get user payment history
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    // Only allow users to view their own payment history
    if (req.userId.toString() !== req.params.userId && req.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this payment history' 
      });
    }
    
    const payments = await Payment.find({ userId: req.params.userId })
      .populate('orderId', 'orderId totalPrice status')
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      payments
    });
    
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payment history',
      error: error.message 
    });
  }
});

// @route   GET /api/payments/order/:orderId
// @desc    Get payment details for an order
// @access  Private
router.get('/order/:orderId', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId })
      .populate('userId', 'name email')
      .populate('orderId');
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }
    
    // Check authorization
    if (req.userId.toString() !== payment.userId.toString() && req.userType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this payment' 
      });
    }
    
    res.json({
      success: true,
      payment
    });
    
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching payment details',
      error: error.message 
    });
  }
});

module.exports = router;