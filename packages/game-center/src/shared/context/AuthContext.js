import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = (userData) => {
    setCurrentUser(userData);
    setToken(userData.token);
    localStorage.setItem("currentUser", JSON.stringify(userData)); 
    localStorage.setItem("token", userData.token); 
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("currentUser"); 
    localStorage.removeItem("token"); 
  };


  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};