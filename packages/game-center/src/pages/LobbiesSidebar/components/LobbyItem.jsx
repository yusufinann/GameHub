import React, { useState, useEffect } from "react";
import {
  ListItem,
  Avatar,
  Tooltip,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useLobbyContext } from "../../MainScreen/MainScreenMiddleArea/LobbyContext";
import { useLobbyDeletion } from "../hooks/useLobbyDeletion";
import { useAuthContext } from "../../../shared/context/AuthContext";
import LobbyPasswordModal from "./LobbyPasswordModal";
import axios from "axios";
import config from "../../../config";
import { useNavigate } from "react-router-dom";

// Tarih formatlama yardımcı fonksiyonu
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Etkinlik zaman bilgisini hesaplayan yardımcı fonksiyon
const getEventTimeInfo = (startDate, startTime, endDate, endTime) => {
  if (!startDate || !startTime) return null;

  const eventDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);
  const now = new Date();

  if (isNaN(eventDateTime.getTime())) return null;

  const difference = eventDateTime - now;

  if (endDateTime < now) return null;

  if (difference < 0 && now < endDateTime) {
    return "The event continues";
  }

  if (difference > 24 * 60 * 60 * 1000) {
    return formatDate(startDate);
  }

  const hours = Math.floor(difference / (1000 * 60 * 60));
  return `${hours} to the event`;
};

export const LobbyItem = ({ lobby, isOpen, colors }) => {
  const { existingLobby } = useLobbyContext();
  const { currentUser } = useAuthContext();
  const { handleDelete } = useLobbyDeletion();
  const [timeInfo, setTimeInfo] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isMember, setIsMember] = useState(lobby.members?.includes(currentUser?.id));
  const [lobbyDetails, setLobbyDetails] = useState(lobby); // Lobi detaylarını saklamak için state
  const [members, setMembers] = useState([]); // Lobi üyelerini saklamak için state
  const navigate = useNavigate();

  // Etkinlik zaman bilgisini güncelle
  useEffect(() => {
    if (lobby.eventType === "event") {
      const updateTime = () => {
        const info = getEventTimeInfo(
          lobby.startDate,
          lobby.startTime,
          lobby.endDate,
          lobby.endTime
        );
        setTimeInfo(info);
      };

      updateTime();
      const timer = setInterval(updateTime, 60000);

      return () => clearInterval(timer);
    }
  }, [lobby]);

  // Lobi ikonunu belirle
  const getIcon = () => {
    if (lobby.password) {
      return <LockIcon />;
    }
    switch (lobby.eventType) {
      case "private":
        return <LockIcon />;
      case "event":
        return <EventIcon />;
      default:
        return <GroupIcon />;
    }
  };

  // Arka plan rengini belirle
  const getBackgroundColor = () => {
    return colors[lobby.eventType] || colors.default || "#ccc";
  };

  // Lobiye katılma işlemi
  const handleJoin = async (password = "") => {
    setIsJoining(true);
    setError("");

    try {
      // Lobiye katılma isteği gönder
      const response = await axios.post(
        `${config.apiBaseUrl}${config.apiEndpoints.joinLobby}/${lobby.lobbyCode}`,
        { password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        setIsJoined(true);
        setIsMember(true); // Kullanıcı artık lobiye üye oldu

        // Lobi detaylarını yeniden çek
        const lobbyDetailsResponse = await axios.get(
          `${config.apiBaseUrl}${config.apiEndpoints.lobbies}/${lobby.lobbyCode}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (lobbyDetailsResponse.status === 200) {
          const updatedLobby = lobbyDetailsResponse.data.lobby;

          // Üyelerin bilgilerini çek
          const membersInfo = await Promise.all(
            updatedLobby.members.map(async (memberId) => {
              const userResponse = await axios.get(
                `${config.apiBaseUrl}${config.apiEndpoints.users}/${memberId}`,
                {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                }
              );
              return userResponse.data;
            })
          );

          // Lobi üyelerini güncelle
          const updatedMembers = membersInfo.map((user) => ({
            id: user.id,
            name: user.name,
            isHost: user.id === updatedLobby.createdBy, // Lobi oluşturan kullanıcı host olur
            isReady: false, // Varsayılan olarak hazır değil
          }));

          // State'leri güncelle
          setLobbyDetails(updatedLobby);
          setMembers(updatedMembers);
        }

        // Lobi sayfasına yönlendir
        setTimeout(() => {
          navigate(`/lobby/${lobby.lobbyCode}`);
        }, 2000);
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.message || "Lobiye katılma başarısız.");
      } else {
        setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } finally {
      setIsJoining(false);
    }
  };

  // Şifre modal'ından gelen şifreyi işle
  const handlePasswordSubmit = (password) => {
    handleJoin(password);
    setIsPasswordModalOpen(false);
  };

  return (
    <>
      <Tooltip
        title={
          isOpen
            ? ""
            : `${lobby.lobbyName || "Unnamed Lobby"} (${
                lobby.eventType || "unknown"
              })`
        }
        arrow
        placement="right"
      >
        <ListItem
          button
          sx={{
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: isOpen ? "flex-start" : "center",
            gap: "12px",
            backgroundColor: isOpen ? getBackgroundColor() : "#FFF",
            color: isOpen ? "#FFF" : "#333",
            transition: "all 0.3s ease",
            padding: isOpen ? "8px 16px" : "8px",
            "&:hover": {
              backgroundColor: isOpen
                ? `${getBackgroundColor()}dd`
                : colors.default,
              color: "#FFF",
            },
          }}
        >
          <Avatar
            sx={{
              bgcolor: getBackgroundColor(),
              width: 40,
              height: 40,
              fontSize: 18,
            }}
          >
            {getIcon()}
          </Avatar>

          {isOpen && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1">
                {lobby.lobbyName || "Unnamed Lobby"}
              </Typography>
              {lobby.eventType === "event" && timeInfo && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "rgba(255, 255, 255, 0.8)",
                    fontSize: "0.75rem",
                  }}
                >
                  {timeInfo}
                </Typography>
              )}
            </Box>
          )}

          {isOpen && lobby.lobbyCode === existingLobby?.lobbyCode && (
            <IconButton
              onClick={(e) => handleDelete(lobby.lobbyCode, e)}
              size="small"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}

          {isOpen && isMember && (
            <IconButton
              onClick={() => navigate(`/lobby/${lobby.lobbyCode}`)}
              size="small"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <ArrowForwardIcon fontSize="small" />
            </IconButton>
          )}

          {isOpen && !isMember && (
            <IconButton
              onClick={() => {
                if (lobby.password) {
                  setIsPasswordModalOpen(true);
                } else {
                  handleJoin();
                }
              }}
              size="small"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                "&:hover": {
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
              disabled={isJoining || isJoined}
            >
              {isJoining ? (
                <CircularProgress size={24} sx={{ color: "#fff" }} />
              ) : isJoined ? (
                <CheckCircleIcon fontSize="small" sx={{ color: "#4caf50" }} />
              ) : (
                <PersonAddIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </ListItem>
      </Tooltip>

      <LobbyPasswordModal
  open={isPasswordModalOpen}
  onClose={() => {
    setIsPasswordModalOpen(false);
    setError(""); // Hata mesajını temizle
  }}
  onPasswordSubmit={handlePasswordSubmit}
  error={error}
  setError={setError} // setError prop'unu ekleyin
  lobbyCode={lobby.lobbyCode}
/>
    </>
  );
};