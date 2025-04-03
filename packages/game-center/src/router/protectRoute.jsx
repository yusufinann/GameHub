import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../shared/context/AuthContext";

// JWT token'ı decode eden yardımcı fonksiyon
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

  // Eğer token yoksa yönlendir
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token'ı decode edip süresini kontrol et
  const decoded = parseJwt(token);
  if (!decoded || decoded.exp * 1000 < Date.now()) {
    // Token süresi dolmuş veya hatalıysa oturumu kapat
    logout();
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
