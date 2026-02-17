const mongoose = require('mongoose');
require('dotenv').config();

// Test database connection and create sample data
async function testDatabase() {
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
    
    // Create sample data if collections are empty
    const User = require('./models/User');
    const ProductListing = require('./models/ProductListing');
    const Bid = require('./models/Bid');
    const Order = require('./models/Order');
    
    // Check if we have any users
    const userCount = await User.countDocuments();
    console.log(`\n👥 Users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('\n🌱 Creating sample data...');
      
      // Create sample users
      const sampleBuyer = new User({
        name: 'Hotel Grand Plaza',
        email: 'hotel@grandplaza.com',
        password: 'hotel123',
        userType: 'buyer',
        location: 'Mumbai, Maharashtra',
        phone: '+919876543210',
        businessDetails: {
          businessType: 'hotel',
          businessName: 'Grand Plaza Hotel',
          gstNumber: 'GSTIN123456789'
        }
      });
      
      const sampleFarmer = new User({
        name: 'Raj Kumar Farms',
        email: 'raj@kumarfarms.com',
        password: 'farmer123',
        userType: 'farmer',
        location: 'Punjab, India',
        phone: '+919876543211',
        farmDetails: {
          farmSize: '50 acres',
          cropsGrown: ['wheat', 'rice', 'vegetables'],
          certifications: ['Organic Certified', 'ISO 22000']
        }
      });
      
      await sampleBuyer.save();
      await sampleFarmer.save();
      console.log('✅ Sample users created');
      
      // Create sample product listing
      const sampleListing = new ProductListing({
        title: 'Organic Basmati Rice - Bulk Order',
        description: 'Looking for high-quality organic basmati rice for hotel use. Need premium grade grains with proper certification.',
        category: 'grains',
        quantityRequired: 1000,
        unit: 'kg',
        qualityRequirements: 'Organic certified, premium grade, 100% pure',
        deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        deliveryLocation: 'Mumbai, Maharashtra',
        budget: {
          minPrice: 80,
          maxPrice: 120
        },
        postedBy: sampleBuyer._id,
        status: 'active'
      });
      
      await sampleListing.save();
      console.log('✅ Sample product listing created');
      
      // Create sample bid
      const sampleBid = new Bid({
        productListingId: sampleListing._id,
        farmerId: sampleFarmer._id,
        buyerId: sampleBuyer._id,
        quantityOffered: 1200,
        unitPrice: 95,
        totalPrice: 114000,
        deliveryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        qualityInfo: 'Organic certified, premium grade basmati rice',
        message: 'We can supply high-quality organic basmati rice at competitive prices. Our farm is certified organic and we have 20 years of experience.',
        bidStatus: 'pending'
      });
      
      await sampleBid.save();
      console.log('✅ Sample bid created');
    }
    
    // Display current data counts
    const listingCount = await ProductListing.countDocuments();
    const bidCount = await Bid.countDocuments();
    const orderCount = await Order.countDocuments();
    
    console.log('\n📈 Current Database Statistics:');
    console.log(`  Users: ${await User.countDocuments()}`);
    console.log(`  Product Listings: ${listingCount}`);
    console.log(`  Bids: ${bidCount}`);
    console.log(`  Orders: ${orderCount}`);
    
    console.log('\n✅ Database setup complete! All data will be stored in your MongoDB Atlas cluster.');
    
    mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    process.exit(1);
  }
}

testDatabase();