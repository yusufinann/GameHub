// components/GameSettings.js
import React, { useContext } from 'react'; // Import useContext
import { Card, CardContent, Box, Typography, Switch, FormControlLabel } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { GameSettingsContext } from '../context'; // Import GameSettingsContext

function GameSettings({ settings, onSettingsChange }) {
  // Use useContext to access soundEnabled and toggleSound from GameSettingsContext
  const { soundEnabled, toggleSound } = useContext(GameSettingsContext);

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Settings sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5">Settings</Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={soundEnabled} // Use soundEnabled from context
              onChange={toggleSound} // Use toggleSound from context
            />
          }
          label="Sound Effects"
        />
        <FormControlLabel
          control={
            <Switch
              checked={settings.notifications}
              onChange={(e) => onSettingsChange({...settings, notifications: e.target.checked})}
            />
          }
          label="Notifications"
        />
      </CardContent>
    </Card>
  );
};
export default GameSettings