import React, { useState } from 'react';

const PlaceBidForm = ({ productListing, onSubmit, onCancel }) => {
  const [bidData, setBidData] = useState({
    quantityOffered: productListing.quantityRequired,
    unitPrice: '',
    deliveryDate: productListing.deliveryDate,
    qualityInfo: '',
    message: ''
  });

  const handleChange = (e) => {
    setBidData({
      ...bidData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!bidData.quantityOffered || !bidData.unitPrice || !bidData.deliveryDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Prepare data for submission
    const bidSubmission = {
      productListingId: productListing._id,
      ...bidData,
      quantityOffered: parseInt(bidData.quantityOffered),
      unitPrice: parseFloat(bidData.unitPrice),
      totalPrice: bidData.quantityOffered * bidData.unitPrice
    };

    // Submit the bid
    if (onSubmit) {
      onSubmit(bidSubmission);
    }
  };

  return (
    <div className="card farm-card p-6">
      <h3 className="text-xl font-bold text-farm-dark-green mb-4">Place Your Bid</h3>
      
      <div className="mb-4 p-3 bg-farm-light-green rounded">
        <h4 className="font-semibold">{productListing.title}</h4>
        <p className="text-sm text-gray-600">Requirement: {productListing.quantityRequired} {productListing.unit}</p>
        <p className="text-sm text-gray-600">Budget: ₹{productListing.budget.minPrice || '0'} - ₹{productListing.budget.maxPrice}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="quantityOffered" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity You Offer *
            </label>
            <input
              type="number"
              id="quantityOffered"
              name="quantityOffered"
              value={bidData.quantityOffered}
              onChange={handleChange}
              min="1"
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Unit Price (₹) *
            </label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={bidData.unitPrice}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="Price per unit"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Date *
          </label>
          <input
            type="date"
            id="deliveryDate"
            name="deliveryDate"
            value={bidData.deliveryDate}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="qualityInfo" className="block text-sm font-medium text-gray-700 mb-1">
            Quality Information
          </label>
          <input
            type="text"
            id="qualityInfo"
            name="qualityInfo"
            value={bidData.qualityInfo}
            onChange={handleChange}
            placeholder="Grade, certification, freshness, etc."
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message to Buyer
          </label>
          <textarea
            id="message"
            name="message"
            value={bidData.message}
            onChange={handleChange}
            placeholder="Any additional information..."
            rows="3"
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div className="bg-yellow-50 p-3 rounded mb-4">
          <p className="text-sm font-semibold">
            Estimated Total: ₹{(bidData.quantityOffered * bidData.unitPrice).toFixed(2)}
          </p>
        </div>

        <div className="flex space-x-3">
          <button type="submit" className="btn-action btn-bid flex-1">
            Submit Bid
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="btn-action btn-secondary flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlaceBidForm;