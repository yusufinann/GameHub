import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  Paper,
  keyframes,
} from '@mui/material';
import Theaters from '@mui/icons-material/Theaters'; 

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
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: 'linear-gradient(135deg, #caecd5 0%, rgb(50,135,97) 100%)',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Subtle Background Pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0.1,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
        }}
      />

      {/* Theaters Icon */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 3,
          animation: `${fadeIn} 0.6s ease-out`,
        }}
      >
        <Theaters sx={{ // Use Theaters icon here
          width: 200,
          height: 200,
          color: 'rgba(255,255,255,0.3)',
          animation: `${fadeIn} 0.6s ease-out`,
        }} />
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          animation: `${fadeIn} 0.6s ease-out 0.2s both`,
          px: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: theme.palette.common.white,
            mb: 2,
            textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          }}
        >
          No Active Lobbies
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: 400,
            mx: 'auto',
            mb: 3,
          }}
        >
          Looks like the game arena is quiet right now.
          Be the first to create a lobby and kick off the action!
        </Typography>
      </Box>
    </Paper>
  );
}

export default NoActiveLobbies;