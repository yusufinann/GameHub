import React, { memo,useState } from 'react';
import { Box, Avatar, Typography,IconButton,Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const MessageDialog = memo(({ open, handleClose, friend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    // Handle sending message logic here
    console.log(`Sending message to ${friend?.name}: ${message}`);
    handleClose();
    setMessage('');
  };

  if (!friend) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          color: 'white',
          minWidth: '300px'
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
          <Typography variant="h6">{friend.name}</Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ py: 2 }}>
        <TextField
          autoFocus
          margin="dense"
          id="message"
          label="Type your message"
          type="text"
          fullWidth
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          multiline
          rows={4}
          InputProps={{
            sx: { 
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#00d2ff',
              },
            }
          }}
          InputLabelProps={{
            sx: { color: 'rgba(255, 255, 255, 0.7)' }
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { color: 'white' } 
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSend} 
          variant="contained"
          disabled={!message.trim()}
          sx={{ 
            background: 'linear-gradient(45deg, #00d2ff 0%, #3a7bd5 100%)',
            '&:hover': { filter: 'brightness(1.1)' },
            '&.Mui-disabled': { 
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.3)'
            }
          }}
        >
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
});
export default MessageDialog