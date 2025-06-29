import React, { useState, memo } from 'react';
import { LobbyList } from './LobbyList';
import CreateLobbyArea from './CreateLobbyArea';

const LobbyManagement = memo(({ lobbies, existingLobby }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); 

  
  return (
    <>
      <CreateLobbyArea
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        existingLobby={existingLobby}
        searchTerm={searchTerm} 
        onSearchTermChange={setSearchTerm} 
      />
      <LobbyList
        lobbies={lobbies}
        activeTab={activeTab}
        searchTerm={searchTerm} 
      />
    </>
  );
});

export default LobbyManagement;