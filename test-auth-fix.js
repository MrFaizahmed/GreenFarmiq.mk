const axios = require('axios');

// Test script to verify authentication functionality
async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...\n');
  
  // Assuming server is running on localhost:5000
  const BASE_URL = 'https://greenfarmiq-1.onrender.com/api';
  
  // Test user data
  const testUser = {
    name: 'Test User',
    email: `testuser_${Date.now()}@example.com`,  // Unique email each time
    password: 'password123',
    userType: 'buyer',
    phone: '1234567890',
    location: 'Test Location'
  };
  
  try {
    console.log('📝 Testing Registration...');
    
    // Test registration
    const registerResponse = await axios.post(`${BASE_URL}/users/register`, testUser);
    console.log('✅ Registration Response:', registerResponse.data.success);
    console.log('   Message:', registerResponse.data.message);
    
    if (!registerResponse.data.success) {
      console.error('❌ Registration failed:', registerResponse.data);
      return;
    }
    
    const token = registerResponse.data.token;
    console.log('🔑 Token received');
    
    // Test login with the same credentials
    console.log('\n🔐 Testing Login...');
    const loginResponse = await axios.post(`${BASE_URL}/users/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login Response:', loginResponse.data.success);
    console.log('   Message:', loginResponse.data.message);
    
    if (!loginResponse.data.success) {
      console.error('❌ Login failed:', loginResponse.data);
      return;
    }
    
    // Verify we get a valid token
    const newToken = loginResponse.data.token;
    if (!newToken) {
      console.error('❌ No token returned from login');
      return;
    }
    
    console.log('🔑 Valid token received');
    
    // Test accessing protected route with token
    console.log('\n🔒 Testing Protected Route Access...');
    const profileResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: {
        'x-auth-token': newToken
      }
    });
    
    console.log('✅ Profile Access Response:', profileResponse.data.success);
    console.log('   User:', profileResponse.data.user.name);
    
    if (!profileResponse.data.success) {
      console.error('❌ Profile access failed:', profileResponse.data);
      return;
    }
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('✅ Registration, login, and protected route access work correctly');
    
  } catch (error) {
    if (error.response) {
      console.error('❌ Request failed with status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else {
      console.error('❌ Network error or server not running:', error.message);
      console.log('\n💡 Make sure the backend server is running on http://localhost:5000');
    }
  }
}

// Run the test
testAuthFlow();
