import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import {
  ExitToApp as ExitIcon,
  SportsEsports as GameIcon,
  Stars as StarsIcon,
} from "@mui/icons-material";
import LobbyTimer from "./LobbyTimer";

const GameAreaHeader = ({ 
  lobbyInfo, 
  isHost, 
  onDelete, 
  onLeave, 
  isDeletingLobby, 
  isLeavingLobby,
}) => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(90deg, ${theme.palette.primary.darker}, ${theme.palette.success.main})`,
        color: theme.palette.text.contrast,
        boxShadow: `0 6px 24px ${theme.palette.primary.main}66`,
        borderRadius: "16px 16px 0 0",
      }}
    >
      <Box
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              color: theme.palette.text.contrast,
              textShadow: `2px 2px 4px ${theme.palette.background.elevation[2]}`,
            }}
          >
            <GameIcon fontSize="large" />
            {lobbyInfo.lobbyName}
            <Typography
              variant="h5"
              sx={{
                color: theme.palette.info.light,
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontWeight: "bold",
                textShadow: `1px 1px 2px ${theme.palette.background.elevation[1]}`,
              }}
            >
              <StarsIcon fontSize="large" />
              {lobbyInfo.game === "1" ? "Bingo Oyunu" : "Diğer Oyun"}
            </Typography>
          </Typography>
          
        </Box>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          {isHost && (
            <Button
              variant="contained"
              color="error"
              onClick={onDelete}
              startIcon={<ExitIcon />}
              disabled={isDeletingLobby}
              sx={{
                borderRadius: "16px",
                textTransform: "none",
                boxShadow: `0 6px 16px ${theme.palette.background.elevation[3]}`,
                transition: "all 0.3s ease",
                fontWeight: "bold",
                px: 3.5,
                py: 1.5,
                "&:hover": {
                  backgroundColor: theme.palette.error.dark,
                },
              }}
            >
              {isDeletingLobby ? <CircularProgress size={24} sx={{ color: theme.palette.text.contrast, mr: 1 }} /> : 'Delete Lobby'}
            </Button>
          )}
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ExitIcon />}
            disabled={isLeavingLobby}
            sx={{
              borderRadius: "16px",
              textTransform: "none",
              boxShadow: `0 6px 16px ${theme.palette.background.elevation[1]}`,
              "&:hover": {
                boxShadow: `0 8px 20px ${theme.palette.background.elevation[2]}`,
                transform: "translateY(-2px)",
                backgroundColor: "rgba(255,255,255,0.15)",
              },
              transition: "all 0.3s ease",
              fontWeight: "bold",
              border: `2px solid ${theme.palette.text.contrast}`,
              px: 3.5,
              py: 1.5,
              fontSize: '1rem',
            }}
            onClick={onLeave}
          >
            {isLeavingLobby ? <CircularProgress size={24} sx={{ color: theme.palette.text.contrast, mr: 1 }} /> : 'Leave Lobby'}
          </Button>
        </Box>
      </Box>
      
      {lobbyInfo.lobbyType === "event" && (
        <Box 
          sx={{ 
            px: 1.5, 
            pb: 1, 
            borderTop: `1px solid ${theme.palette.primary.light}40`,
            mt: 0.5
          }}
        >
          <LobbyTimer lobbyInfo={lobbyInfo} />
        </Box>
      )}
    </Box>
  );
};

export default GameAreaHeader;