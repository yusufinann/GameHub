import React, { useState, useEffect, useCallback } from "react";
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
import { useLobbyContext } from "../../pages/MainScreen/MainScreenMiddleArea/context";
import { useAuthContext } from "../context/AuthContext";
import { useLobbyItem } from "./useLobbyItem";
import LobbyPasswordModal from "../LobbyPasswordModal";
import { useWebSocket } from "../context/WebSocketContext/context";
import { Event, Group, People } from "@mui/icons-material";

const COLORS = {
  normal: "rgb(25,118,210)",
  event: "rgb(156,39,176)",
  default: "#87CEEB",
};

function LobbyItem({ lobby}) {
  const { existingLobby, setMembersByLobby,membersByLobby } = useLobbyContext();
  const { currentUser } = useAuthContext();
  const navigate = useNavigate();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { isJoining, isMember, handleJoin, handleDelete, eventStatus } =
    useLobbyItem(lobby, currentUser);
  const { socket } = useWebSocket();
  const [isHostLeft, setIsHostLeft] = useState(false);

  const handleWebSocketMessage = useCallback(
    (event) => {
      const data = JSON.parse(event.data);
      if (data.lobbyCode !== lobby.lobbyCode) return;

      if (data.type === "HOST_RETURNED") {
        setIsHostLeft(false);
        setMembersByLobby((prev) => ({
          ...prev,
          [lobby.lobbyCode]: prev[lobby.lobbyCode].map((member) =>
            member.id === currentUser.id ? { ...member, isHost: true } : member
          ),
        }));
      }

      if (data.type === "HOST_LEAVE_TIMEOUT") {
        setIsHostLeft(true);
      }
    },
    [lobby.lobbyCode, currentUser, setMembersByLobby]
  );
  useEffect(() => {
    if (!socket) return;
    const handleWebSocketMessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.lobbyCode !== lobby.lobbyCode) return;
      switch (data.type) {
        case "HOST_RETURNED":
          // Reset host state
          setIsHostLeft(false);
          break;
        case "HOST_LEAVE_TIMEOUT":
          setIsHostLeft(true);
          break;
        default:
          console.warn(`Unhandled WebSocket event type: ${data.type}`);
      }
    };
    socket.addEventListener("message", handleWebSocketMessage);
    return () => socket.removeEventListener("message", handleWebSocketMessage);
  }, [socket, handleWebSocketMessage, lobby.lobbyCode]);

  const getBackgroundColor = () => {
    if (eventStatus === "host_left" || isHostLeft) return "#808080";
    if (lobby.lobbyType === "event") return COLORS.event;
    if (lobby.lobbyType === "normal") return COLORS.normal;
    return COLORS[lobby.eventType] || COLORS.default;
  };

  const [startDate, startTime] = lobby.startTime?.split("T") || [null, null];
  const [endDate, endTime] = lobby.endTime?.split("T") || [null, null];

  const isCreator = currentUser?.id === lobby.createdBy;
  const handleJoinClick = () =>
    lobby.password ? setIsPasswordModalOpen(true) : handleJoin();
  const handleNavigate = () => navigate(`/lobby/${lobby.lobbyCode}`);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <>
      <Paper
        elevation={2}
        sx={{
          borderRadius: "8px",
          minWidth: {
            xs: "10px", // Minimum genişlik - çok küçük ekranlar
            sm: "10px", // Tablet
            md: "10px", // Desktop
          },
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start",
          gap: "12px",
          background:"rgba(255, 255, 255, 0.8)",
          opacity: eventStatus === "host_left" || isHostLeft ? 0.5 : 1,
          color:theme.palette.text.primary
            ,
          p: { xs: 1.5, sm: 1.5 } ,
          padding:"8px 16px",
          transition: theme.transitions.create(["all"], {
            duration: theme.transitions.duration.standard,
          }),
          "&:hover": {
            background:"rgba(255, 255, 255, 1)",
            transform: "translateY(-3px)",
          },
        }}
      >
      
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography
                variant={isMobile ? "h6" : "subtitle1"}
                sx={{
                  fontWeight: "bold",
                  fontSize: {
                    xs: "0.9rem",
                    sm: "1rem",
                    md: "1.1rem",
                  },
                  color: theme.palette.text.primary,
                  flexGrow: 1,
                }}
              >
                {lobby.lobbyName || "Unnamed Lobby"}
              </Typography>
              <Chip
                size={isMobile ? "small" : "medium"}
                icon={lobby.lobbyType === "event" ? <Event /> : <Group />}
                label={lobby.lobbyType === "event" ? "Event" : "Normal"}
                color={lobby.lobbyType === "event" ? "secondary" : "primary"}
                sx={{ flexShrink: 0 }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={1}
                sx={{ width: isMobile ? "100%" : "auto" }}
              >
                <Chip
                  size={isMobile ? "small" : "medium"}
                  label={lobby.members.length}
                  icon={<People sx={{ fontSize: isMobile ? 14 : 16 }} />}
                  sx={{
                    backgroundColor: theme.palette.warning.light,
                    color: theme.palette.warning.contrastText,
                    fontWeight: "bold",
                  }}
                />
                {lobby.lobbyType === "event" && (
                  <LobbyInfo
                    startDate={startDate}
                    startTime={startTime}
                    endDate={endDate}
                    endTime={endTime}
                    eventStatus={eventStatus}
                    isMobile={isMobile}
                  />
                )}
              </Stack>
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  width: isMobile ? "100%" : "auto",
                  justifyContent: isMobile ? "flex-end" : "flex-start",
                }}
              >
                <LobbyActions
                  isJoined={isMember}
                  isJoining={isJoining}
                  isCreator={isCreator}
                  lobbyCode={lobby.lobbyCode}
                  existingLobbyCode={existingLobby?.lobbyCode}
                  onDelete={(e) => handleDelete(lobby.lobbyCode, e)}
                  onJoin={handleJoinClick}
                  onNavigate={handleNavigate}
                  isMobile={isMobile}
                />
              </Box>
            </Box>
          </Stack>
        

        {isHostLeft && (
          <Typography color="error" variant="caption">
            Lobby closed - Host did not return
          </Typography>
        )}
      </Paper>

      <LobbyPasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleJoin}
      />
    </>
  );
}

export default LobbyItem;
