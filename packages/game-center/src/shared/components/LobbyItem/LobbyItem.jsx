import React, { useState, useCallback, memo, useEffect } from "react";
import {
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LobbyInfo } from "./LobbyInfo";
import { LobbyActions } from "./LobbyActions";
import { useAuthContext } from "../../context/AuthContext";
import { useLobbyItem } from "./useLobbyItem";
import LobbyPasswordModal from "../LobbyPasswordModal";
import { Event, Group, People } from "@mui/icons-material";
import ErrorModal from "../ErrorModal";
import LobbyEditModal from "./LobbyEditModal";
import { useLobbyContext } from "../../context/LobbyContext/context";
import { useTranslation } from "react-i18next";

const LobbyTypeChip = memo(function LobbyTypeChip({ lobbyType, isMobile, t }) {
  return (
    <Chip
      size={isMobile ? "small" : "medium"}
      icon={lobbyType === "event" ? <Event /> : <Group />}
      label={t(lobbyType === "event" ? "lobbyTypeEvent" : "lobbyTypeNormal")}
      color={lobbyType === "event" ? "secondary" : "primary"}
      sx={{
        flexShrink: 0,
        fontWeight: 500,
        borderRadius: "16px",
        "& .MuiChip-icon": {
          color: "inherit"
        }
      }}
    />
  );
});

const MembersChip = memo(function MembersChip({ count, maxMembers, theme, isMobile, t }) {
  return (
    <Chip
      size={isMobile ? "small" : "medium"}
      label={t('membersLabel', {
        count: count || 0,
        maxPart: maxMembers ? `/ ${maxMembers}` : ''
      })}
      icon={<People sx={{ fontSize: isMobile ? 16 : 18 }} />}
      sx={{
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.warning.contrastText || "#fff",
        fontWeight: 600,
        px: 0.5,
        borderRadius: "16px",
      }}
    />
  );
});

