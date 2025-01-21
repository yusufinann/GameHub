import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import MembersList from "./components/MembersList/MembersList";
import GameArea from "./components/GameArea";
import { useLobbyDeletion } from "../LobbiesSidebar/hooks/useLobbyDeletion";
import axios from "axios";
import config from "../../config";

const GameLobbyPage = () => {
  const { link } = useParams();
  const navigate = useNavigate();
  const { handleDelete } = useLobbyDeletion();
  const [members, setMembers] = useState([
    { id: 1, name: "Host Player", isHost: true, isReady: true },
    { id: 2, name: "Player 2", isReady: false },
    { id: 3, name: "Player 3", isReady: true },
  ]);
  const [lobbyDetails, setLobbyDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // localStorage'dan kullanıcı bilgilerini al
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userId = currentUser?.id;

  useEffect(() => {
    const fetchLobbyDetails = async () => {
      try {
        const response = await axios.get(
          `${config.apiBaseUrl}${config.apiEndpoints.lobbies}/${link}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        if (response.status === 200) {
          const lobby = response.data.lobby;
  
          // Kullanıcının lobiye üye olup olmadığını kontrol et
          const userIsMember = lobby.members?.some((member) => member.id === userId);
  
          // Eğer lobi şifreli ise ve kullanıcı üye değilse, erişim engelle
          if (lobby.password && !userIsMember) {
            setError("Bu lobiye erişim izniniz yok.");
            return;
          }
  
          // Lobi detaylarını state'e kaydet
          setLobbyDetails(lobby);
  
          // members state'ini doldur
          const membersList = lobby.members.map((member) => ({
            id: member.id,
            name: member.name,
            isHost: member.id === lobby.createdBy,
            isReady: false, // Varsayılan olarak hazır olma durumu false
          }));
  
          setMembers(membersList);
        } else {
          setError("Lobi bilgileri alınamadı.");
        }
      } catch (error) {
        setError(
          error.response?.data?.message || "Lobi bilgileri alınırken hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    };
  
    fetchLobbyDetails();
  }, [link, userId]);

  if (loading) {
    return (
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
  }

  if (error) {
    return (
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
          Anasayfaya Dön
        </Button>
      </Box>
    );
  }

  if (!lobbyDetails) {
    return null;
  }

  return (
    <Box
      sx={{ p: 1, minHeight: "calc(100vh - 100px)", display: "flex", gap: 1 }}
    >
      <MembersList members={members} />
      <GameArea
        lobbyInfo={lobbyDetails}
        link={link}
        onDelete={(e) => handleDelete(lobbyDetails.lobbyCode, e)}
        members={members}
      />
    </Box>
  );
};

export default GameLobbyPage;