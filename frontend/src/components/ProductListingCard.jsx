import React from 'react';

const ProductListingCard = ({ listing, onViewDetails }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  return (
    <div className="card buyer-card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-farm-dark-green">{listing.title}</h3>
          <p className="text-gray-600">{listing.description.substring(0, 100)}...</p>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-semibold">Category:</span> {listing.category}</div>
            <div><span className="font-semibold">Quantity:</span> {listing.quantityRequired} {listing.unit}</div>
            <div><span className="font-semibold">Delivery:</span> {formatDate(listing.deliveryDate)}</div>
            <div><span className="font-semibold">Location:</span> {listing.deliveryLocation}</div>
            <div><span className="font-semibold">Budget:</span> ₹{listing.budget.minPrice || '0'} - ₹{listing.budget.maxPrice}</div>
            {listing.qualityRequirements && (
              <div><span className="font-semibold">Quality:</span> {listing.qualityRequirements}</div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Posted by</div>
          <div className="font-semibold">{listing.postedBy?.name}</div>
          <div className="text-sm text-gray-600">{listing.postedBy?.location}</div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button 
          onClick={() => onViewDetails(listing)}
          className="btn-action btn-bid"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductListingCard;