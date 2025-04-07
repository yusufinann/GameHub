import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  IconButton,
  Tooltip,
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

const GameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { deleteLobby, leaveLobby, deletedLobbyInfo, clearDeletedLobbyInfo } =
    useLobbyContext();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeletingLobby, setIsDeletingLobby] = useState(false);
  const [isLeavingLobby, setIsLeavingLobby] = useState(false);

  const {
    lobbyDetails,
    loading,
    error,
    setError,
    members,
    userId,
    isPasswordModalOpen,
    setIsPasswordModalOpen,
    handleJoin,
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
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleJoin}
      />
    );
  }

  if (error) {
    return <ErrorScreen error={error} navigate={navigate} />;
  }

  if (!lobbyDetails) {
    return null;
  }

  const isHost = lobbyDetails.createdBy === userId;

  return (
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
      <MembersList members={members} />
      <GameArea
        lobbyInfo={lobbyDetails}
        link={link}
        members={members}
        isHost={isHost}
        onDelete={handleDeleteLobby}
        onLeave={handleLeaveLobby}
        isDeletingLobby={isDeletingLobby}
        isLeavingLobby={isLeavingLobby}
      />
    </Box>
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

const ErrorScreen = ({ error, navigate }) => (
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
      Go Main Screen
    </Button>
  </Box>
);

export default GameLobbyPage;
