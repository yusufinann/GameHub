import React from 'react';
import { Box } from '@mui/material';
import { RoomItem } from './RoomItem';

export const RoomList = ({ lobbies = [], isOpen, colors, selectedTab }) => {
  const filteredLobbies = selectedTab === 'all'
    ? lobbies
    : lobbies.filter((lobby) => lobby.eventType === selectedTab);

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
        <RoomItem
          key={lobby.lobbyCode || index}
          lobby={lobby}
          isOpen={isOpen}
          colors={colors}
        />
      ))}
    </Box>
  );
};