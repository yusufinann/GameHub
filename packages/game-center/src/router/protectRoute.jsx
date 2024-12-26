import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Token'ı localStorage'dan al

  if (!token) {
    // Eğer token yoksa login sayfasına yönlendir
    return <Navigate to="/login" replace />;
  }

  // Token varsa, bileşeni render et
  return children;
};

export default ProtectedRoute;
