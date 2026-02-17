// Test API connection from frontend
const testAPIConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test the root endpoint
    const response = await fetch('http://localhost:5000/');
    const data = await response.text();
    console.log('Root endpoint response:', data);
    
    // Test product listings endpoint (should return 401 without auth)
    try {
      const listingsResponse = await fetch('http://localhost:5000/api/product-listings');
      console.log('Product listings endpoint status:', listingsResponse.status);
      const listingsData = await listingsResponse.json();
      console.log('Product listings response:', listingsData);
    } catch (error) {
      console.log('Product listings endpoint error (expected):', error.message);
    }
    
    console.log('✅ API connection test completed');
  } catch (error) {
    console.error('❌ API connection test failed:', error.message);
  }
};

// Run the test
testAPIConnection();