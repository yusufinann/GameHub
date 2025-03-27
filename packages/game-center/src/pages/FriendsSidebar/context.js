import React, { useState, createContext, useContext, useCallback } from 'react';
import { Snackbar } from '@mui/material';

const NotificationContext = createContext();

export const GlobalNotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = useCallback((message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <NotificationContext.Provider value={showNotification}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={hideNotification}
        message={notification.message}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          zIndex: 9999,
          position: 'fixed',
          top: '16px',
          right: '16px'
        }}
      />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a GlobalNotificationProvider');
  }
  return context;
};