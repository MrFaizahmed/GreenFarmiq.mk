import React, { useState } from 'react';
import { productListingService } from '../services/api';

const TestBuyerPosting = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBuyerPosting = async () => {
    setLoading(true);
    try {
      const requirementData = {
        title: 'Test Organic Vegetables',
        description: 'Testing buyer posting functionality',
        category: 'vegetables',
        quantityRequired: 100,
        unit: 'kg',
        qualityRequirements: 'Organic',
        deliveryDate: '2026-02-20',
        deliveryLocation: 'Test Location',
        budget: {
          minPrice: 50,
          maxPrice: 100
        }
      };

      console.log('Sending requirement data:', requirementData);
      
      const response = await productListingService.createListing(requirementData);
      console.log('Response from API:', response);
      
      setResult({
        success: response._id ? true : false,
        data: response
      });
    } catch (error) {
      console.error('Error:', error);
      setResult({
        success: false,
        data: error.message
      });
    }
    setLoading(false);
  };

  return (
    <div className="main-container">
      <h1 className="page-title">Test Buyer Posting</h1>
      
      <div className="card">
        <h2>Test Buyer Posting Functionality</h2>
        <button 
          onClick={testBuyerPosting}
          className="btn-action btn-bid"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Buyer Posting'}
        </button>
        
        {result && (
          <div className="mt-4">
            <p><strong>Status:</strong> {result.success ? '✅ Success' : '❌ Failed'}</p>
            <pre>{JSON.stringify(result.data, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestBuyerPosting;