import React, { memo } from 'react';
import { Box, useTheme } from '@mui/material';

export const StreetLampPost = memo(() => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        height: '60px',
        width: '6px',
        bgcolor: theme.palette.mode === 'light' 
          ? theme.palette.secondary.light
          : theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : theme.palette.primary.dark, 
        borderRadius: '3px',
        boxShadow: `0 0 8px ${theme.palette.mode === 'light' 
          ? theme.palette.secondary.main 
          : theme.palette.mode === 'dark'
            ? theme.palette.background.elevation[1]
            : theme.palette.background.elevation[2]}`,
        mb: 0,
        mt: '5px'
      }}
    />
  );
});

export const LampBase = memo(() => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        height: '12px',
        width: '24px',
        bgcolor: theme.palette.mode === 'light' 
          ? theme.palette.secondary.light
          : theme.palette.mode === 'dark'
            ? theme.palette.background.paper
            : theme.palette.primary.dark,
        borderRadius: '0 0 12px 12px',
        boxShadow: `0 2px 8px ${theme.palette.mode === 'light' 
          ? theme.palette.secondary.main 
          : theme.palette.mode === 'dark'
            ? theme.palette.background.elevation[1]
            : theme.palette.background.elevation[2]}`,
      }}
    />
  );
});

export const LampGlowEffect = memo(() => {
  const theme = useTheme();
  
  // Select glow colors based on theme
  const innerGlowColor = theme.palette.mode === 'light'
    ? theme.palette.secondary.gold
    : theme.palette.mode === 'dark'
      ? theme.palette.secondary.main
      : theme.palette.primary.main;
      
  const outerGlowColor = 'rgba(255,255,255,0)';
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${innerGlowColor} 0%, ${outerGlowColor} 70%)`,
        opacity: 0.7,
        filter: 'blur(5px)',
        animation: 'pulse 2s infinite alternate',
        '@keyframes pulse': {
          '0%': { opacity: 0.5, transform: 'translateX(-50%) scale(0.9)' },
          '100%': { opacity: 0.8, transform: 'translateX(-50%) scale(1.1)' }
        }
      }}
    />
  );
});

// Complete lamp assembly component
export const StreetLamp = memo(() => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '40px',
        height: '85px',
      }}
    >
      <Box
        sx={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          bgcolor: theme.palette.mode === 'light' 
            ? theme.palette.secondary.gold  
            : theme.palette.mode === 'dark'
              ? theme.palette.secondary.light
              : theme.palette.primary.light,
          boxShadow: `0 0 15px ${theme.palette.mode === 'light' 
            ? theme.palette.secondary.gold 
            : theme.palette.mode === 'dark'
              ? theme.palette.secondary.light
              : theme.palette.primary.main}`,
          zIndex: 2,
        }}
      />
      <LampGlowEffect />
      <LampBase />
      <StreetLampPost />
    </Box>
  );
});