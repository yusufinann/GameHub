import React, { createContext, useContext, useState, useEffect } from 'react';

const LobbyContext = createContext();

export const LobbyProvider = ({ children }) => {
  const [existingLobby, setExistingLobby] = useState(null);
  const [lobbies,setLobbies] = useState([]);

  useEffect(() => {
    const storedLobby = localStorage.getItem('userLobby');
    if (storedLobby) {
      setExistingLobby(JSON.parse(storedLobby));
    }
  }, []);
  
  const createLobby = (lobby) => {
    setExistingLobby(lobby);
    setLobbies((prevLobbies) => [...prevLobbies, lobby]);
    localStorage.setItem('userLobby', JSON.stringify(lobby));
  };

  const deleteLobby = (lobbyCode) => {
    // Remove from existingLobby if it matches
    if (existingLobby?.lobbyCode === lobbyCode) {
      setExistingLobby(null);
      localStorage.removeItem('userLobby');
    }
    
    // Remove from lobbies array
    setLobbies(prevLobbies => prevLobbies.filter(lobby => lobby.lobbyCode !== lobbyCode));
  };
  const clearLobby = () => {
    localStorage.removeItem('userLobby');
    setExistingLobby(null);
  };

  return (
    <LobbyContext.Provider value={{ existingLobby, setExistingLobby, clearLobby,createLobby,lobbies,deleteLobby }}>
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
