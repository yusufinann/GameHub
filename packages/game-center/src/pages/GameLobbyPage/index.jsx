import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
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
const GameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { 
    deleteLobby, 
    leaveLobby, 
    deletedLobbyInfo, 
    clearDeletedLobbyInfo,   
    userLeftInfo, 
    setUserLeftInfo 
  } = useLobbyContext();
  
  const handleCloseSnackbar = () => {
    setUserLeftInfo(null);
  };
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeletingLobby, setIsDeletingLobby] = useState(false);
  const [isLeavingLobby, setIsLeavingLobby] = useState(false);

  const{t}=useTranslation();
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
    isMember // Assuming this is provided by your hook or needs to be added
  } = useGameLobbyPage();

  // Check if the current user is a member of the lobby
  const checkIsMember = () => {
    if (!members || !userId) return false;
    return members.some(member => member.id === userId);
  };

  // Use the value from the hook if available, otherwise calculate it
  const userIsMember = isMember !== undefined ? isMember : checkIsMember();

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

  // If the user is not a member and the lobby exists, redirect them or show access denied
  useEffect(() => {
    if (!loading && lobbyDetails && !userIsMember && !isPasswordModalOpen) {
      // Option 1: Redirect to homepage
      // navigate("/");
      
      // Option 2: Show access denied screen (we'll use this)
      setError("Access denied. You are not a member of this lobby.");
    }
  }, [loading, lobbyDetails, userIsMember, isPasswordModalOpen]);

  const toggleFullscreen = () => {
    const gameLobbyElement = document.getElementById("gameLobbyPage");

    if (!document.fullscreenElement) {
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
    setIsDeletingLobby(true);
    try {
      await deleteLobby(lobbyDetails.lobbyCode);
    } catch (err) {
      setError("An error occurred while deleting the lobby.");
    } finally {
      setIsDeletingLobby(false);
    }
  };

  const handleLeaveLobby = async () => {
    setIsLeavingLobby(true);
    try {
      await leaveLobby(lobbyDetails.lobbyCode, userId);
      navigate("/");
    } catch (err) {
      setError("An error occurred while leaving the lobby.");
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (isPasswordModalOpen) {
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
    return null;
  }

  if (!userIsMember) {
    return (
      <AccessDeniedScreen navigate={navigate} t={t}/>
    );
  }

  const isHost = lobbyDetails.createdBy === userId;
  return (
    <>
      <Box
        id="gameLobbyPage"
        sx={{
          p: 1,
          height: "100vh",
          display: "flex",
          gap: 1,
          position: "relative",
          ...(isFullscreen && {
            minHeight: "100vh",
            p: 2,
            bgcolor: "#f5f5f5",
          }),
        }}
      >
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
          <IconButton
            onClick={toggleFullscreen}
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              zIndex: 1000,
              bgcolor: "white",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.9)",
              },
            }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        <MembersList members={members} t={t} />
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
          {userLeftInfo?.name} {t("lobiden ayrıldı")}!
        </Alert>
      </Snackbar>
    </>
  );
};

const LoadingScreen = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    }}
  >
    <CircularProgress />
  </Box>
);

const ErrorScreen = ({ error, navigate,t }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <Typography variant="h6" color="error">
      {error}
    </Typography>
    <Button variant="contained" onClick={() => navigate("/")}>
      {t("Go Main Screen")}
    </Button>
  </Box>
);

const AccessDeniedScreen = ({ navigate,t }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <Typography variant="h5" color="error">
      {t("Access Denied")}
    </Typography>
    <Typography variant="body1">
      {t("You're not a member of this lobby. Please join the lobby first")}.
    </Typography>
    <Button variant="contained" onClick={() => navigate("/")}>
      {t("Go to Main Screen")}
    </Button>
  </Box>
);

export default GameLobbyPage;