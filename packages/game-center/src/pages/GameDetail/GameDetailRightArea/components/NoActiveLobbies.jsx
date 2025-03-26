import { Box, Typography,useTheme, Paper, keyframes } from '@mui/material';
import React from 'react';
import noactivelobbies from "../../../../assets/noactivelobbies-removebg.png";

// Define keyframes for simple animations using MUI
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function NoActiveLobbies() {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={6}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p:2,
        //borderRadius: 4,
        background: `transparent`,
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Background pattern */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, transparent 20%, #fff 20%, #fff 21%, transparent 21%)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />
      
      <Box
        component="img"
        src={noactivelobbies}
        alt="No active lobbies"
        sx={{
          height: 320, // Much larger image
          width: 'auto',
          filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.2))',
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      />
      
      <Box sx={{ animation: `${fadeIn} 0.6s ease-out 0.2s both` }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme.palette.common.white,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
          }}
        >
          Oops! No active lobbies found.
        </Typography>
        
        <Typography 
          variant="body1" 
          sx={{ 
            textAlign: 'center',
            maxWidth: 400,
            mx: 'auto',
            mb: 3.5,
            color: 'rgba(255, 255, 255, 0.85)',
          }}
        >
          It seems there are no games happening right now. Why not create your own lobby?
        </Typography>
      </Box>
    </Paper>
  );
}

export default NoActiveLobbies;