import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
  useMemo,
} from 'react';
import { useAuthContext } from '../AuthContext'; 
import config from '../../../config';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketInstanceRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const { currentUser } = useAuthContext();

  const connectWebSocket = useCallback(() => {
    if (socketInstanceRef.current && socketInstanceRef.current.readyState === WebSocket.OPEN) {
      return;
    }

    if (!currentUser?.id) {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(connectWebSocket, 1000);
      return;
    }

    if (!config.wsBaseUrl) {
      console.error("WebSocket temel URL'si (wsBaseUrl) config dosyasında veya ortam değişkenlerinde tanımlanmamış!");
      return;
    }

    const wsUrl = `${config.wsBaseUrl}?userId=${currentUser.id}`;
    const ws = new WebSocket(wsUrl);
    socketInstanceRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
      reconnectAttemptsRef.current = 0;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onclose = (event) => {
      setIsConnected(false);
      setSocket(null);
      socketInstanceRef.current = null;

      if (event.code !== 1000 && event.code !== 1005) {
        const delay = Math.min(30000, 1000 * (2 ** reconnectAttemptsRef.current));
        reconnectAttemptsRef.current += 1;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(connectWebSocket, delay);
      } else {
        reconnectAttemptsRef.current = 0;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      connectWebSocket();
    } else {
      if (socketInstanceRef.current) {
        socketInstanceRef.current.close(1000);
      }
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null; 
      }
      if (socketInstanceRef.current) {
        socketInstanceRef.current.onopen = null;
        socketInstanceRef.current.onclose = null;
        socketInstanceRef.current.onerror = null;
        socketInstanceRef.current.onmessage = null;
        socketInstanceRef.current.close(1000);
        socketInstanceRef.current = null;
      }
      setIsConnected(false);
      setSocket(null);
      reconnectAttemptsRef.current = 0;
    };
  }, [currentUser, connectWebSocket]);

  const contextValue = useMemo(() => ({
    socket,
    isConnected,
  }), [socket, isConnected]);

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket, WebSocketProvider içinde kullanılmalıdır');
  }
  return context;
};