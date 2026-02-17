import React from 'react';

const BidCard = ({ bid, onStatusChange }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card farm-card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-farm-dark-green">{bid.productListingId?.title}</h3>
          <p className="text-gray-600 text-sm">{bid.productListingId?.description.substring(0, 80)}...</p>
          
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-semibold">Offered:</span> {bid.quantityOffered} {bid.productListingId?.unit}</div>
            <div><span className="font-semibold">Unit Price:</span> ₹{bid.unitPrice}</div>
            <div><span className="font-semibold">Total:</span> ₹{bid.totalPrice}</div>
            <div><span className="font-semibold">Delivery:</span> {formatDate(bid.deliveryDate)}</div>
          </div>
          
          {bid.message && (
            <div className="mt-2 text-sm">
              <span className="font-semibold">Message:</span> {bid.message}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bid.bidStatus)}`}>
            {bid.bidStatus.charAt(0).toUpperCase() + bid.bidStatus.slice(1)}
          </div>
          <div className="mt-2 text-sm">
            <div className="font-semibold">{bid.buyerId?.name}</div>
            <div className="text-gray-600">{bid.buyerId?.location}</div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500">
          Placed on {formatDate(bid.createdAt)}
        </div>
        
        {bid.bidStatus === 'pending' && onStatusChange && (
          <div className="flex space-x-2">
            <button 
              onClick={() => onStatusChange(bid._id, 'accepted')}
              className="btn-action btn-bid text-xs px-3 py-1"
            >
              Accept
            </button>
            <button 
              onClick={() => onStatusChange(bid._id, 'rejected')}
              className="btn-action btn-secondary text-xs px-3 py-1"
            >
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidCard;