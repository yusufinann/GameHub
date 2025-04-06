import React, { useState } from 'react';
import { LobbyList } from './components/LobbyList';
import CreateLobbyArea from './components/CreateLobbyArea';
import { Box, CircularProgress } from '@mui/material';
import { useLobbyContext } from '../../../../shared/context/LobbyContext/context';

function LobbiesArea() {
  const { lobbies, isLoading,existingLobby } = useLobbyContext();
  const [activeTab, setActiveTab] = useState('all');

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <CreateLobbyArea activeTab={activeTab} setActiveTab={setActiveTab} existingLobby={existingLobby}/>
      <LobbyList lobbies={lobbies} activeTab={activeTab} />
    </>
  );
}

export default LobbiesArea;
