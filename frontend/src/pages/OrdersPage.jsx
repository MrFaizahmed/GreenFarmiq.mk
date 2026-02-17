import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { orderService, productListingService } from '../services/api';
import { toast } from 'react-toastify';

const OrdersPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const params = new URLSearchParams(location.search);
  const initialTab = params.get('tab') === 'myListings' ? 'myListings' : 'orders';
  const [tab, setTab] = useState(initialTab); // 'orders' | 'myListings'
  const [myListings, setMyListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const Spinner = ({ size = 40, color = '#16a34a' }) => (
    <div
      style={{
        width: size,
        height: size,
        border: `${size * 0.12}px solid #e5e7eb`,
        borderTop: `${size * 0.12}px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}
    />
  );
  const MiniSpinner = () => <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders({ status: filter === 'all' ? undefined : filter });
      
      if (response.success) {
        setOrders(response.orders || []);
      } else {
        setError(response.message || 'Failed to fetch orders');
        toast.error(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('An error occurred while fetching orders');
      toast.error('Failed to fetch orders');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);
  useEffect(() => {
    fetchOrders();
  }, [filter, fetchOrders]);

  const fetchMyListings = useCallback(async () => {
    try {
      setListingsLoading(true);
      const res = await productListingService.getAllListings();
      const listings = Array.isArray(res) ? res : (res?.productListings || []);
      const mine = listings.filter(l => {
            const postedBy = l.postedBy;
            const postedById =
              typeof postedBy === 'string'
                ? postedBy
                : (postedBy && (postedBy._id || postedBy.id));
            const currentUserId = user?._id || user?.id;
            return postedById && currentUserId && String(postedById) === String(currentUserId);
          });
      setMyListings(mine);
    } catch {
      toast.error('Failed to load your posted requirements');
    } finally {
      setListingsLoading(false);
    }
  }, [user?._id, user?.id]);
  useEffect(() => {
    if (user?.userType === 'buyer' && tab === 'myListings') {
      fetchMyListings();
    }
  }, [tab, user?.userType, fetchMyListings]);

  useEffect(() => {
    const desired = `?tab=${tab}`;
    if (location.search !== desired) {
      navigate({ search: desired }, { replace: true });
    }
  }, [tab, location.search, navigate]);

  

  

  const handleStatusChange = async (orderId, newStatus, cancellationReason = null) => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus, cancellationReason);
      
      if (response.success) {
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        toast.success('Order status updated successfully');
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (err) {
      toast.error('An error occurred while updating order status');
      console.error(err);
    }
  };

  // payments disabled

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // payments disabled

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  if (loading) {
    return (
      <div className="main-container flex justify-center items-center h-64">
        <Spinner size={80} color="#16a34a" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-xl font-bold mb-2">Error Loading Orders</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchOrders}
            className="btn-action btn-bid"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="page-title">My Orders</h1>
          <p className="text-gray-600">Manage your orders and track their status</p>
          {user?.userType === 'buyer' && (
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setTab('orders')}
                className={`px-4 py-2 rounded ${tab === 'orders' ? 'btn-action btn-bid' : 'border'}`}
              >
                Orders
              </button>
              <button
                onClick={() => setTab('myListings')}
                className={`px-4 py-2 rounded ${tab === 'myListings' ? 'btn-action btn-post' : 'border'}`}
              >
                My Requirements
              </button>
            </div>
          )}
        </div>
        {tab === 'orders' && (
          <div className="flex flex-wrap gap-2">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="form-control"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        )}
      </div>

      {tab === 'orders' ? (
        filteredOrders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-bold mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all' 
              ? 'You haven\'t placed any orders yet.' 
              : `No ${filter} orders found.`}
          </p>
          {user?.userType === 'buyer' && (
            <a href="/view-requirements" className="btn-action btn-post">
              Browse Requirements
            </a>
          )}
        </div>
        ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => (
            <div key={order._id} className="card">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4 gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-lg font-bold">Order #{order.orderId}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    {/* payment status removed */}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600">
                      <span className="font-semibold">Product:</span> {order.productListingId?.title}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Category:</span> {order.productListingId?.category}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Quantity:</span> {order.quantity} {order.unit}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Unit Price:</span> ₹{order.unitPrice?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Total:</span> ₹{order.totalPrice?.toLocaleString('en-IN')}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-semibold">Delivery Date:</span> {formatDate(order.deliveryDate)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right lg:text-left">
                  <p className="text-sm text-gray-500 mb-2">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  {user?.userType === 'buyer' ? (
                    <div>
                      <p className="text-sm font-semibold">
                        Seller: {order.farmerId?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.farmerId?.location}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold">
                        Buyer: {order.buyerId?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.buyerId?.businessDetails?.businessName || order.buyerId?.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <span className="font-semibold">Delivery Location:</span>
                    <p className="text-gray-600">{order.deliveryLocation}</p>
                  </div>
                  <div>
                    <span className="font-semibold">Quality Info:</span>
                    <p className="text-gray-600">{order.qualityInfo || 'Standard'}</p>
                  </div>
                  {/* payment method removed */}
                </div>
                
                {order.specialInstructions && (
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <span className="font-semibold text-blue-800">Special Instructions:</span>
                    <p className="mt-1 text-blue-700">{order.specialInstructions}</p>
                  </div>
                )}

                {order.cancellationReason && (
                  <div className="mb-4 p-3 bg-red-50 rounded border border-red-200">
                    <span className="font-semibold text-red-800">Cancellation Reason:</span>
                    <p className="mt-1 text-red-700">{order.cancellationReason}</p>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
                {/* payments removed */}

                {/* Status Update Buttons */}
                {user?.userType === 'buyer' && order.status === 'pending' && (
                  <button 
                    onClick={() => handleStatusChange(order._id, 'confirmed')}
                    className="btn-action btn-bid text-sm"
                  >
                    Confirm Order
                  </button>
                )}
                
                {user?.userType === 'farmer' && order.status === 'confirmed' && (
                  <button 
                    onClick={() => handleStatusChange(order._id, 'processing')}
                    className="btn-action btn-bid text-sm"
                  >
                    Start Processing
                  </button>
                )}
                
                {user?.userType === 'farmer' && order.status === 'processing' && (
                  <button 
                    onClick={() => handleStatusChange(order._id, 'shipped')}
                    className="btn-action btn-post text-sm"
                  >
                    Mark as Shipped
                  </button>
                )}
                
                {user?.userType === 'buyer' && order.status === 'shipped' && (
                  <button 
                    onClick={() => handleStatusChange(order._id, 'delivered')}
                    className="btn-action btn-bid text-sm"
                  >
                    Mark as Delivered
                  </button>
                )}
                
                {order.status !== 'cancelled' && order.status !== 'completed' && (
                  <button 
                    onClick={() => {
                      const reason = prompt('Please enter cancellation reason:');
                      if (reason) {
                        handleStatusChange(order._id, 'cancelled', reason);
                      }
                    }}
                    className="btn-action btn-secondary text-sm"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        )
      ) : (
        <div>
          {listingsLoading ? (
            <div className="flex justify-center items-center h-40"><Spinner size={60} /></div>
          ) : myListings.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">No requirements posted</h3>
              <p className="text-gray-600 mb-6">Post a new requirement to receive bids from farmers</p>
              <a href="/post-requirement" className="btn-action btn-post">Post Requirement</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map(listing => (
                <div key={listing._id} className="card">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">{listing.title}</h3>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {listing.status || 'active'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{listing.category}</p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-semibold">Quantity:</span> {listing.quantityRequired} {listing.unit}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-semibold">Budget:</span> ₹{listing.budget?.minPrice || 0} - ₹{listing.budget?.maxPrice}
                  </p>
                  <p className="text-gray-600 text-sm mb-4">
                    <span className="font-semibold">Delivery:</span> {listing.deliveryLocation} • {new Date(listing.deliveryDate).toLocaleDateString('en-IN')}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {new Date(listing.createdAt).toLocaleDateString('en-IN')}
                    </span>
                    <a
                      href={`/matching/recommendations?listing=${listing._id}`}
                      className="btn-action btn-bid text-sm"
                      onClick={(e) => {
                        if (user?.userType === 'buyer') {
                          e.preventDefault();
                          alert('You are not farmer. Please register as farmer to place offer');
                        }
                      }}
                    >
                      Place Bid
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
