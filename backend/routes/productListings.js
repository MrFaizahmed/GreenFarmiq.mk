const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const ProductListing = require('../models/ProductListing');
const { sanitizeProductListingData, isValidPrice, isValidQuantity, sanitizeInput } = require('../utils/validation');

// @route   POST api/product-listings
// @desc    Create a new product listing
// @access  Private (Buyers only)
router.post('/', auth, authorize('buyer'), async (req, res) => {
  try {
    const { title, description, category, quantityRequired, unit, qualityRequirements, deliveryDate, deliveryLocation, budget } = req.body;

    // Sanitize inputs
    const sanitizedData = sanitizeProductListingData({
      title,
      description,
      category,
      quantityRequired,
      unit,
      qualityRequirements,
      deliveryDate,
      deliveryLocation,
      budget
    });

    // Validate required fields
    if (!sanitizedData.title || !sanitizedData.description || !sanitizedData.category || 
        !sanitizedData.quantityRequired || !sanitizedData.unit || !sanitizedData.deliveryDate || 
        !sanitizedData.deliveryLocation || !sanitizedData.budget) {
      return res.status(400).json({ 
        success: false,
        message: 'Please enter all required fields' 
      });
    }

    // Validate quantity
    if (!isValidQuantity(sanitizedData.quantityRequired)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid quantity format' 
      });
    }

    // Validate budget range
    if (sanitizedData.budget.minPrice !== undefined && sanitizedData.budget.maxPrice !== undefined) {
      if (parseFloat(sanitizedData.budget.minPrice) < 0 || parseFloat(sanitizedData.budget.maxPrice) < 0) {
        return res.status(400).json({ 
          success: false,
          message: 'Budget values must be positive numbers' 
        });
      }
      if (parseFloat(sanitizedData.budget.minPrice) > parseFloat(sanitizedData.budget.maxPrice)) {
        return res.status(400).json({ 
          success: false,
          message: 'Minimum budget cannot be greater than maximum budget' 
        });
      }
    }

    // Validate delivery date (should not be in the past)
    const deliveryDateTime = new Date(sanitizedData.deliveryDate);
    if (deliveryDateTime < new Date()) {
      return res.status(400).json({ 
        success: false,
        message: 'Delivery date cannot be in the past' 
      });
    }

    const newProductListing = new ProductListing({
      title: sanitizedData.title,
      description: sanitizedData.description,
      category: sanitizedData.category,
      quantityRequired: sanitizedData.quantityRequired,
      unit: sanitizedData.unit,
      qualityRequirements: sanitizedData.qualityRequirements,
      deliveryDate: sanitizedData.deliveryDate,
      deliveryLocation: sanitizedData.deliveryLocation,
      budget: sanitizedData.budget,
      postedBy: req.userId
    });

    const productListing = await newProductListing.save();
    res.status(201).json({
      success: true,
      message: 'Product listing created successfully',
      productListing
    });
  } catch (err) {
    console.error('Product listing creation error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error creating product listing',
      error: err.message 
    });
  }
});

// @route   GET api/product-listings
// @desc    Get all product listings
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, location, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Add filters
    if (category) query.category = category;
    if (location) query.deliveryLocation = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      query['budget.minPrice'] = {};
      if (minPrice) query['budget.minPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['budget.minPrice'].$lte = parseFloat(maxPrice);
    }
    
    const productListings = await ProductListing.find(query)
      .populate('postedBy', ['name', 'location', 'email'])
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });
    
    const total = await ProductListing.countDocuments(query);
    
    res.json({
      success: true,
      productListings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Product listings fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching product listings',
      error: err.message 
    });
  }
});

// @route   GET api/product-listings/:id
// @desc    Get a specific product listing
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const productListing = await ProductListing.findById(req.params.id)
      .populate('postedBy', ['name', 'location', 'email'])
      .populate('bids.farmerId', ['name', 'location']);

    if (!productListing) {
      return res.status(404).json({ 
        success: false,
        message: 'Product listing not found' 
      });
    }

    res.json({
      success: true,
      productListing
    });
  } catch (err) {
    console.error('Product listing fetch error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching product listing',
      error: err.message 
    });
  }
});

// @route   PUT api/product-listings/:id
// @desc    Update a product listing
// @access  Private (Owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const productListing = await ProductListing.findById(req.params.id);

    if (!productListing) {
      return res.status(404).json({ 
        success: false,
        message: 'Product listing not found' 
      });
    }

    // Check if user owns the listing
    if (productListing.postedBy.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this listing' 
      });
    }

    // Prevent updates if listing already has accepted bids
    const hasAcceptedBids = productListing.bids.some(bid => bid.bidStatus === 'accepted');
    if (hasAcceptedBids) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot update listing with accepted bids' 
      });
    }

    const updatedFields = {};
    const fieldsToUpdate = ['title', 'description', 'category', 'quantityRequired', 'unit', 
                           'qualityRequirements', 'deliveryDate', 'deliveryLocation', 'budget', 'status'];

    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        // Sanitize the field value
        updatedFields[field] = sanitizeInput(req.body[field]);
      }
    });

    // Validate delivery date if updating
    if (updatedFields.deliveryDate) {
      const deliveryDateTime = new Date(updatedFields.deliveryDate);
      if (deliveryDateTime < new Date()) {
        return res.status(400).json({ 
          success: false,
          message: 'Delivery date cannot be in the past' 
        });
      }
    }

    const updatedListing = await ProductListing.findByIdAndUpdate(
      req.params.id,
      { $set: updatedFields },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Product listing updated successfully',
      productListing: updatedListing
    });
  } catch (err) {
    console.error('Product listing update error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error updating product listing',
      error: err.message 
    });
  }
});

// @route   DELETE api/product-listings/:id
// @desc    Delete a product listing
// @access  Private (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const productListing = await ProductListing.findById(req.params.id);

    if (!productListing) {
      return res.status(404).json({ 
        success: false,
        message: 'Product listing not found' 
      });
    }

    // Check if user owns the listing
    if (productListing.postedBy.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this listing' 
      });
    }

    // Prevent deletion if listing has accepted bids
    const hasAcceptedBids = productListing.bids.some(bid => bid.bidStatus === 'accepted');
    if (hasAcceptedBids) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot delete listing with accepted bids' 
      });
    }

    await ProductListing.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Product listing deleted successfully'
    });
  } catch (err) {
    console.error('Product listing deletion error:', err.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error deleting product listing',
      error: err.message 
    });
  }
});

module.exports = router;
