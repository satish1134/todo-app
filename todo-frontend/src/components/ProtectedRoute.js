import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem('token'); // Check for the presence of the token

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
