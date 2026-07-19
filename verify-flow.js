// Direct test to verify buyer data flow to View Requirements
const verifyDataFlow = async () => {
  try {
    console.log('🔍 Verifying buyer data flow to View Requirements...\n');
    
    // Step 1: Login as buyer
    console.log('1. Logging in as buyer...');
    const loginResponse = await fetch('https://greenfarmiq-1.onrender.com/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginData.token) {
      console.log('❌ Login failed');
      return;
    }
    console.log('✅ Login successful\n');
    
    // Step 2: Post a new requirement
    console.log('2. Posting new buyer requirement...');
    const newRequirement = {
      title: 'Fresh Mangoes - Direct Test',
      description: 'Urgent requirement for fresh mangoes for export',
      category: 'fruits',
      quantityRequired: 5000,
      unit: 'kg',
      qualityRequirements: 'Grade A, Organic certified',
      deliveryDate: '2026-02-28',
      deliveryLocation: 'Chennai, Tamil Nadu',
      budget: { minPrice: 60, maxPrice: 95 }
    };
    
    const postResponse = await fetch('https://greenfarmiq-1.onrender.com/api/product-listings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': loginData.token
      },
      body: JSON.stringify(newRequirement)
    });
    
    const postData = await postResponse.json();
    if (postResponse.status !== 200) {
      console.log('❌ Failed to post requirement:', postData.msg);
      return;
    }
    console.log('✅ Requirement posted successfully');
    console.log('   Requirement ID:', postData._id);
    console.log('   Title:', postData.title);
    console.log('   Posted by:', postData.postedBy, '\n');
    
    // Step 3: Verify it appears in View Requirements (public API)
    console.log('3. Checking View Requirements page (public API)...');
    const viewResponse = await fetch('https://greenfarmiq-1.onrender.com/api/product-listings');
    const viewData = await viewResponse.json();
    
    if (viewResponse.status !== 200) {
      console.log('❌ Failed to fetch requirements:', viewData.msg);
      return;
    }
    
    console.log(`✅ Found ${viewData.length} total requirements`);
    
    // Check if our new requirement is in the list
    const postedRequirement = viewData.find(req => req._id === postData._id);
    
    if (postedRequirement) {
      console.log('✅ NEW REQUIREMENT FOUND in View Requirements!');
      console.log('   Title:', postedRequirement.title);
      console.log('   Category:', postedRequirement.category);
      console.log('   Quantity:', postedRequirement.quantityRequired, postedRequirement.unit);
      console.log('   Posted by:', postedRequirement.postedBy?.name);
      console.log('   Posted at:', new Date(postedRequirement.createdAt).toLocaleString());
    } else {
      console.log('❌ NEW REQUIREMENT NOT FOUND in View Requirements');
      console.log('   This indicates a data flow issue');
      console.log('   Debug info:');
      console.log('   - Posted ID:', postData._id);
      console.log('   - Available IDs:', viewData.map(r => r._id));
    }
    
    // Step 4: Show all current requirements
    console.log('\n📋 ALL CURRENT REQUIREMENTS:');
    viewData.forEach((req, index) => {
      console.log(`${index + 1}. ${req.title} (${req.category}) - ${req.quantityRequired} ${req.unit}`);
      console.log(`   Posted by: ${req.postedBy?.name || 'Unknown'}`);
      console.log(`   Location: ${req.deliveryLocation}`);
      console.log(`   Budget: ₹${req.budget?.minPrice || 0} - ₹${req.budget?.maxPrice}`);
      console.log(`   Date: ${new Date(req.createdAt).toLocaleDateString()}\n`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

verifyDataFlow();
