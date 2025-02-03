import React from "react";
import { Box, Typography, Paper, IconButton, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  ContentCopy as CopyIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  WhatsApp as WhatsAppIcon,
  Celebration as CelebrationIcon,
} from "@mui/icons-material";
import { handleCopy, handleShare } from "../../../../../../../utils/handleShare.js";
import LobbyMembers from "./LobbyMembers.jsx";
import { useLobbyContext } from "../../../../context.js";

export const SuccessScreen = ({ setSnackbar, onClose }) => {
  const navigate = useNavigate();
  const { 
    lobbyCode, 
    lobbyLink, 
    membersByLobby,
    existingLobby
  } = useLobbyContext();

  const members = membersByLobby[lobbyCode] || [];

  const handleLinkClick = () => {
    const generatedLink = lobbyLink || `${window.location.origin}/lobby/${lobbyCode}`;
    
    if (!generatedLink) {
      setSnackbar({
        open: true,
        message: "Lobby link not found.",
        severity: "error",
      });
      return;
    }
  
    const path = new URL(generatedLink).pathname;
    navigate(path);
  };

  if (!existingLobby) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="h6" color="error">
          No active lobby found.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 4,
        background: "linear-gradient(135deg, rgba(34,193,195,0.1) 0%, rgba(253,187,45,0.1) 100%)",
        borderRadius: 3,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          mb: 1,
        }}
      >
        <CelebrationIcon sx={{ color: "rgba(253,187,45,1)", fontSize: 40 }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, rgba(34,193,195,1), rgba(253,187,45,1))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Lobby Created Successfully
        </Typography>
      </Box>

      <Paper
        elevation={4}
        sx={{
          p: 4,
          mb: 1,
          mx: 2,
          borderRadius: 3,
          background: "rgb(165, 249, 190, 0.1)",
          border: "1px solid rgba(34,193,195,0.3)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: "rgba(34,193,195,1)",
            fontWeight: 600,
          }}
        >
          Lobby Code
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            mb: 1,
            background: "white",
            py: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              letterSpacing: 4,
              fontWeight: 700,
              color: "rgba(34,193,195,1)",
            }}
          >
            {lobbyCode}
          </Typography>
          <IconButton
            onClick={() => handleCopy(lobbyCode, setSnackbar)}
            sx={{
              color: "rgba(253,187,45,1)",
              "&:hover": {
                backgroundColor: "rgba(253,187,45,0.1)",
              },
            }}
          >
            <CopyIcon />
          </IconButton>
        </Box>

        <Typography
          variant="h6"
          sx={{
            mb: 1,
            color: "rgba(34,193,195,1)",
            fontWeight: 600,
          }}
        >
          Lobby Link
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            background: "white",
            py: 2,
            borderRadius: 2,
          }}
        >
          <Typography
            variant="body1"
            sx={{
              color: "rgba(34,193,195,1)",
              cursor: "pointer",
              fontWeight: 700,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
            onClick={handleLinkClick}
          >
            {lobbyLink || "Link not found"}
          </Typography>
          <IconButton
            onClick={() => handleCopy(lobbyLink, setSnackbar)}
            sx={{
              color: "rgba(253,187,45,1)",
              "&:hover": {
                backgroundColor: "rgba(253,187,45,0.1)",
              },
            }}
          >
            <CopyIcon />
          </IconButton>
        </Box>
      </Paper>

      <LobbyMembers members={members} />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between", 
          alignItems: "center", 
          gap: 2,
          mb: 1,
          px: 2, 
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            "& .MuiIconButton-root": {
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.1)",
              },
            },
          }}
        >
          <IconButton
            onClick={() => handleShare("twitter", lobbyLink)}
            sx={{
              backgroundColor: "rgba(34,193,195,0.1)",
              color: "rgba(34,193,195,1)",
              "&:hover": {
                backgroundColor: "rgba(34,193,195,0.2)",
              },
            }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            onClick={() => handleShare("facebook", lobbyLink)}
            sx={{
              backgroundColor: "rgba(34,193,195,0.1)",
              color: "rgba(34,193,195,1)",
              "&:hover": {
                backgroundColor: "rgba(34,193,195,0.2)",
              },
            }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            onClick={() => handleShare("whatsapp", lobbyLink)}
            sx={{
              backgroundColor: "rgb(165, 249, 190, 0.2)",
              color: "rgb(165, 249, 190)",
              "&:hover": {
                backgroundColor: "rgb(165, 249, 190, 0.3)",
              },
            }}
          >
            <WhatsAppIcon />
          </IconButton>
        </Box>

        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            background: "linear-gradient(45deg, rgba(34,193,195,1), rgba(253,187,45,1))",
            "&:hover": {
              background: "linear-gradient(45deg, rgba(34,193,195,0.9), rgba(253,187,45,0.9))",
            },
            px: 4,
            py: 1.5,
            fontSize: "1.1rem",
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Close
        </Button>
      </Box>
    </Box>
  );
};