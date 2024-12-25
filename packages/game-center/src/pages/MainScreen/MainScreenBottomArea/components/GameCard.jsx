import React from 'react';
import { Box, Button } from '@mui/material';

const GameCard = ({ thumbnail, openGiveawayUrl }) => (
  <Box
    sx={{
      width: '150px',
      height: '150px',
      backgroundImage: `url(${thumbnail})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: '20px', // Rounded corners to soften the effect
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      cursor: 'pointer',   
      overflow: 'hidden', // Ensures the corners stay clean
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))', // Gradient overlay for depth
        zIndex: 1,
      }}
    />
    <Button
      variant="contained"
      sx={{
        position: 'absolute',
        bottom: '15px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 99, 71, 0.8)',
        color: '#fff',
        fontSize: '8px',
        zIndex: 2, // Ensures button stays above gradient overlay
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
