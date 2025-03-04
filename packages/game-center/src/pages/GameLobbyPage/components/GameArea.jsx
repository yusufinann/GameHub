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
  Stars as StarsIcon,
} from '@mui/icons-material';

import { BingoGame } from '@gamecenter/bingo-game'
import { useAuthContext } from '../../../shared/context/AuthContext';
import { useWebSocket } from '../../../shared/context/WebSocketContext/context';

const GameArea = ({ lobbyInfo, link, members, isHost, onDelete, onLeave }) => {
  const {currentUser}=useAuthContext();
  const {socket}=useWebSocket();
  return (
    <Paper 
      elevation={8}
      sx={{  
        height: '100vh', 
        width: '100%',
        display: 'flex', 
        flexDirection: 'column',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        overflow: 'hidden' // Prevent content overflow
      }}
    >
      <Box sx={{ 
        p: 2,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #1a237e',
      }}>
        <Typography variant="h5" sx={{ 
          color: '#1a237e',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <GameIcon /> {lobbyInfo.lobbyName}
     
          <Typography 
                      variant="h4" 
                      sx={{ 
                        color: '#ffb300', //#1a237e -lacivert
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                    >
                      <StarsIcon fontSize="large" />
                      Bingo Game
                    </Typography>
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, marginRight: '50px'}}>
       
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
      <Box 
        sx={{ 
          flex: 1,
          display: 'flex',
          overflow: 'auto', // Enable scrolling if content overflows
          p: 2
        }}
      >
        {lobbyInfo.game==="1" ?  (<BingoGame 
          sx={{
            width: '100%',
            height: '100%',
            '& .MuiContainer-root': { // Target the Container component in Test
              height: '100%',
              maxWidth: 'none',
              p: 0
            },
            '& .MuiCard-root': { // Target the main Card in Test
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            },
            '& .MuiCardContent-root': { // Target CardContent in Test
              flex: 1,
              overflow: 'auto',
            }
          }}

          lobbyCode={lobbyInfo.lobbyCode}
          socket={socket}
          currentUser={currentUser}
          lobbyInfo={lobbyInfo}
          members={members}
        />):(
          "Other Game"
        ) }
       
      </Box>
    </Paper>
  );
};

export default GameArea;