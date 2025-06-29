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
import MessageModal from "../MessageModal";
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
        borderRadius: "20px",
        height: { xs: 24, sm: 28 },
        "& .MuiChip-icon": {
          color: "inherit",
          fontSize: { xs: 14, sm: 16 }
        },
        "& .MuiChip-label": {
          px: { xs: 0.5, sm: 1 },
          fontSize: { xs: "0.7rem", sm: "0.8rem" }
        }
      }}
    />
  );
});

const MembersChip = memo(function MembersChip({ count, maxMembers, theme, isMobile, t }) {
  return (
    <Chip
      size={isMobile ? "small" : "medium"}
      label={`${count || 0}${maxMembers ? ` / ${maxMembers}` : ''}`}
      icon={<People sx={{ fontSize: isMobile ? 14 : 16 }} />}
      sx={{
        backgroundColor: theme.palette.warning.main,
        color: theme.palette.warning.contrastText || "#fff",
        fontWeight: 600,
        borderRadius: "20px",
        flexShrink: 0,
        height: { xs: 24, sm: 28 },
        "& .MuiChip-label": {
          px: { xs: 0.5, sm: 1 },
          fontSize: { xs: "0.7rem", sm: "0.8rem" }
        }
      }}
    />
  );
});

function LobbyItem({ lobby }) {
  const { t } = useTranslation();
  const { membersByLobby, existingLobby} = useLobbyContext();
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    severity: "error",
    title: undefined,
  });

  const {
    isJoining,
    error: joinErrorData,
    handleJoin,
    handleDelete,
    isDeleting,
    clearError: clearJoinErrorData,
  } = useLobbyItem(lobby, currentUser);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isMember = membersByLobby[lobby.lobbyCode]?.some(
    (member) => member.id === currentUser?.id
  );

  const [startDate, startTime] = lobby.startTime?.split("T") || [null, null];
  const [endDate, endTime] = lobby.endTime?.split("T") || [null, null];

  const isCreator = currentUser?.id === lobby.createdBy;

  const showMessage = useCallback((message, severity = "error", title = undefined) => {
    setModalConfig({ message, severity, title });
    setIsMessageModalOpen(true);
  }, []);

  const handleJoinClick = useCallback(async (passwordProvided) => {
    try {
      const currentMembersCount = membersByLobby[lobby.lobbyCode]?.length || 0;
      if (lobby.maxMembers && currentMembersCount >= lobby.maxMembers && !isMember) {
        showMessage(
          t('lobby.warning.lobbyFull'),
          "warning",
          t('Warning')
        );
        return;
      }

      if (lobby.password && !isMember && typeof passwordProvided !== 'string') {
        setIsPasswordModalOpen(true);
      } else {
        await handleJoin(typeof passwordProvided === 'string' ? passwordProvided : "");
      }
    } catch (error) {
      console.error("Unexpected error in handleJoinClick (not from API):", error);
       if (!joinErrorData) { 
          showMessage(error.message || t('common.error'), "error", t('Error'));
      }
    }
  }, [lobby, membersByLobby, handleJoin, isMember, t, showMessage, joinErrorData]);

  useEffect(() => {
    if (joinErrorData && joinErrorData.message) {
      let message = joinErrorData.message;
      let severity = joinErrorData.severity || "error";
      let title = "";

      if (joinErrorData.errorKey) {
        switch (joinErrorData.errorKey) {
          case "lobby.gameInProgress":
          case "lobby.full":
            title = t('Warning');
            severity = "warning";
            break;
          case "lobby.invalidPassword":
            title = t('passwordModal.invalidPasswordTitle');
            severity = "warning";
            break;
          default:
            title = severity === "warning" ? t('Warning') : t('Error');
        }
      } else {
        title = severity === "warning" ? t('Warning') : t('Error');
      }
      
      showMessage(message, severity, title);
    }
  }, [joinErrorData, t, showMessage]);

  const handleMessageModalClose = useCallback(() => {
    setIsMessageModalOpen(false);
    if (joinErrorData) {
        clearJoinErrorData();
    }
  }, [clearJoinErrorData, joinErrorData]);

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

  const renderModals = () => {
    return (
      <>
        {isPasswordModalOpen && (
          <LobbyPasswordModal
            open={isPasswordModalOpen}
            onClose={closePasswordModal}
            onSubmit={async (password) => {
              try {
                await handleJoinClick(password);
              } catch (err) {
                console.error("Error in LobbyPasswordModal onSubmit after calling handleJoinClick:", err);
              }
            }}
            lobbyDetails={{
              isPasswordProtected: Boolean(lobby.password),
              lobbyCode: lobby.lobbyCode,
              lobbyName: lobby.lobbyName,
            }}
          />
        )}

        <MessageModal
            open={isMessageModalOpen}
            onClose={handleMessageModalClose}
            message={modalConfig.message}
            severity={modalConfig.severity}
            title={modalConfig.title}
        />

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
        elevation={2}
        sx={{
          borderRadius: "12px",
          m: { xs: 0.5, sm: 1 },
          display: "flex",
          flexDirection: "column",
          background: theme.palette.background.paper,
          color: theme.palette.text.primary,
          p: { xs: 1, sm: 1.25 },
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: theme.palette.background.default,
            transform: "translateY(-1px)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
          },
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: "auto", sm: "120px" },
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={1} sx={{ height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "flex-start" : "center", 
              justifyContent: "space-between",
              gap: 1,
              minHeight: "fit-content",
            }}
          >
            <Typography
              variant={isMobile ? "subtitle1" : "h3"}
              title={lobby.lobbyName || t('unnamedLobby')}
              sx={{
                fontSize: {
                  xs: "0.95rem",
                  sm: "1.05rem",
                  md: "1.1rem",
                },
                color: theme.palette.text.primary,
                flexGrow: 1,
                lineHeight: 1.3,
                fontWeight: 500,
                mb: isMobile ? 0.5 : 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {lobby.lobbyName || t('unnamedLobby')}
            </Typography>
            <LobbyTypeChip lobbyType={lobby.lobbyType} isMobile={isMobile} t={t} />
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              flexGrow: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: 1,
                flexWrap: "wrap", 
                minHeight: "fit-content",
              }}
            >
              <MembersChip
                count={membersCount}
                maxMembers={lobby.maxMembers}
                theme={theme}
                isMobile={isMobile}
                t={t}
              />
              
              {lobby.lobbyType === "event" && (
                <Box 
                  sx={{ 
                    flexGrow: 1, 
                    maxWidth: isMobile ? "100%" : "auto",
                    minWidth: isMobile ? "100%" : "250px" 
                  }}
                >
                  <LobbyInfo
                    startDate={startDate}
                    startTime={startTime}
                    endDate={endDate}
                    endTime={endTime}
                    isMobile={isMobile}
                    t={t}
                  />
                </Box>
              )}
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: isMobile ? "center" : "flex-end",
                alignItems: "center",
                gap: 0.75,
                mt: "auto", 
                minHeight: "36px", 
                flexShrink: 0, 
              }}
            >
              <LobbyActions
                isJoined={isMember}
                isJoining={isJoining}
                isCreator={isCreator}
                lobbyCode={lobby.lobbyCode}
                existingLobbyCode={existingLobby?.lobbyCode}
                onDelete={handleDeleteCallback}
                onJoin={() => handleJoinClick()}
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