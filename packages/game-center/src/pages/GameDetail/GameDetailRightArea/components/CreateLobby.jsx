import React, { useState } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { Add, ArrowForward } from "@mui/icons-material";
import { useLocation, useParams, useNavigate } from "react-router-dom"; 
import MessageModal from "../../../../shared/components/MessageModal";
import CreateLobbyModal from "../../../../shared/components/CreateLobbyModal";
import DummyImage from "../../../../assets/bingoPulse-bg.png";
import FingerPushingButton from "./FingerPushingButton";
import { useTranslation } from "react-i18next";
import dummyHangman from "../../../../assets/hangman-rmBg.png";

function CreateLobby({ existingLobby }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    severity: "error",
    title: undefined,
  });

  const location = useLocation();
  const { gameId } = useParams();
  const navigate = useNavigate(); 
  const theme = useTheme();
  const { t } = useTranslation();

  const isGameDetailRoute = location.pathname.includes("game-detail");
  const hasLobbyForCurrentGame =
    isGameDetailRoute && existingLobby?.game === parseInt(gameId, 10);

  const dummyImage =
    gameId === '1'
      ? DummyImage
      : gameId === '2'
      ? dummyHangman
      : '';

  const showMessage = (message, severity = "error", title = undefined, onModalClose) => {
    setModalConfig({ message, severity, title, onModalClose });
    setIsMessageModalOpen(true);
  };

  const handleOpenModal = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 200);

    if (isGoToLobbyAction) {
      if (existingLobby?.lobbyCode) {
        navigate(`/lobby/${existingLobby.lobbyCode}`);
      } else {
        showMessage(
          t("errors.lobbyNotFound"),
          "error",
          t("Error")
        );
      }
    } else if (isGameDetailRoute && existingLobby && !hasLobbyForCurrentGame) {
   
      showMessage(
        t("activeLobbyOtherGame"),
        "warning", 
        t("Warning")
      );
    } else {
      // "Create A Lobby" durumu
      setIsCreateModalOpen(true);
    }
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseMessageModal = () => {
    if (modalConfig.onModalClose) {
      modalConfig.onModalClose();
    }
    setIsMessageModalOpen(false);
  };

  const isGoToLobbyAction =
    existingLobby &&
    ((!isGameDetailRoute) || (isGameDetailRoute && hasLobbyForCurrentGame));

  const buttonText = isGoToLobbyAction
    ? t( "Go to your Lobby")
    : t("Create A Lobby");
  const ButtonIcon = isGoToLobbyAction ? ArrowForward : Add;

  return (
    <>
      <Box
        sx={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, #d5f2e3 0%, ${theme.palette.primary.light} 100%)`
              : `linear-gradient(135deg, #1a202c 0%, ${theme.palette.primary.dark} 100%)`,
          p: 4,
          boxShadow: `0px 10px 30px ${
            theme.palette.mode === "light"
              ? "rgba(43, 138, 106, 0.08)"
              : "rgba(0, 0, 0, 0.3)"
          }`,
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: `0px 15px 35px ${
              theme.palette.mode === "light"
                ? "rgba(43, 138, 106, 0.15)"
                : "rgba(0, 0, 0, 0.4)"
            }`,
          },
        }}
      >
        <Box
          component="img"
          src={dummyImage}
          alt="Game Background Art"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: 0,
            width: "180px",
            height: "180px",
            objectFit: "contain",
            opacity: 0.7, 
          }}
        />

        <Box
          sx={{
            position: "absolute",
            top: "-40px",
            right: "-40px",
            width: "120px",
            height: "120px",
            background:
              theme.palette.mode === "light"
                ? "rgba(43, 138, 106, 0.1)" 
                : "rgba(255, 255, 255, 0.05)", 
            borderRadius: "50%",
            filter: "blur(50px)", 
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <FingerPushingButton
            isHovering={isHovering || isPressed}
            onClick={handleOpenModal}
          />

          <Button
            onClick={handleOpenModal}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            variant="contained"
            startIcon={<ButtonIcon sx={{ fontSize: "24px !important" }} />}
            sx={{
              background:
                theme.palette.mode === "light"
                  ? `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
                  : `linear-gradient(45deg, ${theme.palette.secondary.main}, ${theme.palette.info.light})`,
              color: theme.palette.common.white,
              fontWeight: "bold",
              textTransform: "uppercase",
              fontSize: "0.9rem",
              px: 4,
              py: 1.5,
              borderRadius: "30px",
              transition: "all 0.3s ease",
              boxShadow:
                theme.palette.mode === "light"
                  ? "0px 4px 15px rgba(43, 138, 106, 0.3)"
                  : "0px 4px 15px rgba(0, 0, 0, 0.4)",
              "&:hover": {
                background:
                  theme.palette.mode === "light"
                    ? `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`
                    : `linear-gradient(45deg, ${theme.palette.info.light}, ${theme.palette.secondary.main})`,
                boxShadow:
                  theme.palette.mode === "light"
                    ? "0px 6px 20px rgba(43, 138, 106, 0.5)"
                    : "0px 6px 20px rgba(80, 120, 230, 0.5)",
              },
              "&:active": {
                transform: "translateY(0px) scale(1)", // scale(1) daha iyi
                boxShadow:
                  theme.palette.mode === "light"
                    ? "0px 2px 8px rgba(43, 138, 106, 0.4)"
                    : "0px 2px 8px rgba(0, 0, 0, 0.5)",
              },
              transform: isPressed ? "scale(0.95)" : "scale(1)",
              ".MuiButton-startIcon": {
                marginRight: "10px",
              },
            }}
          >
            {buttonText}
          </Button>
        </Box>
      </Box>

      <CreateLobbyModal
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
      <MessageModal
        open={isMessageModalOpen}
        onClose={handleCloseMessageModal}
        message={modalConfig.message}
        severity={modalConfig.severity}
        title={modalConfig.title}
      />
    </>
  );
}

export default CreateLobby;