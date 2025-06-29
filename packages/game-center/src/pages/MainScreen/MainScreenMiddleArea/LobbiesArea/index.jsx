import React from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useLobbyContext } from '../../../../shared/context/LobbyContext/context';
import LobbyManagement from './components/LobbyManagement'; // Yeni bileşeni import edin

function LobbiesArea() {
  const { lobbies, isLoading, existingLobby } = useLobbyContext();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '70vh', 
          width: '100%'   
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <LobbyManagement lobbies={lobbies} existingLobby={existingLobby} />;
}
export default LobbiesArea; 