import React, { useContext } from 'react';
import { Card, CardContent, Box, Typography, Switch, FormControlLabel, useTheme } from '@mui/material';
import { Settings } from '@mui/icons-material';
import { GameSettingsContext } from '../context';
import DummyArea from './DummyArea';
import { useTranslation } from 'react-i18next';

function GameSettings({ settings, onSettingsChange,gameId }) {
  const { soundEnabled, toggleSound } = useContext(GameSettingsContext);
  const theme = useTheme();
  const{t}=useTranslation();
  console.log("SgameId : ",gameId)
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
              <Typography variant="h5">{t("Settings")}</Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={soundEnabled}
                  onChange={toggleSound}
                  color="primary"
                />
              }
              label={t("Sound Effects")}
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
              label={t("Notifications")}
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
        <DummyArea gameId={gameId}/>
      </Box>
    </Box>
  );
}

export default GameSettings;