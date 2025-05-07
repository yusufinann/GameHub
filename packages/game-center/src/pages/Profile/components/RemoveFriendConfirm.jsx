import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Avatar,
  Box,
  Typography
} from '@mui/material';
import { Warning } from '@mui/icons-material';

const RemoveFriendConfirm = ({ 
  open, 
  onClose, 
  onConfirm, 
  friendName, 
  friendAvatar,
  theme,
  t 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }
      }}
    >
      <DialogTitle sx={{ 
        background:theme.palette.success.main,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 2,
      }}>
        <Warning />
        {t('removeFriendConfirm.title', 'Remove Friend')}
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2, 
          mb: 2,
          p: 2,
          borderRadius: 2,
          background: 'rgba(0,0,0,0.03)'
        }}>
          <Avatar
            src={friendAvatar}
            alt={friendName}
            sx={{ width: 60, height: 60 }}
          />
          <Typography variant="h6">
            {friendName}
          </Typography>
        </Box>
        
        <DialogContentText>
        {t('removeFriendConfirm.message', 'Are you sure you want to remove this user from your friends?', { friendName: friendName })}
        </DialogContentText>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderColor: 'rgba(0,0,0,0.2)',
            color: 'rgba(0,0,0,0.7)',
            '&:hover': {
              borderColor: 'rgba(0,0,0,0.5)',
              background: 'rgba(0,0,0,0.03)',
            }
          }}
        >
          {t('Cancel')}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #FF5370 30%, #ff867f 90%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF3D57 30%, #ff6e69 90%)',
            }
          }}
        >
          {t('removeFriendConfirm.confirmButton', 'Remove Friend')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveFriendConfirm;