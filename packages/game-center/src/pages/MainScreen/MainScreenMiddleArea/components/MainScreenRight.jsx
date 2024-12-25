import { Box, Button } from '@mui/material';
import React from 'react';

const games = [
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
  { 
    image: 'https://via.placeholder.com/150x100', 
  },
];

function MainScreenRight() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column', // Change grid to column for vertical layout
        alignItems: 'center',
        width: '15%',
        height: '80vh',
        background: 'linear-gradient(145deg, #F9F9F9 0%, #FFFFFF 100%)',
        borderRadius: '15px',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.1)',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: { xs: '15px', sm: '10px' },
      }}
    >
      {games.map((game, index) => (
        <Box
          key={index}
          sx={{
            width: '100%', // Ensure cards take full width available
            marginBottom: '10px', // Add spacing between the cards
            display: 'flex',
            justifyContent: 'center', // Center the cards horizontally
          }}
        >
          <Box
            sx={{
              width: '10vw',
              height: '20vh',
              backgroundImage: `url(${game.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'scale(1.05)', // Subtle zoom on hover
              },
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6))',
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
                fontSize: '12px', // Increased font size for better readability
                zIndex: 2,
                padding: '6px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 99, 71, 1)',
                },
              }}
              onClick={() => alert('Navigating to game...')}
            >
              Play Now
            </Button>
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export default MainScreenRight;
