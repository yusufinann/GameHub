import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  ExitToApp as ExitIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
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
          background: `linear-gradient(90deg, ${theme.palette.primary.darker}, ${theme.palette.success.main})`,
          color: theme.palette.text.contrast,
          boxShadow: `0 6px 24px ${theme.palette.primary.main}66`,
          borderTopRighttRadius:'24px',
        }}
      >
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* H4 VE H5'İ İÇEREN ANA BOX. H4 VE H5 ARASINDAKİ BOŞLUK İÇİN 'gap' EKLENDİ */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 /* veya istediğiniz bir değer */ }}>
            <Typography // BU <h4> ETİKETİ
              variant="h4"
              sx={{
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                gap: 1.5, // GameIcon ve lobbyInfo.lobbyName arasındaki boşluk
                color: theme.palette.text.contrast,
                textShadow: `2px 2px 4px ${theme.palette.background.elevation[2]}`,
              }}
            >
              <GameIcon fontSize="large" />
              {lobbyInfo.lobbyName}
            </Typography>

            {/* H5 ŞİMDİ H4'ÜN KARDEŞİ (sibling) */}
            <Typography // BU <h5> ETİKETİ
              variant="h5"
              sx={{
                color: theme.palette.info.light,
                display: "flex",
                alignItems: "center",
                gap: 2, // StarsIcon ve getGameName arasındaki boşluk
                fontWeight: "bold",
                textShadow: `1px 1px 2px ${theme.palette.background.elevation[1]}`,
              }}
            >
              <StarsIcon fontSize="large" />
              {getGameName(lobbyInfo.game)}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {isHost && (
              <Button
                variant="contained"
                color="error"
                onClick={handleOpenDeleteConfirm}
                startIcon={<ExitIcon />}
                disabled={isDeletingLobby}
                sx={{
                  borderRadius: "16px",
                  textTransform: "none",
                  boxShadow: `0 6px 16px ${theme.palette.background.elevation[3]}`,
                  transition: "all 0.3s ease",
                  fontWeight: "bold",
                  px: 3.5,
                  py: 1.5,
                  "&:hover": {
                    backgroundColor: theme.palette.error.dark,
                  },
                }}
              >
                {isDeletingLobby ? <CircularProgress size={24} sx={{ color: theme.palette.text.contrast, mr: 1 }} /> : t('Delete Lobby')}
              </Button>
            )}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<ExitIcon />}
              disabled={isLeavingLobby}
              sx={{
                borderRadius: "16px",
                textTransform: "none",
                boxShadow: `0 6px 16px ${theme.palette.background.elevation[1]}`,
                "&:hover": {
                  boxShadow: `0 8px 20px ${theme.palette.background.elevation[2]}`,
                  transform: "translateY(-2px)",
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
                transition: "all 0.3s ease",
                fontWeight: "bold",
                border: `2px solid ${theme.palette.text.contrast}`,
                px: 3.5,
                py: 1.5,
                fontSize: '1rem',
              }}
              onClick={handleOpenLeaveConfirm}
            >
              {isLeavingLobby ? <CircularProgress size={24} sx={{ color: theme.palette.text.contrast, mr: 1 }} /> : t('Leave Lobby')}
            </Button>
          </Box>
        </Box>

        {lobbyInfo.lobbyType === "event" && (
          <Box
            sx={{
              px: 1.5,
              pb: 1,
              borderTop: `1px solid ${theme.palette.primary.light}40`,
              mt: 0.5
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