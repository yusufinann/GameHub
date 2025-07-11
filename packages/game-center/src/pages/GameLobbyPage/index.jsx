import React, { useState} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
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
        }}
      >
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