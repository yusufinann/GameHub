import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { fetchLobbies, createLobby as createLobbyApi, deleteLobby as deleteLobbyApi} from '../api';

const LobbyContext = createContext();

export const LobbyProvider = ({ children }) => {
  const [existingLobby, setExistingLobby] = useState(null);
  const [lobbies, setLobbies] = useState([]);
  const [lobbyCode, setLobbyCode] = useState('');
  const [lobbyLink, setLobbyLink] = useState('');

  // Tüm lobileri getir
  const fetchAndSetLobbies = useCallback(async () => {
    try {
      const lobbies = await fetchLobbies();
      setLobbies(lobbies);
    } catch (error) {
      console.error('Lobiler getirilirken bir hata oluştu:', error);
    }
  }, []);

  useEffect(() => {
    fetchAndSetLobbies();
  }, [fetchAndSetLobbies]);

  // LocalStorage'dan lobi bilgisini yükle
  useEffect(() => {
    const storedLobby = localStorage.getItem('userLobby');
    if (storedLobby) {
      const lobby = JSON.parse(storedLobby);
      setExistingLobby(lobby);
      setLobbyCode(lobby.lobbyCode);
      setLobbyLink(lobby.lobbyLink);
    }
  }, []);

  // Lobi oluştur
  const createLobby = useCallback(async (lobbyData) => {
    try {
      const response = await createLobbyApi(lobbyData);
      const { lobby, lobbyLink } = response;

      setExistingLobby(lobby);
      setLobbies((prevLobbies) => [...prevLobbies, lobby]);
      setLobbyCode(lobby.lobbyCode);
      setLobbyLink(lobbyLink);

      localStorage.setItem('userLobby', JSON.stringify({ ...lobby, lobbyLink }));
    } catch (error) {
      throw error;
    }
  }, []);

  // Lobi sil
  const deleteLobby = useCallback(async (lobbyCode) => {
    try {
      await deleteLobbyApi(lobbyCode);

      if (existingLobby?.lobbyCode === lobbyCode) {
        setExistingLobby(null);
        setLobbyCode('');
        setLobbyLink('');
        localStorage.removeItem('userLobby');
      }

      setLobbies((prevLobbies) => prevLobbies.filter((lobby) => lobby.lobbyCode !== lobbyCode));
    } catch (error) {
      throw error;
    }
  }, [existingLobby]);


  // Lobi bilgilerini temizle
  const clearLobby = useCallback(() => {
    localStorage.removeItem('userLobby');
    setExistingLobby(null);
    setLobbyCode('');
    setLobbyLink('');
  }, []);

  return (
    <LobbyContext.Provider
      value={{
        existingLobby,
        setExistingLobby,
        clearLobby,
        createLobby,
        lobbies,
        setLobbies,
        deleteLobby,
        lobbyCode,
        lobbyLink,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobbyContext = () => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error('useLobbyContext must be used within a LobbyProvider');
  }
  return context;
};