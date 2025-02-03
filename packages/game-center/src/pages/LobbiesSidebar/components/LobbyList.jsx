import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import LobbyItem from './LobbyItem/LobbyItem';

export const LobbyList = ({ lobbies = [], isOpen }) => {
  // Lobileri sıralama fonksiyonu
  const sortedLobbies = useMemo(() => {
    return [...lobbies].sort((a, b) => {
      // First priority: Event type lobbies always come first
      if (a.lobbyType === 'event' && b.lobbyType !== 'event') return -1;
      if (a.lobbyType !== 'event' && b.lobbyType === 'event') return 1;
      
      // Second priority: For event lobbies, sort by start time
      if (a.lobbyType === 'event' && b.lobbyType === 'event') {
        const dateA = new Date(`${a.startDate}T${a.startTime}`);
        const dateB = new Date(`${b.startDate}T${b.startTime}`);
        return dateA - dateB;
      }
      
      // Third priority: For non-event lobbies, sort by creation time (if available)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      
      return 0;
    });
  }, [lobbies]);

  return (
    <Box
      sx={{
        padding: '5px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1,
        overflowY: 'auto'
      }}
    >
      {sortedLobbies.map((lobby, index) => (
        <LobbyItem
          key={lobby.lobbyCode || index}
          lobby={lobby}
          isOpen={isOpen}
        />
      ))}
    </Box>
  );
};