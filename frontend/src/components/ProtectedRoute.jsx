import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userToken'); // Check for token or your authentication logic

  return isAuthenticated ? children : <Navigate to="/login-signup" />; // Redirect to login if not authenticated
};

export default ProtectedRoute;