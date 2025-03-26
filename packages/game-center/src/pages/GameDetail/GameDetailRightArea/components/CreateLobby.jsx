import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { SportsEsports } from "@mui/icons-material";
import { useLocation, useParams } from "react-router-dom";
import ErrorModal from "../../../../shared/ErrorModal";
import CreateLobbyModal from "../../../../shared/CreateLobbyModal";
function CreateLobby({ colorScheme, existingLobby, lobbies }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const location = useLocation();
  const { gameId } = useParams();

  // game-detail rotasında mıyız?
  const isGameDetailRoute = location.pathname.includes("game-detail");
  // Eğer game-detail rotasındaysak, mevcut lobinin bu oyuna ait olup olmadığını kontrol et
  const hasLobbyForCurrentGame =
    isGameDetailRoute && existingLobby?.game === parseInt(gameId, 10);

  const handleOpenModal = () => {
    if (isGameDetailRoute && existingLobby && !hasLobbyForCurrentGame) {
      // Farklı oyuna ait aktif lobby varsa hata modalını göster
      setIsErrorModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const getButtonText = () => {
    if ((!isGameDetailRoute && existingLobby) || (isGameDetailRoute && hasLobbyForCurrentGame)) {
      return "Go to Your Lobby";
    }
    return "Create A Lobby";
  };

  return (
    <>
      <Box
        sx={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          background: colorScheme.gradientBg,
          p: 4,
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: "0px 15px 35px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {/* Arka planda yaratıcı efekt için bulanık daire */}
        <Box
          sx={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "120px",
            height: "120px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "50%",
            filter: "blur(50px)",
          }}
        />

        {/* İçerik alanı */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <SportsEsports sx={{ fontSize: 50, color: "white", mb: 2 }} />
          <Typography
            variant="h4"
            sx={{
              color: "white",
              fontWeight: "bold",
              textAlign: "center",
              mb: 3,
              textShadow: "0px 2px 5px rgba(0,0,0,0.3)",
            }}
          >
            {getButtonText()}
          </Typography>
          <Button
            onClick={handleOpenModal}
            sx={{
              background: "linear-gradient(45deg, #ff6b6b, #ff9a9e)",
              color: "white",
              fontWeight: "bold",
              textTransform: "uppercase",
              px: 4,
              py: 1.5,
              borderRadius: "30px",
              transition: "background 0.3s ease, transform 0.3s ease",
              "&:hover": {
                background: "linear-gradient(45deg, #ff9a9e, #ff6b6b)",
                transform: "scale(1.05)",
              },
            }}
          >
            {getButtonText()}
          </Button>
        </Box>
      </Box>

      {/* Modal bileşenleri */}
      <CreateLobbyModal open={isModalOpen} onClose={handleCloseModal} />
      <ErrorModal
        open={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        errorMessage="You already have an active lobby for another game. Please close your existing lobby before creating a new one."
      />
    </>
  );
}

export default CreateLobby;
