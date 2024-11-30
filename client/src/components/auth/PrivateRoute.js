import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser } from '../../config/auth';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const authenticated = isAuthenticated();
  const user = getUser();
  
  // If not authenticated, redirect to login
  if (!authenticated || !user) {
    // Only add returnUrl if not already on login page
    const returnUrl = location.pathname === '/login' ? '' : encodeURIComponent(location.pathname + location.search);
    const loginPath = returnUrl ? `/login?returnUrl=${returnUrl}` : '/login';
    return <Navigate to={loginPath} replace />;
  }
  
  // Check if trying to access admin routes without admin role
  if (location.pathname.startsWith('/admin') && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default PrivateRoute;
