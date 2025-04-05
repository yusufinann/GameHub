import React from 'react';
import { IconButton, CircularProgress, Button, Box, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Visibility, Edit as EditIcon, Lock, LockOpen } from "@mui/icons-material";

export const LobbyActions = ({
  isJoined,
  isJoining,
  isCreator,
  onDelete,
  onJoin,
  onNavigate,
  onEdit,
  isMobile,
  lobby ,
  isDeleting
}) => {
  const hasPassword = lobby && lobby.password != null;

  return (
    <>
      {isCreator && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Delete Lobby">
            <IconButton
              onClick={onDelete}
              size="small"
              disabled={isDeleting}
              sx={{
                color: 'rgba(244, 67, 54, 0.7)',
                "&:hover": {
                  color: "rgba(244, 3, 3, 1)",
                  backgroundColor: "rgba(245, 128, 128, 0.1)",
                },
              }}
            >
              {isDeleting ? ( // Show CircularProgress if deleting
                <CircularProgress size={24} sx={{ color: 'rgba(244, 67, 54, 1)' }} />
              ) : (
                <DeleteIcon fontSize="medium" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Lobby">
            <IconButton
              size={isMobile ? 'small' : 'medium'}
              onClick={onEdit}
              sx={{
                color: 'rgba(33, 150, 243, 0.7)',
                "&:hover": {
                  color: "rgba(33, 150, 243, 1)", 
                  backgroundColor: "rgba(33, 150, 243, 0.1)", 
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {isJoined && (
        <Tooltip title="Go to Lobby">
          <IconButton
            onClick={onNavigate}
            size="small"
            sx={{
              color: 'rgba(76, 175, 80, 0.7)',
              "&:hover": {
                color: "rgba(76, 175, 80, 1)",
                backgroundColor: "rgba(76, 175, 80, 0.1)",
              },
            }}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      {!isJoined && !isCreator && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Password Indicator */}
          <Tooltip title={hasPassword ? "Password Protected Lobby" : "Open Lobby"}>
            <IconButton
              size="small"
              sx={{
                color: hasPassword 
                  ? 'rgba(255, 152, 0, 0.7)' 
                  : 'rgba(76, 175, 80, 0.7)',
                "&:hover": {
                  color: hasPassword 
                    ? 'rgba(255, 152, 0, 1)' 
                    : 'rgba(76, 175, 80, 1)',
                },
              }}
            >
              {hasPassword ? <Lock fontSize="small" /> : <LockOpen fontSize="small" />}
            </IconButton>
          </Tooltip>

          <Button
            onClick={onJoin}
            size="small"
            variant="contained"
            startIcon={<Visibility />}
            disabled={isJoining}
            sx={{
              background: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
              color: '#333',
              textTransform: 'none',
              fontWeight: 'bold',
              borderRadius: '20px',
              boxShadow: '0px 3px 10px rgba(0,0,0,0.2)',
              transition: 'background 0.3s, transform 0.3s',
              '&:hover': {
                background: 'linear-gradient(45deg, #fad0c4, #ff9a9e)',
                transform: 'scale(1.05)',
              },
              '&.Mui-disabled': {
                background: 'rgba(0,0,0,0.12)',
                color: 'rgba(0,0,0,0.26)',
              }
            }}
          >
            {isJoining ? (
              <CircularProgress size={24} />
            ) : (
              "Join"
            )}
          </Button>
        </Box>
      )}
    </>
  );
};