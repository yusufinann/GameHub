// components/LobbyInfo.js
import { Box, Typography } from "@mui/material";

export const LobbyInfo = ({ lobbyName, timeInfo }) => {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="body1">{lobbyName || "Unnamed Lobby"}</Typography>
      {timeInfo && (
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
  );
};