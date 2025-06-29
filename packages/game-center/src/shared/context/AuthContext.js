import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect,
  useMemo,      
  useCallback  
} from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  const login = useCallback((userData) => {
    setCurrentUser(userData);
    setToken(userData.token);
    localStorage.setItem("currentUser", JSON.stringify(userData)); 
    localStorage.setItem("token", userData.token); 
  }, []); 

  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("currentUser"); 
    localStorage.removeItem("token"); 
  }, []); 

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedToken = localStorage.getItem("token");
    if (storedUser && storedToken) {
      setCurrentUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const authContextValue = useMemo(() => ({
    currentUser,
    token,
    login,
    logout
  }), [currentUser, token, login, logout]); 


  return (
    <AuthContext.Provider value={authContextValue}>
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