function LobbyItem({ lobby }) {
  const { t } = useTranslation();
  const { membersByLobby, existingLobby, setIsJoined: setContextIsJoined } = useLobbyContext();
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const {
    isJoining,
    error: joinError,
    handleJoin,
    handleDelete,
    isDeleting,
    isErrorModalOpen: isJoinErrorModalOpen,
    closeErrorModal: closeJoinErrorModal,
  } = useLobbyItem(lobby, currentUser);

  const [isLobbyFullError, setIsLobbyFullError] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isMember = membersByLobby[lobby.lobbyCode]?.some(
    (member) => member.id === currentUser?.id
  );

  useEffect(() => {
    setContextIsJoined(isMember);
  }, [isMember, setContextIsJoined]);


  const [startDate, startTime] = lobby.startTime?.split("T") || [null, null];
  const [endDate, endTime] = lobby.endTime?.split("T") || [null, null];

  const isCreator = currentUser?.id === lobby.createdBy;

  const handleJoinClick = useCallback(async () => {
    try {
      const currentMembersCount = membersByLobby[lobby.lobbyCode]?.length || 0;
      if (lobby.maxMembers && currentMembersCount >= lobby.maxMembers && !isMember) {
        setIsLobbyFullError(true);
        return;
      }

      if (lobby.password && !isMember) {
        setIsPasswordModalOpen(true);
      } else {
        await handleJoin();
      }
    } catch (error) {
      // console.error("Unexpected error in handleJoinClick:", error);
    }
  }, [lobby, membersByLobby, handleJoin, isMember]);


  const handleErrorModalClose = useCallback(() => {
    if (isLobbyFullError) {
      setIsLobbyFullError(false);
    }
    if (isJoinErrorModalOpen) {
      closeJoinErrorModal();
    }
  }, [isLobbyFullError, isJoinErrorModalOpen, closeJoinErrorModal]);


  const handleEditClick = useCallback(() => {
    setIsEditModalOpen(true);
  }, []);

  const handleEditModalClose = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleNavigate = useCallback(() =>
    navigate(`/lobby/${lobby.lobbyCode}`),
    [navigate, lobby.lobbyCode]
  );

  const handleDeleteCallback = useCallback(
    (e) => handleDelete(lobby.lobbyCode, e),
    [handleDelete, lobby.lobbyCode]
  );

  const closePasswordModal = useCallback(() =>
    setIsPasswordModalOpen(false),
    []
  );

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const membersCount = membersByLobby[lobby.lobbyCode]?.length || 0;

  let currentErrorMessage = "";
  if (isLobbyFullError) {
    currentErrorMessage = t('lobbyFullError');
  } else if (isJoinErrorModalOpen && joinError) {
    currentErrorMessage = joinError;
  }

  const renderModals = () => {
    return (
      <>
        {isPasswordModalOpen && (
          <LobbyPasswordModal
            open={isPasswordModalOpen}
            onClose={closePasswordModal}
            onSubmit={async (password) => {
              await handleJoin(password);
              if (!joinError && !isJoinErrorModalOpen) {
                 setIsPasswordModalOpen(false);
              }
            }}
            lobbyDetails={{
              isPasswordProtected: Boolean(lobby.password),
              lobbyCode: lobby.lobbyCode,
              lobbyName: lobby.lobbyName,
            }}
            theme={theme}
          />
        )}

        {(isLobbyFullError || isJoinErrorModalOpen) && (
          <ErrorModal
            open={true}
            onClose={handleErrorModalClose}
            errorMessage={currentErrorMessage}
          />
        )}

        {isEditModalOpen && (
          <LobbyEditModal
            open={isEditModalOpen}
            onClose={handleEditModalClose}
            lobby={lobby}
          />
        )}
      </>
    );
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          borderRadius: "10px",
          m: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "12px",
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          p: { xs: 2, sm: 2.5 },
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          transition: "box-shadow 0.3s ease, background-color 0.3s ease",
          "&:hover": {
            backgroundColor: theme.palette.background.default,
          },
          position: "relative",
          overflow: "hidden",
          "&::after": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }
        }}
      >
        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{
                fontSize: {
                  xs: "1rem",
                  sm: "1.1rem",
                  md: "1.2rem",
                },
                color: theme.palette.text.primary,
                flexGrow: 1,
              }}
            >
              {lobby.lobbyName || t('unnamedLobby')}
            </Typography>
            <LobbyTypeChip lobbyType={lobby.lobbyType} isMobile={isMobile} t={t} />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Stack
              direction={isMobile ? "column" : "row"}
              spacing={1.5}
              sx={{ width: isMobile ? "100%" : "auto" }}
            >
              <MembersChip
                count={membersCount}
                maxMembers={lobby.maxMembers}
                theme={theme}
                isMobile={isMobile}
                t={t}
              />
              {lobby.lobbyType === "event" && (
                <LobbyInfo
                  startDate={startDate}
                  startTime={startTime}
                  endDate={endDate}
                  endTime={endTime}
                  isMobile={isMobile}
                />
              )}
            </Stack>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                width: isMobile ? "100%" : "auto",
                justifyContent: isMobile ? "flex-end" : "flex-start",
                mt: isMobile ? 1 : 0,
              }}
            >
              <LobbyActions
                isJoined={isMember}
                isJoining={isJoining}
                isCreator={isCreator}
                lobbyCode={lobby.lobbyCode}
                existingLobbyCode={existingLobby?.lobbyCode}
                onDelete={handleDeleteCallback}
                onJoin={handleJoinClick}
                onNavigate={handleNavigate}
                isMobile={isMobile}
                onEdit={isCreator ? handleEditClick : undefined}
                lobby={lobby}
                isDeleting={isDeleting}
              />
            </Box>
          </Box>
        </Stack>
      </Paper>

      {renderModals()}
    </>
  );
}

export default memo(LobbyItem);