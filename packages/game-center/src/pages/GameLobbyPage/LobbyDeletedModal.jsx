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
import { paletteTokens } from "../../theme/palette";

const LobbyDeletedModal = ({ open, reason, onClose, isDark = false }) => {
  const [countdown, setCountdown] = useState(10);
  const palette = isDark ? paletteTokens.dark : paletteTokens.light;
  
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
          borderTop: `6px solid ${palette.error.main}`,
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
            bgcolor: palette.background.paper,
            borderBottom: `1px solid ${palette.background.elevation[1]}`
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <ErrorOutlineIcon sx={{ color: palette.error.main }} fontSize="large" />
            <Typography variant="h6" fontWeight="600" sx={{ color: palette.text.primary }}>
              Lobby No Longer Available
            </Typography>
          </Box>
          <IconButton 
            edge="end" 
            sx={{ color: palette.text.secondary }}
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
            bgcolor: palette.background.paper
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
              sx={{ color: palette.error.main }}
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
              <Typography variant="h5" component="div" fontWeight="medium" sx={{ color: palette.text.secondary }}>
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
              color: palette.text.primary
            }}
          >
            {reason || "The lobby has been deleted by the host."}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ color: palette.text.secondary }}
            align="center"
          >
            You will be redirected to the main screen in {countdown} seconds.
          </Typography>
        </DialogContent>
        
        <DialogActions 
          sx={{ 
            p: 2.5, 
            bgcolor: palette.background.paper,
            borderTop: `1px solid ${palette.background.elevation[1]}`,
            justifyContent: 'center'
          }}
        >
          <Button 
            onClick={onClose} 
            variant="contained" 
            sx={{ 
              px: 4,
              py: 1,
              borderRadius: 1.5,
              boxShadow: 2,
              fontWeight: 500,
              bgcolor: palette.primary.main,
              color: palette.primary.contrastText,
              '&:hover': {
                bgcolor: palette.primary.dark,
                boxShadow: 4
              }
            }}
            startIcon={<HomeIcon />}
          >
            Return to Main Screen
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default LobbyDeletedModal;