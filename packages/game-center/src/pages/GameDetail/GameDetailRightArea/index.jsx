import React, { useState } from 'react';
import { Box } from '@mui/material';
import CreateLobby from './components/CreateLobby';
import ActiveLobbies from './components/ActiveLobbies';
import GameSettings from './components/GameSettings';

function GameDetailRightArea({ colorScheme,filteredLobbies,lobbies,existingLobby }) {

  
  const [settings, setSettings] = useState({
    sound: true,
    notifications: false,
    theme: 'light'
  });
  return (
    <Box sx={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CreateLobby colorScheme={colorScheme}existingLobby={existingLobby} lobbies={lobbies}/>
      <ActiveLobbies colorScheme={colorScheme} filteredLobbies={filteredLobbies} />
      <GameSettings settings={settings} onSettingsChange={setSettings} />
    </Box>
  );
}

export default GameDetailRightArea;