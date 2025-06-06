import React, { useCallback, useMemo } from "react";
import { Box, Typography, Paper, IconButton, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ContentCopy as CopyIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";
import { handleCopy, handleShare } from "../../../utils/handleShare.js";
import LobbyMembers from "./LobbyMembers.jsx";
import { useLobbyContext } from "../../context/LobbyContext/context.js";
import { useTranslation } from "react-i18next";

export const SuccessScreen = React.memo(({ setSnackbar, onClose }) => {

  const navigate = useNavigate();
  const { 
    lobbyCode, 
    lobbyLink, 
    membersByLobby,
    existingLobby 
  } = useLobbyContext();
  const { t } = useTranslation();


  const members = useMemo(() => {
   
    return (lobbyCode && membersByLobby && membersByLobby[lobbyCode]) ? membersByLobby[lobbyCode] : [];
  }, [membersByLobby, lobbyCode]);

  const actualLobbyLink = useMemo(() => {
    return lobbyLink || (lobbyCode ? `${window.location.origin}/lobby/${lobbyCode}` : "");
  }, [lobbyLink, lobbyCode]);

  const isLinkAvailable = useMemo(() => {
    return Boolean(actualLobbyLink && !actualLobbyLink.includes("undefined") && actualLobbyLink !== "");
  }, [actualLobbyLink]);

  const handleLobbyLinkClick = useCallback(() => {
    if (!isLinkAvailable) {
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: t("lobbyLinkNotFound"),
          severity: "error",
        });
      }
      return;
    }
  
    try {
      const path = new URL(actualLobbyLink).pathname; 
      navigate(path);
    } catch (error) {
      console.error("Invalid lobby link URL:", actualLobbyLink, error);
      if (setSnackbar) {
        setSnackbar({
          open: true,
          message: t("invalidLobbyLink"),
          severity: "error",
        });
      }
    }
  }, [actualLobbyLink, isLinkAvailable, navigate, setSnackbar, t]);

  const handleCopyLobbyCode = useCallback(() => {
    if (lobbyCode) {
      handleCopy(lobbyCode, setSnackbar, t);
    }
  }, [lobbyCode, setSnackbar, t]);

  const handleCopyLobbyLink = useCallback(() => {
    if (isLinkAvailable) {
      handleCopy(actualLobbyLink, setSnackbar, t);
    }
  }, [actualLobbyLink, isLinkAvailable, setSnackbar, t]);

  const handleSocialShare = useCallback((platform) => {
    if (isLinkAvailable) {
      handleShare(platform, actualLobbyLink, t);
    }
  }, [actualLobbyLink, isLinkAvailable, t]);

  const shareButtons = useMemo(() => [
    { platform: "twitter", Icon: TwitterIcon, color: "rgb(29,161,242)", bgColor: "rgba(29,161,242,0.1)", hoverBgColor: "rgba(29,161,242,0.2)" },
    { platform: "facebook", Icon: FacebookIcon, color: "rgb(59,89,152)", bgColor: "rgba(59,89,152,0.1)", hoverBgColor: "rgba(59,89,152,0.2)" },
    { platform: "whatsapp", Icon: WhatsAppIcon, color: "rgb(37,211,102)", bgColor: "rgba(37,211,102,0.1)", hoverBgColor: "rgba(37,211,102,0.2)" },
  ], []); 
  if (!existingLobby) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="error">
          {t("noActiveLobby")}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        textAlign: "center",
        py: { xs: 1, md: 2 },
        px: { xs: 0.5, md: 1 },
        background: "linear-gradient(135deg, rgba(34,193,195,0.1) 0%, rgba(253,187,45,0.1) 100%)",
        borderRadius: 3,
        overflow: "auto",
        maxHeight: "90vh", 
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} mb={2}>
        <CelebrationIcon sx={{ color: "rgba(253,187,45,1)", fontSize: { xs: 32, md: 40 } }} />
        <Typography
          variant="h3"
          component="h1"
          sx={{
            background: "linear-gradient(45deg, rgba(34,193,195,1), rgba(253,187,45,1))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("createdMessage")}
        </Typography>
      </Stack>

      <Paper
        elevation={4}
        sx={{
          p: { xs: 1, md: 2 },
          mb: 1,
          mx: { xs: 1, md: 2 },
          borderRadius: 3,
          background: 'rgb(165, 249, 190, 0.1)',
          border: "1px solid rgba(34,193,195,0.3)",
          backdropFilter: "blur(5px)",
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 1,
            color: "primary.dark",
            fontSize: { xs: "1.25rem", md: "1.5rem" }
          }}
        >
          {t("Lobby Code")}
        </Typography>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1} 
          mb={2.5}
          sx={{ background: 'rgb(165, 249, 190, 0.1)', py: 1.5, px: 1.5, borderRadius: 2, boxShadow: 1, width: '100%', boxSizing: 'border-box' }}
        >
          <Typography
            variant="h6"
            sx={{
              letterSpacing: 3,
              color: "secondary.main",
              userSelect: "all",
              flexGrow: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "center",
              fontSize: { xs: "1.1rem", md: "1.25rem" }
            }}
          >
            {lobbyCode || "---"} 
          </Typography>
          <IconButton
            aria-label={t("copyLobbyCode")}
            onClick={handleCopyLobbyCode}
            disabled={!lobbyCode} 
            color="secondary"
            sx={{ "&:hover": { backgroundColor: "rgba(253,187,45,0.1)" }, flexShrink: 0 }}
          >
            <CopyIcon />
          </IconButton>
        </Stack>

        <Typography
          variant="h5"
          component="h2"
          sx={{
            mb: 1,
            color: "primary.dark",
            fontSize: { xs: "1.25rem", md: "1.5rem" }
          }}
        >
          {t("Lobby Link")}
        </Typography>
        <Stack 
          direction="row" 
          alignItems="center" 
          spacing={1} 
          sx={{  
            background: 'rgb(165, 249, 190, 0.1)', 
            py: 1.5,             
            px: 1.5, 
            borderRadius: 2, 
            boxShadow: 1, 
            width: '100%',     
            boxSizing: 'border-box' 
          }}
        >
          <Typography
            variant="body1" 
            onClick={isLinkAvailable ? handleLobbyLinkClick : undefined}
            sx={{
              letterSpacing: { xs: 1, md: 2},
              color: isLinkAvailable ? "secondary.main" : "text.disabled", 
              userSelect: "all",
              fontWeight:"700",
              flexGrow: 1,       
              minWidth: 0,          
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: 'center',
              cursor: isLinkAvailable ? "pointer" : "default",
              "&:hover": {
                textDecoration: isLinkAvailable ? "underline" : "none",
              },
              fontSize: { xs: "0.8rem", md: "0.9rem" }
            }}
          >
            {isLinkAvailable ? actualLobbyLink : t("linkNotAvailable")}
          </Typography>
          <IconButton
            aria-label={t("copyLobbyLink")}
            onClick={handleCopyLobbyLink}
            disabled={!isLinkAvailable}
            color="secondary"
            sx={{ 
              "&:hover": { backgroundColor: "rgba(253,187,45,0.1)" },
              flexShrink: 0 
            }}
          >
            <CopyIcon />
          </IconButton>
        </Stack>
      </Paper>

      {/* members null/boş dizi kontrolü zaten useMemo içinde yapılıyor, members.length > 0 yeterli */}
      {members.length > 0 && <LobbyMembers members={members} t={t} />}

      <Stack 
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between" 
        alignItems="center" 
        spacing={2}
        mb={1}
        px={{ xs: 1, md: 2 }}
      >
        <Stack 
          direction="row" 
          spacing={1.5}
          sx={{
            "& .MuiIconButton-root": {
              transition: "transform 0.2s, background-color 0.2s",
              "&:hover": {
                transform: "scale(1.15)",
              },
            },
          }}
        >
          {shareButtons.map(({ platform, Icon, color, bgColor, hoverBgColor }) => (
            <IconButton
              key={platform}
              aria-label={t(`shareOn`, { platform })}
              onClick={() => handleSocialShare(platform)}
              disabled={!isLinkAvailable}
              sx={{
                backgroundColor: bgColor,
                color: color,
                "&:hover": { backgroundColor: hoverBgColor },
                "&.Mui-disabled": {
                    backgroundColor: "action.disabledBackground",
                    color: "action.disabled"
                }
              }}
            >
              <Icon />
            </IconButton>
          ))}
        </Stack>

        <Button
          variant="contained"
          onClick={onClose}
          size="large"
          sx={{
            background: "linear-gradient(45deg, rgba(34,193,195,1), rgba(253,187,45,1))",
            "&:hover": {
              background: "linear-gradient(45deg, rgba(34,193,195,0.85), rgba(253,187,45,0.85))",
              boxShadow: 3,
            },
            px: { xs: 3, md: 5 },
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: "1rem", md: "1.1rem" },
            textTransform: "none",
            borderRadius: 2,
            minWidth: { xs: '100%', sm: 'auto' }
          }}
        >
          {t("Close")}
        </Button>
      </Stack>
    </Box>
  );
});

SuccessScreen.displayName = "SuccessScreen";