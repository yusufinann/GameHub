// components/LobbyAvatar.js
import { Avatar, Box } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
 
  export const getIcon = (lobbyType) => {
    switch (lobbyType) {
      case "normal":
        return <GroupIcon />;
      case "event":
        return <EventIcon />;
      default:
        return <LockIcon />;
    }
  };
export const LobbyAvatar = ({ lobbyType, backgroundColor }) => {
  return (
    <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}>
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
    </Box>
  );
};