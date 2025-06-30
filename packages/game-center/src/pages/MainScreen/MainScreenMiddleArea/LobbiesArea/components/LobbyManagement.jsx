import React, { useState, memo } from 'react';
import { LobbyList } from './LobbyList';
import CreateLobbyArea from './CreateLobbyArea';
import useDebounce from '../useDebounce';

const LobbyManagement = memo(({ lobbies, existingLobby }) => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(''); 

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedActiveTab = useDebounce(activeTab, 200);

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
        activeTab={debouncedActiveTab}
        searchTerm={debouncedSearchTerm} 
      />
    </>
  );
});

export default LobbyManagement;