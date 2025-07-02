import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useTheme,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  ExitToApp as ExitIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import LobbyTimer from "./LobbyTimer";
import ConfirmModal from '../../../../../shared/components/ConfirmModal';

const GameAreaHeader = ({
  lobbyInfo,
  isHost,
  onDelete: onDeleteProp,
  onLeave: onLeaveProp,
  isDeletingLobby,
  isLeavingLobby,
  t
}) => {
  const theme = useTheme();
  const [confirmModalState, setConfirmModalState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: '',
    confirmButtonColor: 'primary',
    action: null,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);

      const gameLobbyElement = document.getElementById("gameLobbyPage");
      if (gameLobbyElement) {
        if (isCurrentlyFullscreen) {
          gameLobbyElement.style.minHeight = '100vh';
          gameLobbyElement.style.maxHeight = '100vh';
          gameLobbyElement.style.overflow = 'hidden';
          gameLobbyElement.style.padding = '16px'; // p: 2
          gameLobbyElement.style.backgroundColor = theme.palette.background.default;
        } else {
          gameLobbyElement.style.minHeight = '';
          gameLobbyElement.style.maxHeight = '';
          gameLobbyElement.style.overflow = '';
          gameLobbyElement.style.padding = '';
          gameLobbyElement.style.backgroundColor = '';
        }
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [theme]);

  const toggleFullscreen = () => {
    const gameLobbyElement = document.getElementById("gameLobbyPage");

    if (!document.fullscreenElement && gameLobbyElement) {
      gameLobbyElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const getGameName = (gameId) => {
    switch (gameId) {
      case "1":
        return t("Bingo Game");
      case "2":
        return t("Hangman Game");
      case "3":
        return t("Uno Game");
      case "4":
        return t("Chess Game");
      default:
        return t("Other Game");
    }
  };

  const handleOpenDeleteConfirm = () => {
    setConfirmModalState({
      open: true,
      title: t('confirmDeleteLobbyTitle', 'Confirm Delete Lobby'),
      message: t('confirmDeleteLobbyMessage', 'Are you sure you want to delete this lobby? This action cannot be undone.'),
      confirmText: t('common.delete', 'Delete'),
      confirmButtonColor: 'error',
      action: 'delete',
    });
  };

  const handleOpenLeaveConfirm = () => {
    setConfirmModalState({
      open: true,
      title: t('confirmLeaveLobbyTitle', 'Confirm Leave Lobby'),
      message: t('confirmLeaveLobbyMessage', 'Are you sure you want to leave this lobby?'),
      confirmText: t('common.leave', 'Leave'),
      confirmButtonColor: 'warning',
      action: 'leave',
    });
  };

  const handleModalClose = () => {
    setConfirmModalState(prev => ({ ...prev, open: false }));
  };

  const handleModalConfirm = () => {
    if (confirmModalState.action === 'delete') {
      onDeleteProp();
    } else if (confirmModalState.action === 'leave') {
      onLeaveProp();
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          background: theme.palette.background.gradient,
          color: theme.palette.text.contrast,
          boxShadow: `0 8px 32px ${theme.palette.background.elevation[3]}`,
          borderTopRightRadius: '24px',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.background.gradientFadeBg,
            zIndex: 0,
          }
        }}
      >
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: theme.palette.text.contrast,
                textShadow: `2px 2px 8px ${theme.palette.background.elevation[3]}`,
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))',
              }}
            >
              <GameIcon 
                fontSize="large" 
                sx={{ 
                  color: theme.palette.secondary.main,
                  filter: 'drop-shadow(0 0 8px currentColor)',
                }} 
              />
              {lobbyInfo.lobbyName}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                background: theme.palette.text.gradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                fontWeight: "bold",
                textShadow: `1px 1px 4px ${theme.palette.background.elevation[2]}`,
              }}
            >
              <StarsIcon 
                fontSize="large" 
                sx={{ 
                  color: theme.palette.secondary.gold,
                  filter: 'drop-shadow(0 0 6px currentColor)',
                  WebkitTextFillColor: theme.palette.secondary.gold,
                }} 
              />
              {getGameName(lobbyInfo.game)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Tooltip title={isFullscreen ? t("fullscreen.exit", "Exit Fullscreen") : t("fullscreen.enter", "Enter Fullscreen")}>
              <IconButton
                onClick={toggleFullscreen}
                sx={{
                  color: theme.palette.text.contrast,
                  background: `linear-gradient(135deg, ${theme.palette.background.paper}40, ${theme.palette.background.card}60)`,
                  backdropFilter: 'blur(10px)',
                  border: `2px solid ${theme.palette.primary.light}`,
                  boxShadow: `0 8px 24px ${theme.palette.background.elevation[2]}`,
                  transition: "all 0.3s ease",
                   "&:hover": {
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}30, ${theme.palette.primary.main}20)`,
                      border: `2px solid ${theme.palette.primary.main}`,
                      boxShadow: `0 12px 32px ${theme.palette.primary.main}40`,
                      transform: "translateY(-2px)",
                    },
                }}
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>

            {isHost && (
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenDeleteConfirm}
                startIcon={<ExitIcon />}
                disabled={isDeletingLobby}
                sx={{
                  borderRadius: "20px",
                  textTransform: "none",
                  background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                  boxShadow: `0 8px 24px ${theme.palette.error.main}40`,
                  transition: "all 0.3s ease",
                  fontWeight: "bold",
                  px: 4,
                  py: 1.5,
                  border: `1px solid ${theme.palette.error.light}`,
                  position: 'relative',
                  overflow: 'hidden',
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
                    boxShadow: `0 12px 32px ${theme.palette.error.main}60`,
                    transform: "translateY(-2px)",
                  },
                  "&:before": {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  "&:hover:before": {
                    left: '100%',
                  }
                }}
              >
                {isDeletingLobby ? (
                  <CircularProgress 
                    size={20} 
                    sx={{ 
                      color: theme.palette.text.contrast, 
                      mr: 1 
                    }} 
                  />
                ) : (
                  t('Delete Lobby')
                )}
              </Button>
            )}
            
            <Button
              variant="outlined"
              onClick={handleOpenLeaveConfirm}
              startIcon={<ExitIcon />}
              disabled={isLeavingLobby}
              sx={{
                borderRadius: "20px",
                textTransform: "none",
                background: `linear-gradient(135deg, ${theme.palette.background.paper}40, ${theme.palette.background.card}60)`,
                backdropFilter: 'blur(10px)',
                border: `2px solid ${theme.palette.primary.light}`,
                color: theme.palette.text.contrast,
                boxShadow: `0 8px 24px ${theme.palette.background.elevation[2]}`,
                transition: "all 0.3s ease",
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                position: 'relative',
                overflow: 'hidden',
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.light}30, ${theme.palette.primary.main}20)`,
                  border: `2px solid ${theme.palette.primary.main}`,
                  boxShadow: `0 12px 32px ${theme.palette.primary.main}40`,
                  transform: "translateY(-2px)",
                },
                "&:before": {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  transition: 'left 0.5s',
                },
                "&:hover:before": {
                  left: '100%',
                }
              }}
            >
              {isLeavingLobby ? (
                <CircularProgress 
                  size={20} 
                  sx={{ 
                    color: theme.palette.text.contrast, 
                    mr: 1 
                  }} 
                />
              ) : (
                t('Leave Lobby')
              )}
            </Button>
          </Box>
        </Box>

        {lobbyInfo.lobbyType === "event" && (
          <Box
            sx={{
              px: 2,
              pb: 1.5,
              borderTop: `1px solid ${theme.palette.primary.light}60`,
              mt: 0.5,
              position: 'relative',
              zIndex: 1,
              background: `linear-gradient(90deg, ${theme.palette.background.elevation[1]}, ${theme.palette.background.elevation[2]})`,
              backdropFilter: 'blur(5px)',
            }}
          >
            <LobbyTimer lobbyInfo={lobbyInfo} t={t}/>
          </Box>
        )}
      </Box>

      <ConfirmModal
        open={confirmModalState.open}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        title={confirmModalState.title}
        message={confirmModalState.message}
        confirmText={confirmModalState.confirmText}
        confirmButtonColor={confirmModalState.confirmButtonColor}
        isLoading={
          (confirmModalState.action === 'delete' && isDeletingLobby) ||
          (confirmModalState.action === 'leave' && isLeavingLobby)
        }
      />
    </>
  );
};

export default GameAreaHeader;