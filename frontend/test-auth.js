// Test authentication flow
const testAuthFlow = async () => {
  try {
    console.log('Testing authentication flow...');
    
    // Test login
    const loginResponse = await fetch('https://greenfarmiq-1.onrender.com/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);
    
    if (!loginData.token) {
      console.log('❌ Login failed');
      return;
    }
    
    console.log('✅ Login successful');
    
    // Test accessing protected route with token
    const protectedResponse = await fetch('https://greenfarmiq-1.onrender.com/api/product-listings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': loginData.token
      }
    });
    
    const protectedData = await protectedResponse.json();
    console.log('Protected route response:', protectedData);
    
    if (protectedResponse.status === 200) {
      console.log('✅ Protected route access successful');
    } else {
      console.log('❌ Protected route access failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

// Run the test
testAuthFlow();
