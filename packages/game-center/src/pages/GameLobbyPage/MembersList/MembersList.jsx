import React, { useState } from 'react';
import { Paper, List, Avatar, Tooltip, Stack, useTheme } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import Header from './Header';
import MemberItem from './MemberItem';
import { useAuthContext } from '../../../shared/context/AuthContext';
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";
function MembersList({  members, t, lobbyCode, currentLobbyCreatorId}) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const{socket}=useWebSocket();
  const theme = useTheme();
 const {currentUser}=useAuthContext();
  const handleToggle = () => setIsCollapsed(!isCollapsed);
const handleKickPlayer = (playerIdToKick) => {
    if (socket && lobbyCode && currentUser && currentLobbyCreatorId === currentUser.id) {
      console.log(`Kicking player ${playerIdToKick} from lobby ${lobbyCode}`);
      socket.send(JSON.stringify({
        type: 'KICK_PLAYER',
        lobbyCode: lobbyCode,
        playerIdToKick: playerIdToKick,
      }));
    } else {
      console.error("Cannot kick player: missing socket, lobbyCode, or not host.");
    }
  };
  const isCurrentUserTheHost = currentUser && currentLobbyCreatorId === currentUser.id;
  console.log("isCurrentUserTheHost",isCurrentUserTheHost)
  return (
    <Paper
      elevation={8}
      sx={{
        p: 1,
        width: isCollapsed ? '60px' : '250px',
        height: '100vh',
        background: `${theme.palette.background.default}`, 
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        gap: 1,
      }}
    >
      <Header
        count={members.length}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        t={t}
      />
      {isCollapsed ? (
        <Stack spacing={1} alignItems="center" sx={{ mt: 2 }}>
          {members.map((member) => (
            <Tooltip title={member.name} key={member.id}>
              <Avatar
                src={member.avatar || undefined}
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.1rem',
                  bgcolor: member.isHost 
                    ? theme.palette.primary.main 
                    : theme.palette.background.card,
                  color: member.isHost 
                    ? theme.palette.text.contrastText 
                    : theme.palette.text.primary,
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                {!member.avatar && <PersonIcon fontSize="medium" />}
              </Avatar>
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <List sx={{ p: 0 }}>
          {members.map((member, index) => (
            <MemberItem key={member.id} member={member} index={index} t={t} currentUserId={currentUser.id} isCurrentUserHost={isCurrentUserTheHost} onKickPlayer={handleKickPlayer}/>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default MembersList;