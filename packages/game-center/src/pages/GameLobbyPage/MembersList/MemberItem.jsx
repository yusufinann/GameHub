import React, { useState } from 'react';
import {
  ListItem,
  Avatar,
  ListItemText,
  Typography,
  Box,
  useTheme,
  IconButton,
} from '@mui/material';
import { RemoveCircleOutline as KickIcon } from '@mui/icons-material';
import ConfirmModal from '../../../shared/components/ConfirmModal';

function MemberItem({ member, index, t, onKickPlayer, isCurrentUserHost, currentUserId }) {
  const theme = useTheme();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isKicking, setIsKicking] = useState(false); 

  const handleOpenConfirm = () => {
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
  };

  const handleConfirmKick = async () => {
     setIsKicking(true); 
    if (onKickPlayer) {
      try {
        await onKickPlayer(member.id); 
      } catch (error) {
        console.error("Failed to kick player:", error);
      }
    }
    setIsKicking(false); 
    setConfirmOpen(false);
  };

  const playerName = member.name || `Player ${index + 1}`;

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
          pr: isCurrentUserHost && !member.isHost && member.id !== currentUserId ? '50px' : '16px',
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
                {playerName}
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

      <ConfirmModal
        open={confirmOpen}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmKick}
        title={t("Confirm Kick", "Confirm Kick")}
        message={t("kickConfirmationMessage", { name: playerName }, `Are you sure you want to kick ${playerName}?`)}
        confirmText={t("Kick", "Kick")}
        cancelText={t("Cancel", "Cancel")}
        confirmButtonColor="error"
        isLoading={isKicking} 
        IconComponent={KickIcon} 
        iconColor={theme.palette.error.main} 
      />
    </>
  );
}

export default MemberItem;