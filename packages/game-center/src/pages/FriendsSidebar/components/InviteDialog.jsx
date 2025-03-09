// InviteDialog.js
import React, { memo} from 'react';
import { Box, Avatar, Typography,IconButton,Dialog, DialogTitle, DialogContent, DialogActions,Button, Grid} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups'; // Lobby Name Icon
import VpnKeyIcon from '@mui/icons-material/VpnKey'; // Lobby Code Icon
import { useWebSocket } from '../../../shared/context/WebSocketContext/context';
import { useAuthContext } from '../../../shared/context/AuthContext';

const InviteDialog = memo(({ open, handleClose, friend, existingLobby }) => {
  const { socket } = useWebSocket(); // Use WebSocket context
  const { currentUser } = useAuthContext(); // Use Auth context

  const handleInviteFriend = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket connection is not open.");
      return;
    }

    if (!friend || !existingLobby || !currentUser) {
      console.error("Missing friend, lobby, or user information for invitation.");
      return;
    }

    const invitationMessage = {
      type: "LOBBY_INVITATION",
      recipientId: friend.id, // Assuming friend object has an 'id'
      lobby: {
        lobbyName: existingLobby.lobbyName,
        lobbyCode: existingLobby.lobbyCode,
        lobbyId: existingLobby._id, // Assuming existingLobby has an '_id'
      },
      sender: {
        id: currentUser.id, // Assuming currentUser object has an 'id'
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
    };

    socket.send(JSON.stringify(invitationMessage));
    handleClose(); // Close the dialog after sending the invitation
  };

  if (!friend) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #00FA9A 0%, #00CED1 50%, #1E90FF 100%)', // Vibrant Gradient
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.7)',
          color: 'white',
          minWidth: '320px' // Slightly wider for better spacing
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={friend.avatar}
            alt={friend.name}
            sx={{ mr: 1, border: '2px solid rgba(255, 255, 255, 0.8)' }}
          />
          <Typography variant="h6" sx={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>Invite {friend.name}</Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 3, px: 3 }}> {/* Increased padding for better spacing */}
        <Typography variant="subtitle1" align="center" sx={{ mb: 2, color: 'rgba(255, 255, 255, 0.8)', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}> {/* Centered and more margin */}
          Invite to Lobby:
        </Typography>
        {existingLobby && (
          <Box sx={{
            padding: 3, // Increased padding inside lobby info box
            borderRadius: '12px', // More rounded corners
            backgroundColor: 'rgba(255, 255, 255, 0.12)', // Slightly more prominent background
            border: '1px solid rgba(255, 255, 255, 0.15) ' // Slightly thicker border
          }}>
            <Grid container spacing={2} alignItems="center"> {/* Using Grid for better layout */}
              <Grid item xs={12} sm={6}> {/* Lobby Name Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}> {/* Added marginBottom */}
                  <GroupsIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /> {/* Lobby Name Icon */}
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                    Lobby Name:
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'white', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>{existingLobby.lobbyName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}> {/* Lobby Code Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}> {/* Added marginBottom */}
                  <VpnKeyIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} /> {/* Lobby Code Icon */}
                  <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                    Lobby Code:
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'white', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>{existingLobby.lobbyCode}</Typography>
              </Grid>
            </Grid>
          </Box>
        )}
        {!existingLobby && (
          <Typography variant="body2" align="center" sx={{ color: 'rgba(255, 255, 255, 0.7)', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)', fontStyle: 'italic' }}> {/* Italic style */}
            No lobby available to invite to.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { color: 'white' },
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleInviteFriend} // Changed to handleInviteFriend
          variant="contained"
          disabled={!existingLobby}
          sx={{
            background: 'linear-gradient(45deg, #00d2ff 0%, #3a7bd5 100%)',
            color: 'white',
            '&:hover': { filter: 'brightness(1.1)' },
            '&.Mui-disabled': {
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)'
            },
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          Invite
        </Button>
      </DialogActions>
    </Dialog>
  );
});
export default InviteDialog