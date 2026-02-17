const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const Bid = require('../models/Bid');
const ProductListing = require('../models/ProductListing');
const { sanitizeBidData, isValidPrice, isValidQuantity, sanitizeInput } = require('../utils/validation');

// @route   POST api/bids
// @desc    Create a new bid
// @access  Private (Farmers only)
router.post('/', auth, authorize('farmer'), async (req, res) => {
  try {
    const { productListingId, quantityOffered, unitPrice, deliveryDate, qualityInfo, message } = req.body;

    // Validate required fields
    if (!productListingId || !quantityOffered || !unitPrice || !deliveryDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter all required fields' 
      });
    }

    // Validate quantity
    if (!isValidQuantity(quantityOffered)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid quantity format' 
      });
    }

    // Validate price
    if (!isValidPrice(unitPrice)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid price format' 
      });
    }

    // Validate delivery date (should not be in the past)
    const deliveryDateTime = new Date(deliveryDate);
    if (deliveryDateTime < new Date()) {
      return res.status(400).json({ 
        success: false,
        message: 'Delivery date cannot be in the past' 
      });
    }

    // Get the product listing to find the buyer
    const productListing = await ProductListing.findById(productListingId);
    if (!productListing) {
      return res.status(404).json({ 
        success: false,
        message: 'Product listing not found' 
      });
    }

    // Check if the farmer is trying to bid on their own listing
    if (productListing.postedBy.toString() === req.userId.toString()) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot bid on your own listing' 
      });
    }

    // Check if listing is still open for bidding
    if (productListing.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Bidding closed for this listing' 
      });
    }

    // Check if user has already placed a bid on this listing
    const existingBid = await Bid.findOne({
      productListingId: productListingId,
      farmerId: req.userId
    });

    if (existingBid) {
      return res.status(400).json({ 
        success: false,
        message: 'You have already placed a bid on this listing' 
      });
    }

    // Calculate total price
    const totalPrice = parseFloat(quantityOffered) * parseFloat(unitPrice);

    const newBid = new Bid({
      productListingId,
      farmerId: req.userId,
      buyerId: productListing.postedBy,
      quantityOffered,
      unitPrice,
      totalPrice,
      deliveryDate,
      qualityInfo: sanitizeInput(qualityInfo),
      message: sanitizeInput(message)
    });

    const bid = await newBid.save();
    res.status(201).json({
      success: true,
      message: 'Bid placed successfully',
      bid
    });
  } catch (err) {
    console.error('Bid creation error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating bid',
      error: err.message 
    });
  }
});

// @route   GET api/bids
// @desc    Get all bids for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let bids;
    
    let query = {};
    
    if (req.userType === 'farmer') {
      // Farmer gets their own bids
      query.farmerId = req.userId;
    } else if (req.userType === 'buyer') {
      // Buyer gets bids for their listings
      query.buyerId = req.userId;
    } else {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid user type' 
      });
    }
    
    // Add status filter if provided
    if (status) query.bidStatus = status;
    
    bids = await Bid.find(query)
      .populate('productListingId', ['title', 'description', 'quantityRequired', 'category'])
      .populate('farmerId', ['name', 'location', 'farmDetails'])
      .populate('buyerId', ['name', 'location', 'businessDetails'])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await Bid.countDocuments(query);
    
    res.json({
      success: true,
      bids,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Bids fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching bids',
      error: err.message 
    });
  }
});

// @route   GET api/bids/:id
// @desc    Get a specific bid
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id)
      .populate('productListingId', ['title', 'description', 'quantityRequired', 'category'])
      .populate('farmerId', ['name', 'location', 'farmDetails'])
      .populate('buyerId', ['name', 'location', 'businessDetails']);

    if (!bid) {
      return res.status(404).json({ 
        success: false,
        message: 'Bid not found' 
      });
    }

    // Check authorization - only farmer who placed bid or buyer who received it can view
    if (bid.farmerId.toString() !== req.userId && bid.buyerId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to view this bid' 
      });
    }

    res.json({
      success: true,
      bid
    });
  } catch (err) {
    console.error('Bid fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching bid',
      error: err.message 
    });
  }
});

// @route   PUT api/bids/:id
// @desc    Update a bid status (accept/reject)
// @access  Private (Buyer only)
router.put('/:id', auth, authorize('buyer'), async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ 
        success: false,
        message: 'Bid not found' 
      });
    }

    // Only buyer who received the bid can update bid status
    if (bid.buyerId.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this bid' 
      });
    }

    const { bidStatus, rejectionReason } = req.body;
    
    if (!['accepted', 'rejected', 'pending'].includes(bidStatus)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid bid status' 
      });
    }

    // Prevent accepting a bid if the listing is already completed
    const productListing = await ProductListing.findById(bid.productListingId);
    if (!productListing) {
      return res.status(404).json({ 
        success: false,
        message: 'Product listing not found' 
      });
    }

    if (productListing.status === 'completed') {
      return res.status(400).json({ 
        success: false,
        message: 'Listing already completed' 
      });
    }

    // If accepting bid, check if there are already accepted bids for this listing
    if (bidStatus === 'accepted') {
      const existingAcceptedBid = await Bid.findOne({
        productListingId: bid.productListingId,
        bidStatus: 'accepted'
      });

      if (existingAcceptedBid) {
        return res.status(400).json({ 
          success: false,
          message: 'Another bid has already been accepted for this listing' 
        });
      }
    }

    // Update bid status
    const updateData = { bidStatus };
    if (bidStatus === 'rejected' && rejectionReason) {
      updateData.rejectionReason = sanitizeInput(rejectionReason);
    }

    const updatedBid = await Bid.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('productListingId', ['title', 'description', 'quantityRequired', 'category'])
    .populate('farmerId', ['name', 'location', 'farmDetails'])
    .populate('buyerId', ['name', 'location', 'businessDetails']);

    // If bid is accepted, update the product listing status to completed
    if (bidStatus === 'accepted') {
      await ProductListing.findByIdAndUpdate(bid.productListingId, { status: 'completed' });
    }

    res.json({
      success: true,
      message: `Bid ${bidStatus} successfully`,
      bid: updatedBid
    });
  } catch (err) {
    console.error('Bid status update error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating bid status',
      error: err.message 
    });
  }
});

// @route   DELETE api/bids/:id
// @desc    Delete a bid
// @access  Private (Farmer only, if bid is pending)
router.delete('/:id', auth, async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id);
    if (!bid) {
      return res.status(404).json({ 
        success: false,
        message: 'Bid not found' 
      });
    }

    // Only farmer who placed the bid can delete it, and only if it's pending
    if (bid.farmerId.toString() !== req.userId || bid.bidStatus !== 'pending') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this bid' 
      });
    }

    await Bid.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Bid deleted successfully'
    });
  } catch (err) {
    console.error('Bid deletion error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting bid',
      error: err.message 
    });
  }
});

module.exports = router;