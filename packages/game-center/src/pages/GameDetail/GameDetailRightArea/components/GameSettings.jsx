import React, { useContext } from 'react';
import { Card, CardContent, Box, Typography, Switch, FormControlLabel, useTheme } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { GameSettingsContext } from '../context';
import DummyArea from './DummyArea';

function GameSettings({ settings, onSettingsChange }) {
  const { soundEnabled, toggleSound } = useContext(GameSettingsContext);
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
      <Box>
        <Card sx={{ 
          borderRadius: 4, 
          boxShadow: 3,
          bgcolor: theme.palette.background.card,
          border: `1px solid ${theme.palette.background.elevation[1]}`
        }}>
          <CardContent>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              background: theme.palette.text.title,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              <Settings sx={{ 
                mr: 1, 
                fontSize: 30,
                color: theme.palette.primary.main
              }} />
              <Typography variant="h5">Settings</Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={toggleSound}
                  color="primary"
                />
              }
              label="Sound Effects"
              sx={{
                color: theme.palette.text.primary,
                '& .MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.darker
                }
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={(e) => onSettingsChange({...settings, notifications: e.target.checked})}
                  color="primary"
                />
              }
              label="Notifications"
              sx={{
                color: theme.palette.text.primary,
                '& .MuiSwitch-track': {
                  backgroundColor: theme.palette.primary.darker
                }
              }}
            />
          </CardContent>
        </Card>
      </Box>
    
      <Box>
        <DummyArea />
      </Box>
    </Box>
  );
}

export default GameSettings;