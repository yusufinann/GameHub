import React from 'react';
import { Box, Button } from '@mui/material';

const GameCard = ({ thumbnail, openGiveawayUrl }) => (
  <Box
    sx={{
      width: '180px',
      height: '180px',
      backgroundImage: `url(${thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      '&:hover': {
        transform: 'scale(1.05)',
        transition: 'transform 0.3s ease',
      },
    }}
  >
    <Button
      variant="contained"
      sx={{
        position: 'absolute',
        bottom: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 99, 71, 0.8)',
        color: '#fff',
        fontSize: '14px',
        '&:hover': {
          backgroundColor: 'rgba(255, 99, 71, 1)',
        },
      }}
      onClick={() => window.open(openGiveawayUrl, '_blank')}
    >
      Play Now
    </Button>
  </Box>
);

export default GameCard;
