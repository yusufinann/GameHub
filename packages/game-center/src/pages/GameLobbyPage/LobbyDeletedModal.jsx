import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Fade,
  Paper
} from "@mui/material";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';

const LobbyDeletedModal = ({ open, reason, onClose }) => {
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    if (!open) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
    };
  }, [open, onClose]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        elevation: 8,
        sx: { 
          borderRadius: 2,
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={450}
    >
      <Paper 
        elevation={0}
        sx={{
          borderTop: '6px solid #f44336',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <DialogTitle 
          sx={{ 
            py: 2.5,
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            bgcolor: "#f8f9fa",
            borderBottom: "1px solid #e0e0e0"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ErrorOutlineIcon color="error" fontSize="large" />
            <Typography variant="h6" fontWeight="600">
              Lobby No Longer Available
            </Typography>
          </Box>
          <IconButton 
            edge="end" 
            color="inherit" 
            onClick={onClose}
            aria-label="close"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent 
          sx={{ 
            py: 4,
            px: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#fff'
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              position: 'relative',
              mb: 3
            }}
          >
            <CircularProgress
              variant="determinate"
              value={(countdown / 10) * 100}
              size={80}
              thickness={3}
              sx={{ color: '#f44336' }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h5" component="div" fontWeight="medium" color="text.secondary">
                {countdown}
              </Typography>
            </Box>
          </Box>
          
          <Typography 
            variant="body1" 
            align="center" 
            sx={{ 
              mb: 2,
              fontWeight: 500,
              color: '#333'
            }}
          >
            {reason || "The lobby has been deleted by the host."}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            align="center"
          >
            You will be redirected to the main screen in {countdown} seconds.
          </Typography>
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 2.5, 
            bgcolor: '#f8f9fa',
            borderTop: "1px solid #e0e0e0",
            justifyContent: 'center'
          }}
        >
          <Button 
            onClick={onClose} 
            variant="contained" 
            color="primary"
            startIcon={<HomeIcon />}
            sx={{ 
              px: 4,
              py: 1,
              borderRadius: 1.5,
              boxShadow: 2,
              fontWeight: 500,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            Return to Main Screen
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default LobbyDeletedModal;