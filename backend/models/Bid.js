const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  productListingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductListing',
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantityOffered: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  qualityInfo: {
    type: String,
    trim: true
  },
  bidStatus: {
    type: String,
    default: 'pending',
    enum: ['pending', 'accepted', 'rejected', 'ordered']
  },
  message: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
bidSchema.index({ productListingId: 1 });
bidSchema.index({ farmerId: 1 });
bidSchema.index({ buyerId: 1 });
bidSchema.index({ bidStatus: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);
