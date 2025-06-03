import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import { useAuthContext } from '../AuthContext'; 

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
      console.log('Kullanıcı ID bulunamadı, WebSocket bağlantısı kurulamıyor. 1 saniye sonra tekrar denenecek.');
      reconnectTimerRef.current = setTimeout(connectWebSocket, 1000);
      return;
    }

    const wsUrl = `ws://localhost:3001?userId=${currentUser.id}`; 
    const ws = new WebSocket(wsUrl);
    socketInstanceRef.current = ws; 

    ws.onopen = () => {
      console.log('WebSocket bağlantısı kuruldu');
      setIsConnected(true);
      setSocket(ws); 
      reconnectAttemptsRef.current = 0;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket bağlantısı kapatıldı. Kod:', event.code);
      setIsConnected(false);
      setSocket(null);
      socketInstanceRef.current = null;


      if (event.code !== 1000 && event.code !== 1005) { 
        const delay = Math.min(30000, 1000 * (2 ** reconnectAttemptsRef.current));
        reconnectAttemptsRef.current += 1;
        console.log(`WebSocket ${delay / 1000} saniye sonra yeniden bağlanıyor... (Deneme: ${reconnectAttemptsRef.current})`);
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
        console.log("Kullanıcı yok, mevcut WebSocket bağlantısı kapatılıyor.");
        socketInstanceRef.current.close(1000);
        socketInstanceRef.current = null;
        setIsConnected(false);
        setSocket(null);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      reconnectAttemptsRef.current = 0;
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (socketInstanceRef.current) {
        console.log("WebSocketProvider unmount ediliyor, bağlantı kapatılıyor.");
        socketInstanceRef.current.onclose = null; 
        socketInstanceRef.current.close(1000);
        socketInstanceRef.current = null;
      }
      setIsConnected(false);
      setSocket(null);
      reconnectAttemptsRef.current = 0;
    };
  }, [currentUser, connectWebSocket]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
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