import React, { useState } from 'react';
import { Box } from '@mui/material';
import CreateLobby from './components/CreateLobby';
import ActiveLobbies from './components/ActiveLobbies';
import GameSettings from './components/GameSettings';

function GameDetailRightArea({ filteredLobbies, lobbies, existingLobby }) {
  const [settings, setSettings] = useState({
    sound: true,
    notifications: false,
    theme: 'light'
  });

  return (
    <Box
      sx={{
        flexGrow: 1,
        flexBasis: { xs: 'auto', md: '25%' },
        width: { xs: '100%', md: '25%' },
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <CreateLobby existingLobby={existingLobby} lobbies={lobbies} />
      <ActiveLobbies filteredLobbies={filteredLobbies} />
      <GameSettings settings={settings} onSettingsChange={setSettings} />
    </Box>
  );
}

export default GameDetailRightArea;
