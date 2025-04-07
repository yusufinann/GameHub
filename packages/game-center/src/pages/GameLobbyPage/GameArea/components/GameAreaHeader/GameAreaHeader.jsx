import React from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
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
  

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(90deg, #328761, #4CAF50)",
        color: "white",
        boxShadow: "0 6px 24px rgba(50, 135, 97, 0.4)",
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
              color: "white",
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            <GameIcon fontSize="large" />
            {lobbyInfo.lobbyName}
            <Typography
              variant="h5"
              sx={{
                color: "#b2ebf2",
                display: "flex",
                alignItems: "center",
                gap: 2,
                fontWeight: "bold",
                textShadow: "1px 1px 2px rgba(0,0,0,0.3)",
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
                boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                transition: "all 0.3s ease",
                fontWeight: "bold",
                px: 3.5,
                py: 1.5,
                backgroundColor: "#f44336",
                "&:hover": {
                  backgroundColor: "#d32f2f",
                },
              }}
            >
              {isDeletingLobby ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : 'Delete Lobby'}
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
              boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
              "&:hover": {
                boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                transform: "translateY(-2px)",
                backgroundColor: "rgba(255,255,255,0.15)",
              },
              transition: "all 0.3s ease",
              fontWeight: "bold",
              border: "2px solid white",
              px: 3.5,
              py: 1.5,
              fontSize: '1rem',
            }}
            onClick={onLeave}
          >
            {isLeavingLobby ? <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} /> : 'Leave Lobby'}
          </Button>
        </Box>
      </Box>
      
      {lobbyInfo.lobbyType === "event" && (
        <Box 
          sx={{ 
            px: 1.5, 
            pb: 1, 
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
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