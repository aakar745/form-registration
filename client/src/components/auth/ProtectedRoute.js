import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // Check if we have both token and user data
  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if user has the required role
    if (requiredRole && user.role !== requiredRole) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If all checks pass, render the protected content
    return children;
  } catch (error) {
    // If there's any error parsing the user data, redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
