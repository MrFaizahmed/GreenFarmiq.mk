const mongoose = require('mongoose');

const productListingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  quantityRequired: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'ton', 'quintal', 'piece', 'liter', 'gram']
  },
  qualityRequirements: {
    type: String,
    trim: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  deliveryLocation: {
    type: String,
    required: true,
    trim: true
  },
  budget: {
    minPrice: {
      type: Number,
      min: 0
    },
    maxPrice: {
      type: Number,
      required: true,
      min: 0
    }
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'closed', 'completed']
  },
  bids: [{
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    quantityOffered: {
      type: Number,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    },
    bidStatus: {
      type: String,
      default: 'pending',
      enum: ['pending', 'accepted', 'rejected']
    },
    bidDate: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes for performance
productListingSchema.index({ status: 1, createdAt: -1 });
productListingSchema.index({ category: 1 });
productListingSchema.index({ deliveryLocation: 1 });
productListingSchema.index({ 'budget.minPrice': 1, 'budget.maxPrice': 1 });
productListingSchema.index({ postedBy: 1 });

module.exports = mongoose.model('ProductListing', productListingSchema);
