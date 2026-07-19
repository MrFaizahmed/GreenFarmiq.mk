// Test if the fixes are working
const testFixes = async () => {
  try {
    console.log('Testing if fixes are working...');
    
    // Test fetching all listings (this should now work in ViewRequirementsPage)
    const response = await fetch('https://greenfarmiq-1.onrender.com/api/product-listings', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    console.log('All listings response:', data);
    
    if (response.status === 200) {
      console.log('✅ View Requirements should now work - data fetched successfully');
      console.log('Number of listings:', data.length);
    } else {
      console.log('❌ View Requirements may still have issues:', data.msg);
    }
    
  } catch (error) {
    console.error('❌ Error testing fixes:', error.message);
  }
};

testFixes();
