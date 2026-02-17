const mongoose = require('mongoose');
require('dotenv').config();

// Test enhanced database features
async function testEnhancedFeatures() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📊 Existing collections:');
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });
    
    // Test models
    const User = require('./models/User');
    const ProductListing = require('./models/ProductListing');
    const Bid = require('./models/Bid');
    const Order = require('./models/Order');
    const Chat = require('./models/Chat');
    
    // Check current data counts
    console.log('\n📈 Current Database Statistics:');
    console.log(`  Users: ${await User.countDocuments()}`);
    console.log(`  Product Listings: ${await ProductListing.countDocuments()}`);
    console.log(`  Bids: ${await Bid.countDocuments()}`);
    console.log(`  Orders: ${await Order.countDocuments()}`);
    console.log(`  Chats: ${await Chat.countDocuments()}`);
    
    // Test enhanced user model
    console.log('\n🧪 Testing enhanced User model...');
    const testUser = await User.findOne();
    if (testUser) {
      console.log('  User model structure:');
      console.log(`    - userType: ${testUser.userType}`);
      console.log(`    - kyc: ${testUser.kyc ? '✓' : '✗'}`);
      console.log(`    - ratings: ${testUser.ratings ? '✓' : '✗'}`);
      console.log(`    - wallet: ${testUser.wallet ? '✓' : '✗'}`);
      console.log(`    - preferences: ${testUser.preferences ? '✓' : '✗'}`);
    }
    
    // Test enhanced bid model
    console.log('\n🧪 Testing enhanced Bid model...');
    const testBid = await Bid.findOne();
    if (testBid) {
      console.log(`  Bid status options: ${testBid.schema.path('bidStatus').enumValues.join(', ')}`);
    }
    
    console.log('\n✅ Enhanced features test complete!');
    console.log('\n🚀 Ready to run the enhanced agricultural marketplace application.');
    console.log('   All data will be stored in your MongoDB Atlas cluster.');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Enhanced features test failed:', error.message);
    process.exit(1);
  }
}

testEnhancedFeatures();