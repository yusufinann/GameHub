import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../shared/context/AuthContext";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const ProtectedRoute = ({ children }) => {
  const { token, logout } = useAuthContext();

  const decodedToken = token ? parseJwt(token) : null;
  const isTokenExpired = !decodedToken || decodedToken.exp * 1000 < Date.now();
  
  useEffect(() => {
    if (token && isTokenExpired) {
      logout();
    }
  }, [token, isTokenExpired, logout]);

  if (!token || isTokenExpired) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;