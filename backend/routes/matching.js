const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ProductListing = require('../models/ProductListing');
const Bid = require('../models/Bid');
const User = require('../models/User');
const SmartMatching = require('../utils/smartMatching');

// @route   GET api/matching/best-farmers/:listingId
// @desc    Get top 3 matching farmers for a product listing
// @access  Private (Buyer only)
router.get('/best-farmers/:listingId', auth, async (req, res) => {
  try {
    const productListing = await ProductListing.findById(req.params.listingId);
    
    if (!productListing) {
      return res.status(404).json({ msg: 'Product listing not found' });
    }

    // Check if user is the owner of the listing
    if (productListing.postedBy.toString() !== req.userId) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Get all farmers
    const farmers = await User.find({ userType: 'farmer', isActive: true })
      .populate('farmDetails.cropsGrown')
      .populate('ratings');

    // Get all bids for this listing
    const bids = await Bid.find({ productListingId: req.params.listingId })
      .populate('farmerId', ['name', 'location', 'farmDetails', 'ratings']);

    // Use smart matching algorithm to find top 3 farmers
    const topMatches = SmartMatching.findBestMatches(productListing, farmers, bids);

    res.json(topMatches);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/matching/suitable-listings
// @desc    Get top 5 suitable product listings for a farmer
// @access  Private (Farmer only)
router.get('/suitable-listings', auth, async (req, res) => {
  try {
    // Check if user is a farmer
    if (req.userType !== 'farmer') {
      return res.status(401).json({ msg: 'Not authorized - farmers only' });
    }

    // Get farmer profile
    const farmer = await User.findById(req.userId)
      .populate('farmDetails.cropsGrown')
      .populate('ratings');

    // Get all active product listings
    const productListings = await ProductListing.find({ status: 'active' })
      .populate('postedBy', ['name', 'location', 'businessDetails']);

    // Use smart matching algorithm to get top 5 recommendations
    const recommendations = SmartMatching.getFarmerRecommendations(farmer, productListings);

    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/matching/check-compatibility
// @desc    Check compatibility of a bid with a product listing
// @access  Private
router.post('/check-compatibility', auth, async (req, res) => {
  try {
    const { productListingId, bidDetails } = req.body;

    const productListing = await ProductListing.findById(productListingId);
    
    if (!productListing) {
      return res.status(404).json({ msg: 'Product listing not found' });
    }

    // Calculate compatibility score
    const score = SmartMatching.calculateCompatibilityScore(productListing, bidDetails);

    res.json({ 
      score,
      message: getCompatibilityMessage(score)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Helper function to get compatibility message
function getCompatibilityMessage(score) {
  if (score >= 90) return 'Excellent match!';
  if (score >= 75) return 'Good match';
  if (score >= 60) return 'Fair match';
  if (score >= 40) return 'Poor match';
  return 'Not suitable';
}

module.exports = router;