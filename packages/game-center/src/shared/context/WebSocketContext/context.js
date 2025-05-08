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
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectAttemptsRef = useRef(0);
  const {currentUser}=useAuthContext();
  const connectWebSocket = useCallback(() => {
    if (socketRef.current) return;

    if (!currentUser?.id) {
      console.log(
        'Kullanıcı ID bulunamadı, WebSocket bağlantısı kurulamıyor. 1 saniye sonra tekrar denenecek.'
      );
      setTimeout(connectWebSocket, 1000);
      return;
    }

    // URL'e userId parametresini ekle
    const ws = new WebSocket(`ws://localhost:3001?userId=${currentUser.id}`);

    ws.onopen = () => {
      console.log('WebSocket bağlantısı kuruldu');
      socketRef.current = ws;
      setSocket(ws);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onclose = () => {
      console.log('WebSocket bağlantısı kapatıldı');
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);

      // Yeniden bağlanma mantığı
      const delay = Math.min(5000, 1000 * 2 ** reconnectAttemptsRef.current);
      reconnectAttemptsRef.current += 1;

      console.log(`WebSocket ${delay / 1000} saniye sonra yeniden bağlanıyor...`);
      setTimeout(connectWebSocket, delay);
    };

    ws.onerror = (error) => {
      console.error('WebSocket hatası:', error);
    };

    socketRef.current = ws;
  }, [currentUser]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connectWebSocket]);

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