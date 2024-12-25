import { Box, Typography, Button } from '@mui/material';
import React from 'react';

function MainScreenLeft() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '80%',
        height: '80vh',
        background: 'linear-gradient(135deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)', // Gradient background
        borderRadius: '20px',
        boxShadow: '0px 10px 30px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.3s ease-in-out',
        padding: { xs: '15px', sm: '20px' },  // Adjust padding for smaller screens
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          textAlign: 'center',
          fontSize: '2.5rem',
          zIndex: 1,
          animation: 'fadeIn 1.5s ease-out', // Adding a fade-in effect
        }}
      >
        Create or Choose a Room for Chat & Play Game
      </Typography>

      <Button
        sx={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '1.1rem',
          backgroundColor: '#ff7f50', // Bright call-to-action button color
          color: '#fff',
          borderRadius: '50px',
          boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.2)',
          '&:hover': {
            backgroundColor: '#ff6347', // Button hover effect
          },
        }}
      >
        Start Game
      </Button>

      <Box
        sx={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: '5px',
          backgroundColor: '#fff',
          borderRadius: '10px',
        }}
      ></Box>
    </Box>
  );
}

export default MainScreenLeft;
