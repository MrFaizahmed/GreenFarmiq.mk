import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productListingService, orderService } from '../services/api';

const Dashboard = () => {
  const [userType] = useState('buyer'); // This would come from auth context
  const [stats, setStats] = useState({
    listings: 0,
    bids: 0,
    orders: 0,
    activeListings: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  const loadDashboardData = useCallback(async () => {
    try {
      if (userType === 'buyer') {
        const listings = await productListingService.getAllListings();
        const orders = await orderService.getAllOrders();
        
        setStats({
          listings: listings.length || 0,
          bids: 0,
          orders: orders.length || 0,
          activeListings: listings.filter(l => l.status === 'active').length || 0
        });
        
        // Combine recent activity
        const activity = [
          ...listings.slice(0, 3).map(item => ({
            type: 'listing',
            title: item.title,
            date: item.createdAt,
            status: item.status
          })),
          ...orders.slice(0, 3).map(item => ({
            type: 'order',
            title: `Order #${item.orderId}`,
            date: item.createdAt,
            status: item.status
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setRecentActivity(activity);
      } else {
        const orders = await orderService.getAllOrders();
        setStats({
          listings: 0,
          bids: 0,
          orders: orders.length || 0,
          activeListings: 0
        });
        const activity = [
          ...orders.slice(0, 5).map(item => ({
            type: 'order',
            title: `Order #${item.orderId}`,
            date: item.createdAt,
            status: item.status
          }))
        ].sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }, [userType]);
  
  useEffect(() => {
    const id = setTimeout(() => {
      loadDashboardData();
    }, 0);
    return () => clearTimeout(id);
  }, [loadDashboardData]);

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="main-container">
      <div className="mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your account.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-farm-green mb-2">{stats.listings}</div>
          <div className="text-gray-600">Total Listings</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-farm-orange mb-2">{stats.bids}</div>
          <div className="text-gray-600">Total Bids</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-farm-yellow mb-2">{stats.orders}</div>
          <div className="text-gray-600">Orders</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-farm-leaf mb-2">{stats.activeListings}</div>
          <div className="text-gray-600">Active Listings</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {userType === 'buyer' ? (
          <>
            <div className="card buyer-card">
              <h3 className="text-xl font-bold mb-4">Buyer Actions</h3>
              <div className="space-y-3">
                <Link to="/post-requirement" className="btn-action btn-post w-full flex items-center justify-center">
                  <span className="mr-2">➕</span> Post New Requirement
                </Link>
                <Link to="/my-orders" className="btn-action btn-secondary w-full flex items-center justify-center">
                  <span className="mr-2">📋</span> View My Orders
                </Link>
              </div>
            </div>
            
            <div className="card farm-card">
              <h3 className="text-xl font-bold mb-4">Marketplace</h3>
              <div className="space-y-3">
                <Link to="/view-requirements" className="btn-action btn-bid w-full flex items-center justify-center">
                  <span className="mr-2">🔍</span> Browse Requirements
                </Link>
                <button className="btn-action btn-secondary w-full flex items-center justify-center">
                  <span className="mr-2">📊</span> View Analytics
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card farm-card">
              <h3 className="text-xl font-bold mb-4">Farmer Actions</h3>
              <div className="space-y-3">
                <Link to="/view-requirements" className="btn-action btn-bid w-full flex items-center justify-center">
                  <span className="mr-2">🔍</span> Find Requirements
                </Link>
                
              </div>
            </div>
            
            <div className="card buyer-card">
              <h3 className="text-xl font-bold mb-4">Orders</h3>
              <div className="space-y-3">
                <Link to="/my-orders" className="btn-action btn-post w-full flex items-center justify-center">
                  <span className="mr-2">📦</span> View Orders
                </Link>
                <button className="btn-action btn-secondary w-full flex items-center justify-center">
                  <span className="mr-2">📊</span> Performance
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent activity to show</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
