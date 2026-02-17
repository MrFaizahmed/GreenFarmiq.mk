import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { orderService, productListingService } from '../services/api';
import { toast } from 'react-toastify';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    activeListings: 0,
    revenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch orders assigned to this farmer
      const ordersResponse = await orderService.getOrders({});
      if (ordersResponse.success) {
        const orders = ordersResponse.orders || [];
        const farmerOrders = orders.filter(order => order.farmerId?._id === user?._id);
        setRecentOrders(farmerOrders.slice(0, 5));
        
        setDashboardData(prev => ({
          ...prev,
          totalOrders: farmerOrders.length,
          pendingOrders: farmerOrders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length,
          revenue: farmerOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
        }));
      }

      // Count active listings
      const listingsResponse = await productListingService.getAllListings();
      const list = Array.isArray(listingsResponse) ? listingsResponse : (listingsResponse?.productListings || []);
      const activeListings = list.filter(listing => {
        const ownerId = listing.postedBy?._id || listing.postedBy?.id || listing.createdBy?._id || listing.createdBy?.id;
        return ownerId === user?._id && listing.status !== 'completed';
      });
      setDashboardData(prev => ({
        ...prev,
        activeListings: activeListings.length
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="main-container flex justify-center items-center h-64">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="mb-8">
        <h1 className="page-title">Farmer Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Manage your products and orders.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card text-center p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">{dashboardData.totalOrders}</div>
          <div className="text-gray-600">Total Orders</div>
        </div>
        <div className="card text-center p-6">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{dashboardData.pendingOrders}</div>
          <div className="text-gray-600">Active Orders</div>
        </div>
        <div className="card text-center p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.activeListings}</div>
          <div className="text-gray-600">Active Listings</div>
        </div>
        <div className="card text-center p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">₹{dashboardData.revenue?.toLocaleString('en-IN')}</div>
          <div className="text-gray-600">Revenue</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/post-requirement" className="btn-action btn-post flex flex-col items-center justify-center p-4">
              <span className="text-2xl mb-2">🌱</span>
              <span>List Product</span>
            </Link>
            <Link to="/view-requirements" className="btn-action btn-bid flex flex-col items-center justify-center p-4">
              <span className="text-2xl mb-2">💼</span>
              <span>View Requirements</span>
            </Link>
            <Link to="/my-orders" className="btn-action btn-secondary flex flex-col items-center justify-center p-4">
              <span className="text-2xl mb-2">📦</span>
              <span>My Orders</span>
            </Link>
            
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Performance Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Completion Rate:</span>
              <span className="font-semibold text-green-600">92%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg. Delivery Time:</span>
              <span className="font-semibold">2 days</span>
            </div>
            <div className="flex justify-between">
              <span>Customer Rating:</span>
              <span className="font-semibold text-yellow-600">4.5 ⭐</span>
            </div>
            <div className="flex justify-between">
              <span>Repeat Customers:</span>
              <span className="font-semibold">65%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link to="/my-orders" className="text-green-600 hover:underline text-sm">View All</Link>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No recent orders
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order._id} className="flex justify-between items-center p-3 border-b last:border-b-0">
                  <div>
                    <div className="font-semibold">#{order.orderId}</div>
                    <div className="text-sm text-gray-600">{order.productListingId?.title}</div>
                    <div className="text-xs text-gray-500">{formatDate(order.createdAt)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{order.totalPrice?.toLocaleString('en-IN')}</div>
                    <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        
      </div>

      {/* Market Insights */}
      <div className="mt-8 card">
        <h2 className="text-xl font-bold mb-4">Market Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold mb-1">High Demand</h3>
            <p className="text-sm text-gray-600 mb-2">Tomatoes, Onions, Potatoes</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl mb-2">📉</div>
            <h3 className="font-semibold mb-1">Low Supply</h3>
            <p className="text-sm text-gray-600 mb-2">Organic Spinach, Kale</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-yellow-600 h-2 rounded-full" style={{width: '30%'}}></div>
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold mb-1">Best Prices</h3>
            <p className="text-sm text-gray-600 mb-2">Premium Fruits, Herbs</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{width: '90%'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
