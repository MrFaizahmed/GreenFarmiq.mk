import React, { useState, useEffect } from 'react';
import { bidService } from '../services/api';
import BidCard from '../components/BidCard';

const FarmerBidsPage = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      setLoading(true);
      const response = await bidService.getAllBids();
      if (response.success !== false) {
        setBids(response);
      } else {
        setError(response.msg || 'Failed to fetch bids');
      }
    } catch (err) {
      setError('An error occurred while fetching bids');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bidId, newStatus) => {
    try {
      const response = await bidService.updateBid(bidId, { bidStatus: newStatus });
      if (response.success !== false) {
        // Update the bid in the local state
        setBids(prevBids => 
          prevBids.map(bid => 
            bid._id === bidId ? { ...bid, bidStatus: newStatus } : bid
          )
        );
      } else {
        alert(response.msg || 'Failed to update bid status');
      }
    } catch (err) {
      alert('An error occurred while updating bid status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <h1>Your Bids</h1>
        <p>Loading your bids...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <h1>Your Bids</h1>
        <p className="text-red-500">{error}</p>
        <button onClick={fetchBids} className="btn-action btn-bid">Retry</button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <h1>Your Bids</h1>
      <p>Manage and track the status of your bids</p>
      
      {bids.length === 0 ? (
        <div className="card">
          <p>You haven't placed any bids yet.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Active Bids ({bids.filter(b => b.bidStatus === 'pending').length})</h2>
            {bids
              .filter(bid => bid.bidStatus === 'pending')
              .map(bid => (
                <BidCard 
                  key={bid._id} 
                  bid={bid} 
                  onStatusChange={handleStatusChange} 
                />
              ))}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2">Completed Bids ({bids.filter(b => b.bidStatus !== 'pending').length})</h2>
            {bids
              .filter(bid => bid.bidStatus !== 'pending')
              .map(bid => (
                <BidCard 
                  key={bid._id} 
                  bid={bid} 
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerBidsPage;