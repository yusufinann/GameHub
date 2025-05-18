import React, { useState } from 'react';
import { 
  ListItem, 
  Avatar, 
  ListItemText, 
  Typography, 
  Box, 
  useTheme, 
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import { RemoveCircleOutline as KickIcon } from '@mui/icons-material';

function MemberItem({ member, index, t, onKickPlayer, isCurrentUserHost, currentUserId }) {
  const theme = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };
  
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirmKick = () => {
    if (onKickPlayer) {
      onKickPlayer(member.id);
    }
    setConfirmOpen(false);
  };
  
  return (
    <>
      <ListItem
        sx={{
          mb: 0.5,
          bgcolor: member.isHost 
            ? `${theme.palette.secondary.gold}26` 
            : 'transparent',
          borderRadius: '10px',
          '&:hover': {
            bgcolor: member.isHost 
              ? `${theme.palette.secondary.gold}4D`
              : `${theme.palette.secondary.main}33`, 
          },
          position: 'relative',
          pr: isCurrentUserHost && !member.isHost ? '50px' : '16px',
        }}
      >
        <Avatar
          src={member.avatar || undefined}
          sx={{
            width: 50, 
            height: 50,
            fontSize: '1rem', 
            bgcolor: member.isHost 
              ? theme.palette.secondary.gold 
              : theme.palette.secondary.main,
            border: member.isHost 
              ? `2px solid ${theme.palette.secondary.gold}` 
              : 'none',
            boxShadow: member.isHost 
              ? `0 0 8px ${theme.palette.secondary.gold}99` 
              : 'none',
          }}
        >
          { !member.avatar ? (member.name?.[0] || `P${index + 1}`) : null }
        </Avatar>

        <ListItemText
          primary={
            <Box display="flex" alignItems="center" gap={1}>
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  color: theme.palette.text.primary,
                }}
              >
                {member.name || `Player ${index + 1}`}
              </Typography>
              {member.isHost && (
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: theme.palette.secondary.gold,
                    bgcolor: `${theme.palette.secondary.gold}33`, 
                    px: 1,
                    py: 0.3,
                    borderRadius: '5px',
                  }}
                >
                  {t("Host")}
                </Typography>
              )}
            </Box>
          }
        />
        {isCurrentUserHost && !member.isHost && member.id !== currentUserId && (
          <IconButton
            onClick={handleOpenConfirm}
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.palette.error.main,
              '&:hover': {
                backgroundColor: `${theme.palette.error.main}20`,
              },
            }}
            title={t("Kick Player")}
          >
            <KickIcon />
          </IconButton>
        )}
      </ListItem>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={handleCloseConfirm}
      >
        <DialogTitle>{t("Confirm Kick")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Are you sure you want to kick")} {member.name || `Player ${index + 1}`}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color="primary">
            {t("Cancel")}
          </Button>
          <Button onClick={handleConfirmKick} color="error" variant="contained">
            {t("Kick")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MemberItem;