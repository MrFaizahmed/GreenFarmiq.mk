const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://test-mk:G7645SY875FixbXZ@test.ayhhmoa.mongodb.net/agricultural-marketplace?retryWrites=true&w=majority');
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      await mongoose.connection.close();
      return;
    }
    
    // Create a test user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
      userType: 'buyer',
      location: 'Test City, Test State',
      phone: '1234567890'
    });
    
    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestUser();