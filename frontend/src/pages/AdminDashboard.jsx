import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboard();
      if (response.success !== false) {
        setStats(response);
      } else {
        setError(response.msg || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError('An error occurred while loading dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="main-container">
        <h1 className="page-title">Admin Dashboard</h1>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-container">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-red-500">{error}</p>
        <button onClick={loadDashboardData} className="btn-action btn-bid">Retry</button>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="mb-8">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="text-gray-600">Platform overview and management tools</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-farm-green to-farm-leaf text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-farm-cream opacity-80">Total Users</p>
              <p className="text-3xl font-bold">{stats.stats.users.total}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
          <div className="mt-4 text-sm">
            <p>Farmers: {stats.stats.users.farmers}</p>
            <p>Buyers: {stats.stats.users.buyers}</p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-farm-orange to-farm-yellow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-farm-dark-green opacity-80">Active Listings</p>
              <p className="text-3xl font-bold text-farm-dark-green">{stats.stats.listings.active}</p>
            </div>
            <div className="text-4xl text-farm-dark-green">📝</div>
          </div>
          <div className="mt-4 text-sm text-farm-dark-green">
            <p>Completed: {stats.stats.listings.completed}</p>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-farm-brown to-farm-soil text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-farm-cream opacity-80">Total Orders</p>
              <p className="text-3xl font-bold">{stats.stats.orders.total}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-farm-sky to-blue-400 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white opacity-80">Total Revenue</p>
              <p className="text-3xl font-bold">₹{stats.stats.orders.totalValue.toLocaleString()}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-farm-dark-green">Recent Users</h2>
          <div className="space-y-3">
            {stats.recentUsers.map((user, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    {user.userType} • {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                    user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {user.kycStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4 text-farm-dark-green">Recent Orders</h2>
          <div className="space-y-3">
            {stats.recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div>
                  <p className="font-medium">{order.orderId}</p>
                  <p className="text-sm text-gray-600">
                    {order.buyer} → {order.farmer}
                  </p>
                  <p className="text-xs text-gray-500">
                    ₹{order.total.toLocaleString()} • {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mt-8">
        <h2 className="text-xl font-bold mb-4 text-farm-dark-green">Admin Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-action btn-bid w-full py-3">
            Manage Users
          </button>
          <button className="btn-action btn-post w-full py-3">
            View Orders
          </button>
          <button className="btn-action btn-secondary w-full py-3">
            Analytics Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;