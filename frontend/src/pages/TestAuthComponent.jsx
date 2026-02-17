import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { productListingService } from '../services/api';

const TestAuthComponent = () => {
  const { isAuthenticated, user, login, logout } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testProtectedRoute = async () => {
    setLoading(true);
    try {
      const data = await productListingService.getAllListings();
      setTestResult({
        status: 'ok',
        data: data
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        data: error.message
      });
    }
    setLoading(false);
  };

  return (
    <div className="main-container">
      <h1 className="page-title">Authentication Test</h1>
      
      <div className="card">
        <h2>Authentication Status</h2>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        {user && (
          <div>
            <p><strong>User:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>User Type:</strong> {user.userType}</p>
          </div>
        )}
      </div>
      
      <div className="card">
        <h2>Test Protected Route</h2>
        <button 
          onClick={testProtectedRoute}
          className="btn-action btn-bid"
          disabled={loading || !isAuthenticated}
        >
          {loading ? 'Testing...' : 'Test Protected Route'}
        </button>
        
        {testResult && (
          <div className="mt-4">
            <p><strong>Status:</strong> {testResult.status}</p>
            <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
          </div>
        )}
      </div>
      
      <div className="card">
        <h2>Authentication Actions</h2>
        {!isAuthenticated ? (
          <button 
            onClick={() => login('test@example.com', 'password123')}
            className="btn-action btn-post"
          >
            Login as Test User
          </button>
        ) : (
          <button 
            onClick={logout}
            className="btn-action btn-bid"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
};

export default TestAuthComponent;
