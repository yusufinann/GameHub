// components/LobbyAvatar.js
import { Avatar } from "@mui/material";
import { getIcon } from "../../../../utils/lobbyItemUtils";

export const LobbyAvatar = ({ lobbyType, backgroundColor }) => {
  return (
    <Avatar
      sx={{
        bgcolor: backgroundColor,
        width: 40,
        height: 40,
        fontSize: 18,
      }}
    >
      {getIcon(lobbyType)}
    </Avatar>
  );
};