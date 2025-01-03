import React from 'react';
import { Box } from '@mui/material';
import { LobbyItem } from './LobbyItem';

export const LobbyList = ({ lobbies = [], isOpen, colors, selectedTab }) => {
  const sortLobbies = (lobbyArray) => {
    return [...lobbyArray].sort((a, b) => {
      // First sort by event type (events first)
      if (a.eventType === 'event' && b.eventType !== 'event') return -1;
      if (a.eventType !== 'event' && b.eventType === 'event') return 1;
      
      // Then sort events by start date/time
      if (a.eventType === 'event' && b.eventType === 'event') {
        const dateA = new Date(`${a.startDate}T${a.startTime}`);
        const dateB = new Date(`${b.startDate}T${b.startTime}`);
        return dateA - dateB;
      }
      
      // Keep original order for non-event lobbies
      return 0;
    });
  };

  const filteredLobbies = selectedTab === 'all'
    ? sortLobbies(lobbies)
    : sortLobbies(lobbies.filter((lobby) => lobby.eventType === selectedTab));

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
      {filteredLobbies.map((lobby, index) => (
        <LobbyItem
          key={lobby.lobbyCode || index}
          lobby={lobby}
          isOpen={isOpen}
          colors={colors}
        />
      ))}
    </Box>
  );
};
