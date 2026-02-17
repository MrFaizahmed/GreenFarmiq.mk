import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while auth state is initializing
  if (loading) {
    return (
      <div className="main-container">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Store the attempted route in session storage to redirect after login
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname + window.location.search);
    }
    navigate('/login');
    return null;
  }

  // Check role permissions if specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.userType)) {
    // Redirect to appropriate dashboard based on user type
    if (user?.userType === 'buyer') {
      navigate('/buyer-dashboard');
    } else if (user?.userType === 'farmer') {
      navigate('/farmer-dashboard');
    } else if (user?.userType === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
    return null;
  }

  return children;
};

export default ProtectedRoute;
