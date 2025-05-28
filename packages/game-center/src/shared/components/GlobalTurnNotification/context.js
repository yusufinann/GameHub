import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useLocation } from "react-router-dom";
import notificationSound from '../../../assets/notification-sound.mp3'; 

const TurnNotificationContext = createContext();

export const TurnNotificationProvider = ({ children }) => {
  const [turnNotification, setTurnNotification] = useState({
    show: false,
    lobbyCode: null,
    lobbyName: '',
    message: '',
  });
  const location = useLocation();
  const turnAudioRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof Audio !== "undefined") {
      turnAudioRef.current = new Audio(notificationSound);
      turnAudioRef.current.onerror = (e) => console.error("Ses (TurnNotificationContext) yükleme hatası:", e);
    }
  }, []);

  const showTurnNotification = useCallback((lobbyCodeParam, lobbyName, message) => {
    const targetLobbyPath = `/lobby/${lobbyCodeParam}`;

    if (location.pathname !== targetLobbyPath) {
      setTurnNotification({
        show: true,
        lobbyCode: lobbyCodeParam,
        lobbyName,
        message,
      });
      if (turnAudioRef.current && typeof document !== "undefined" && document.hidden) {
        turnAudioRef.current.play().catch(error => console.warn("Audio play failed (TurnNotificationContext):", error));
      }
    } else {
      setTurnNotification(prev => ({ ...prev, show: false }));
    }
  }, [location.pathname]); 

  const hideTurnNotification = useCallback(() => {
    setTurnNotification(prev => ({ ...prev, show: false }));
  }, []);

 
  useEffect(() => {
    if (turnNotification.show && turnNotification.lobbyCode && location.pathname === `/lobby/${turnNotification.lobbyCode}`) {
      hideTurnNotification();
    }
  }, [location.pathname, turnNotification, hideTurnNotification]);

  const contextValue = {
    turnNotification,
    showTurnNotification,
    hideTurnNotification,
  };

  return (
    <TurnNotificationContext.Provider value={contextValue}>
      {children}
    </TurnNotificationContext.Provider>
  );
};

export const useTurnNotification = () => {
  const context = useContext(TurnNotificationContext);
  if (!context) {
    throw new Error("useTurnNotification must be used within a TurnNotificationProvider");
  }
  return context;
};