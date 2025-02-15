import React from 'react';
import { Card, CardContent, Box, Typography, Switch, FormControlLabel } from '@mui/material';
import { Settings } from '@mui/icons-material';

function GameSettings({ settings, onSettingsChange }) {
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
              checked={settings.sound}
              onChange={(e) => onSettingsChange({...settings, sound: e.target.checked})}
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