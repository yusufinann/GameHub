import React, { memo } from 'react';
import { Box } from '@mui/material';

export const StreetLampPost = memo(() => (
  <Box
    sx={{
      height: '60px',
      width: '6px',
      bgcolor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '3px',
      boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
      mb: 0,
      mt: '5px'
    }}
  />
));

export const LampBase = memo(() => (
  <Box
    sx={{
      height: '12px',
      width: '24px',
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0 0 12px 12px',
      boxShadow: '0 2px 8px rgba(255, 255, 255, 0.6)',
    }}
  />
));

export const LampGlowEffect = memo(() => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
      opacity: 0.7,
      filter: 'blur(5px)',
      animation: 'pulse 2s infinite alternate',
      '@keyframes pulse': {
        '0%': { opacity: 0.5, transform: 'translateX(-50%) scale(0.9)' },
        '100%': { opacity: 0.8, transform: 'translateX(-50%) scale(1.1)' }
      }
    }}
  />
));
