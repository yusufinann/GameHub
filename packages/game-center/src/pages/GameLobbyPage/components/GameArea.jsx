import React from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button 
} from '@mui/material';
import {
  ExitToApp as ExitIcon,
  SportsEsports as GameIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';

const GameArea = ({ lobbyInfo, link, members, isHost, onDelete, onLeave }) => {
  return (
    <Paper 
      elevation={8}
      sx={{ 
        p: 2, 
        flex: '1 1 50%',
        height: '100vh', 
        width:'100%',
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
      }}
    >
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #1a237e',
        pb: 2
      }}>
        <Typography variant="h5" sx={{ 
          color: '#1a237e',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <GameIcon /> {lobbyInfo.lobbyName}
          <Typography variant="caption" sx={{
            bgcolor: '#1a237e',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: '20px',
            ml: 2
          }}>
            Code: {link}
          </Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 ,marginRight:'50px'}}>
          {isHost && (
            <Button 
              variant="contained"
              color="error"
              onClick={onDelete}
              startIcon={<ExitIcon />}
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                '&:hover': {
                  boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
                }
              }}
            >
              Delete Lobby
            </Button>
          )}
          <Button 
            color="error"
            startIcon={<ExitIcon />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
              }
            }} 
            onClick={onLeave}
          >
            Leave Lobby
          </Button>
        </Box>
      </Box>
      <GameStatus 
        members={members} 
      />
    </Paper>
  );
};

const GameStatus = ({ members }) => {
  return (
    <Paper 
      elevation={4}
      sx={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        mb: 2,
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0) 100%)',
          animation: 'shimmer 2s infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      }}
    >
      <Box sx={{ textAlign: 'center', zIndex: 1 }}>
        <Typography variant="h5" sx={{ 
          color: '#1a237e',
          fontWeight: 'bold',
          mb: 3
        }}>
          Game Status
        </Typography>
        <GameControls members={members} />
      </Box>
    </Paper>
  );
};

const GameControls = ({ members }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      justifyContent: 'center',
      '& .MuiButton-root': {
        borderRadius: '12px',
        px: 4,
        py: 1.5,
        textTransform: 'none',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
        }
      }
    }}>
      <Button
        variant="contained"
        sx={{
          bgcolor: '#4caf50',
          '&:hover': {
            bgcolor: '#388e3c'
          }
        }}
        startIcon={<PlayIcon />}
      >
        Ready
      </Button>
      <Button
        variant="contained"
        sx={{
          bgcolor: '#1a237e',
          '&:hover': {
            bgcolor: '#0d47a1'
          }
        }}
        disabled={!members.every(p => p.isReady)}
      >
        Start Game
      </Button>
      <Button
        variant="outlined"
        color="error"
        startIcon={<ExitIcon />}
      >
        Leave Lobby
      </Button>
    </Box>
  );
};

export default GameArea;