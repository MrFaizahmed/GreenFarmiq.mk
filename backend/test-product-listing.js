const mongoose = require('mongoose');
const ProductListing = require('./models/ProductListing');
const User = require('./models/User');

async function testProductListing() {
  try {
    console.log('Testing Product Listing creation...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://test-mk:G7645SY875FixbXZ@test.ayhhmoa.mongodb.net/agricultural-marketplace?retryWrites=true&w=majority');
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Create a test user (buyer)
    const testUser = new User({
      name: 'Test Buyer',
      email: 'testbuyer@example.com',
      password: 'password123',
      userType: 'buyer',
      location: 'Mumbai, Maharashtra'
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully!');
    
    // Create a test product listing
    const testListing = new ProductListing({
      title: 'Fresh Organic Tomatoes',
      description: 'High quality organic tomatoes for hotel supply',
      category: 'vegetables',
      quantityRequired: 100,
      unit: 'kg',
      qualityRequirements: 'Organic, Grade A',
      deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      deliveryLocation: 'Mumbai, Maharashtra',
      budget: {
        minPrice: 20,
        maxPrice: 35
      },
      postedBy: testUser._id
    });
    
    await testListing.save();
    console.log('✅ Test product listing created successfully!');
    
    // Retrieve the created listing
    const retrievedListing = await ProductListing.findById(testListing._id)
      .populate('postedBy', ['name', 'email']);
    
    console.log('✅ Retrieved product listing:');
    console.log(JSON.stringify(retrievedListing, null, 2));
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testProductListing();