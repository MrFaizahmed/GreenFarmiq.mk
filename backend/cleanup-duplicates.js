const mongoose = require('mongoose');

// Import the ProductListing model
const ProductListing = require('./models/ProductListing');

// MongoDB connection string from .env
require('dotenv').config();

async function removeDuplicates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Find all product listings
    const allListings = await ProductListing.find().lean();
    console.log(`Found ${allListings.length} total listings`);

    // Group by content to identify duplicates
    const contentMap = new Map();
    const duplicates = [];
    
    for (const listing of allListings) {
      const contentKey = `${listing.title}-${listing.description}-${listing.category}-${listing.quantityRequired}-${listing.unit}-${listing.deliveryLocation}`;
      
      if (contentMap.has(contentKey)) {
        // This is a duplicate, add to removal list
        duplicates.push(listing._id.toString());
      } else {
        // First occurrence, store it
        contentMap.set(contentKey, listing._id.toString());
      }
    }

    console.log(`Found ${duplicates.length} duplicate listings to remove`);

    if (duplicates.length > 0) {
      // Remove duplicates (keep only the first occurrence of each)
      const result = await ProductListing.deleteMany({
        _id: { $in: duplicates }
      });

      console.log(`Removed ${result.deletedCount} duplicate listings`);
    } else {
      console.log('No duplicates found to remove');
    }

    // Show remaining listings
    const remainingListings = await ProductListing.find();
    console.log(`Remaining listings: ${remainingListings.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error removing duplicates:', error);
  }
}

// Run the function
removeDuplicates();