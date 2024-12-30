import React, { useState } from 'react';
import {useParams } from 'react-router-dom';
import { 
  Box, 
  Paper, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText,
  Button,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  ExitToApp as ExitIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Person as PersonIcon,
  SportsEsports as GameIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useLobbyDeletion } from '../RoomsSidebar/hooks/useLobbyDeletion';

const LobbyPage = () => {
  const { link } = useParams();
   const { handleDelete } = useLobbyDeletion();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [players, setPlayers] = useState([
    { id: 1, name: 'Host Player', isHost: true, isReady: true },
    { id: 2, name: 'Player 2', isReady: false },
    { id: 3, name: 'Player 3', isReady: true },
  ]);
  const userLobby = localStorage.getItem('userLobby') 
  const lobbyDetails = JSON.parse(userLobby);
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'You',
        text: messageInput,
        timestamp: new Date().toLocaleTimeString()
      }]);
      setMessageInput('');
    }
  };


  return (
    <Box 
      sx={{ 
        p: 3, 
minHeight: 'calc(100vh - 100px)',
display: 'flex',
gap: 3,
background: 'linear-gradient(135deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)',
animation: 'gradientShift 10s ease infinite',
'@keyframes gradientShift': {
  '0%': { background: 'linear-gradient(135deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)' },
  '50%': { background: 'linear-gradient(135deg, rgba(253,187,45,1) 0%, rgba(34,193,195,1) 100%)' },
  '100%': { background: 'linear-gradient(135deg, rgba(34,193,195,1) 0%, rgba(253,187,45,1) 100%)' },
}

      }}
    >
      {/* Left Side - Player List */}
      <Paper 
        elevation={8}
        sx={{ 
          p: 2, 
          width: '25%', 
          height: '100vh',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2,
          borderBottom: '2px solid #1a237e',
          pb: 1
        }}>
          <Typography variant="h6" sx={{ 
            color: '#1a237e',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrophyIcon /> Players
          </Typography>
          <Typography variant="body2" sx={{ 
            bgcolor: '#1a237e',
            color: 'white',
            px: 2,
            py: 0.5,
            borderRadius: '20px'
          }}>
            lobbyInfo.players
          </Typography>
        </Box>
        <List>
          {players.map((player) => (
            <ListItem
              key={player.id}
              sx={{
                mb: 1,
                bgcolor: player.isHost ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                borderRadius: '10px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(25, 118, 210, 0.2)',
                }
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {player.isHost && (
                    <Tooltip title="Host">
                      <SettingsIcon sx={{ color: '#1a237e' }} />
                    </Tooltip>
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: player.isReady ? '#4caf50' : '#ff9800',
                      color: 'white',
                      px: 1,
                      py: 0.5,
                      borderRadius: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    {player.isReady ? 'Ready' : 'Not Ready'}
                  </Typography>
                </Box>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ 
                  bgcolor: player.isHost ? '#1a237e' : '#2196f3',
                  animation: player.isReady ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)' }
                  }
                }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText 
                primary={player.name}
                secondary={player.isHost ? 'Host' : 'Player'}
                primaryTypographyProps={{
                  fontWeight: 'bold',
                  color: '#1a237e'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Middle - Game Area */}
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
            <GameIcon /> lobbyInfo.name
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
          <Button 
            variant="contained"
            color="error"
            onClick={(e) => handleDelete(lobbyDetails.lobbyCode, e)}
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
        </Box>
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
              lobbyInfo.status
            </Typography>
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
                disabled={!players.every(p => p.isReady)}
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
          </Box>
        </Paper>
      </Paper>

      {/* Right Side - Chat */}
      {/* <Paper 
        elevation={8}
        sx={{ 
          p: 2, 
          width: '25%',
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px'
        }}
      >
        <Typography variant="h6" sx={{ 
          mb: 2,
          pb: 1,
          borderBottom: '2px solid #1a237e',
          color: '#1a237e',
          fontWeight: 'bold'
        }}>
          Chat
        </Typography>
        <Box sx={{ 
          flex: 1, 
          overflow: 'auto', 
          mb: 2,
          px: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#1a237e',
            borderRadius: '4px',
          },
        }}>
          {messages.map((message) => (
            <Box 
              key={message.id} 
              sx={{ 
                mb: 1,
                p: 1,
                bgcolor: message.sender === 'You' ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                borderRadius: '8px',
                maxWidth: '90%',
                ml: message.sender === 'You' ? 'auto' : 0,
              }}
            >
              <Typography variant="caption" sx={{ color: '#1a237e', fontWeight: 'bold' }}>
                {message.sender} • {message.timestamp}
              </Typography>
              <Typography variant="body2" sx={{ color: '#333' }}>
                {message.text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Divider />
        <Box 
          component="form" 
          onSubmit={handleSendMessage} 
          sx={{ 
            mt: 2, 
            display: 'flex', 
            gap: 1 
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover': {
                  '& > fieldset': {
                    borderColor: '#1a237e',
                  }
                }
              }
            }}
          />
          <IconButton 
            color="primary" 
            type="submit"
            sx={{
              bgcolor: '#1a237e',
              color: 'white',
              '&:hover': {
                bgcolor: '#0d47a1',
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper> */}
    </Box>
  );
};

export default LobbyPage;