const mongoose = require('mongoose');

// Test MongoDB Atlas connection
async function testConnection() {
  try {
    console.log('Testing MongoDB Atlas connection...');
    
    // Connect to MongoDB Atlas
    await mongoose.connect('mongodb+srv://test-mk:G7645SY875FixbXZ@test.ayhhmoa.mongodb.net/agricultural-marketplace?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    // Test data insertion
    const testSchema = new mongoose.Schema({
      name: String,
      timestamp: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    // Insert test data
    const testData = new TestModel({
      name: 'Connection Test - ' + new Date().toISOString()
    });
    
    await testData.save();
    console.log('✅ Test data inserted successfully!');
    
    // Retrieve test data
    const retrievedData = await TestModel.find().sort({ timestamp: -1 }).limit(5);
    console.log('✅ Retrieved test data:');
    console.log(retrievedData);
    
    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();