import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

const SNACKBAR_DISPLAY_DELAY = 3000;

const SnackbarContext = createContext();

export const SnackbarProvider = ({ children }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info"); 

 
  const timeoutIdRef = useRef(null);

 
  const showSnackbar = useCallback(
    ({ message, severity = "info" }) => {
 
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

 
      timeoutIdRef.current = setTimeout(() => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setSnackbarOpen(true);
        timeoutIdRef.current = null; 
      }, SNACKBAR_DISPLAY_DELAY);
    },
    [] 
  );
  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  const contextValue = {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    showSnackbar,
    handleSnackbarClose,
  };

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};