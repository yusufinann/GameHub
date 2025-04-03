import React, { useContext } from 'react';
import { Card, CardContent, Box, Typography, Switch, FormControlLabel } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { GameSettingsContext } from '../context';
import DummyArea from './DummyArea';

function GameSettings({ settings, onSettingsChange }) {
  const { soundEnabled, toggleSound } = useContext(GameSettingsContext);

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, mb: 4}}>
      <Box>    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Settings sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h5">Settings</Typography>
        </Box>
        <FormControlLabel
          control={
            <Switch
              checked={soundEnabled} 
              onChange={toggleSound} 
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
    </Card></Box>
  
    <Box><DummyArea/></Box>
    </Box>
    
  );
};
export default GameSettings