const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBuyerPosting() {
  try {
    console.log('Testing buyer posting functionality...');
    
    // First, login to get a token
    const loginResponse = await fetch('http://localhost:5000/api/users/login', {
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
    
    // Test posting a requirement
    const requirementData = {
      title: 'Fresh Organic Apples',
      description: 'Looking for high-quality organic apples for hotel supply',
      category: 'fruits',
      quantityRequired: 500,
      unit: 'kg',
      qualityRequirements: 'Organic, Grade A',
      deliveryDate: '2026-02-20',
      deliveryLocation: 'Delhi, India',
      budget: {
        minPrice: 80,
        maxPrice: 120
      }
    };
    
    const postResponse = await fetch('http://localhost:5000/api/product-listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': loginData.token
      },
      body: JSON.stringify(requirementData)
    });
    
    const postData = await postResponse.json();
    console.log('Post requirement response:', postData);
    
    if (postResponse.status === 200) {
      console.log('✅ Requirement posted successfully!');
      console.log('Posted requirement ID:', postData._id);
      
      // Verify the data was stored by fetching all listings
      const listingsResponse = await fetch('http://localhost:5000/api/product-listings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': loginData.token
        }
      });
      
      const listingsData = await listingsResponse.json();
      console.log('All listings:', listingsData);
      
      // Find the posted requirement
      const postedRequirement = listingsData.find(listing => listing._id === postData._id);
      if (postedRequirement) {
        console.log('✅ Verified that requirement is stored in database:');
        console.log('Title:', postedRequirement.title);
        console.log('Category:', postedRequirement.category);
        console.log('Quantity:', postedRequirement.quantityRequired);
        console.log('Posted by:', postedRequirement.postedBy?.name);
      } else {
        console.log('❌ Could not find posted requirement in database');
      }
    } else {
      console.log('❌ Failed to post requirement:', postData.msg);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBuyerPosting();