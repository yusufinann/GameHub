import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import MembersList from "./MembersList/MembersList";
import GameArea from "./GameArea/GameArea";
import { useGameLobbyPage } from "./useGameLobbyPage";
import LobbyPasswordModal from "../../shared/components/LobbyPasswordModal";
import LobbyDeletedModal from "./LobbyDeletedModal";
import { useLobbyContext } from "../../shared/context/LobbyContext/context";
import { useTranslation } from "react-i18next";
import { LoadingScreen, ErrorScreen, AccessDeniedScreen } from "./LobbyStatusScreens";

const GameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const {
    deleteLobby,
    leaveLobby,
    deletedLobbyInfo,
    clearDeletedLobbyInfo,
    userLeftInfo,
    setUserLeftInfo,
  } = useLobbyContext();

  const handleCloseSnackbar = () => {
    setUserLeftInfo(null);
  };

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeletingLobby, setIsDeletingLobby] = useState(false);
  const [isLeavingLobby, setIsLeavingLobby] = useState(false);

  const { t } = useTranslation();
  const {
    lobbyDetails,
    loading,
    error,
    setError,
    members,
    userId,
    isPasswordModalOpen,
    handleJoin,
    handlePasswordModalClose,
    isMember,
  } = useGameLobbyPage();

  const handleDeletedModalClose = () => {
    clearDeletedLobbyInfo();
    navigate("/");
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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

  const handleDeleteLobby = async () => {
    if (!lobbyDetails) return;
    setIsDeletingLobby(true);
    try {
      await deleteLobby(lobbyDetails.lobbyCode);
    } catch (err) {
      setError(t("errors.deletingLobby", "An error occurred while deleting the lobby."));
    } finally {
      setIsDeletingLobby(false);
    }
  };

  const handleLeaveLobby = async () => {
    if (!lobbyDetails || !userId) return;
    setIsLeavingLobby(true);
    try {
      await leaveLobby(lobbyDetails.lobbyCode, userId);
      navigate("/");
    } catch (err) {
      setError(t("errors.leavingLobby", "An error occurred while leaving the lobby."));
    } finally {
      setIsLeavingLobby(false);
    }
  };

  if (
    deletedLobbyInfo &&
    lobbyDetails && 
    deletedLobbyInfo.lobbyCode === lobbyDetails.lobbyCode
  ) {
    return (
      <LobbyDeletedModal
        open={true}
        reason={deletedLobbyInfo.reason}
        onClose={handleDeletedModalClose}
      />
    );
  }
  
  if (deletedLobbyInfo && !lobbyDetails && deletedLobbyInfo.lobbyCode === link) {
    return (
      <LobbyDeletedModal
        open={true}
        reason={deletedLobbyInfo.reason}
        onClose={handleDeletedModalClose}
      />
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (isPasswordModalOpen && lobbyDetails) {
    return (
      <LobbyPasswordModal
        open={isPasswordModalOpen}
        onClose={handlePasswordModalClose}
        onSubmit={handleJoin}
        lobbyDetails={lobbyDetails}
      />
    );
  }

  if (error) {
    return <ErrorScreen error={error} navigate={navigate} t={t} />;
  }

  if (!lobbyDetails) {
    return <ErrorScreen error={t("lobby.dataCouldNotBeLoaded", "Lobby data could not be loaded.")} navigate={navigate} t={t} />;
  }

  if (!isMember) {
    return (
      <AccessDeniedScreen navigate={navigate} t={t} />
    );
  }

  const isHost = String(lobbyDetails.createdBy) === String(userId);

  return (
    <>
      <Box
        id="gameLobbyPage"
        sx={{
          height: "calc(100vh - 20px)",
          display: "flex",
          position: "relative",
          borderTopRightRadius:'24px', 
          borderBottomRightRadius:'24px',
          ...(isFullscreen && {
            minHeight: "100vh",
            maxHeight: "100vh",
            overflow: "hidden", 
            p: 2, 
            bgcolor: "background.default", 
          }),
        }}
      >
        <Tooltip title={isFullscreen ? t("fullscreen.exit") : t("fullscreen.enter")}>
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
              zIndex: (theme) => theme.zIndex.drawer + 1,
              bgcolor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(4px)",
              boxShadow: 3,
              "&:hover": {
                bgcolor: "rgba(255, 255, 255, 0.9)",
              },
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        <MembersList
          members={members}
          t={t}
          lobbyCode={lobbyDetails.lobbyCode}
          currentLobbyCreatorId={lobbyDetails.createdBy}
        />
        <GameArea
          lobbyInfo={lobbyDetails}
          link={link} 
          members={members}
          isHost={isHost}
          onDelete={handleDeleteLobby}
          onLeave={handleLeaveLobby}
          isDeletingLobby={isDeletingLobby}
          isLeavingLobby={isLeavingLobby}
          t={t}
        />
      </Box>
      <Snackbar
        open={Boolean(userLeftInfo && userLeftInfo.lobbyCode === lobbyDetails?.lobbyCode)}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        sx={{
          marginBottom: 4
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="info"
          variant="filled"
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {userLeftInfo?.name} {t("notifications.userLeftLobby", { name: userLeftInfo?.name, defaultValue: `${userLeftInfo?.name} left the lobby!`})}
        </Alert>
      </Snackbar>
    </>
  );
};

export default GameLobbyPage;