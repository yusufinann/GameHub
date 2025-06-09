import React, { useState } from 'react';
import { Paper, List, Avatar, Tooltip, Stack, useTheme, Box } from '@mui/material';
import { Person as PersonIcon, Star as CrownIcon } from '@mui/icons-material';
import Header from './Header'; 
import MemberItem from './MemberItem';
import { useAuthContext } from '../../../shared/context/AuthContext';
import { useWebSocket } from "../../../shared/context/WebSocketContext/context";

function MembersList({ members, t, lobbyCode, currentLobbyCreatorId }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { socket } = useWebSocket();
  const theme = useTheme();
  const { currentUser } = useAuthContext();
  const handleToggle = () => setIsCollapsed(!isCollapsed);

  const handleKickPlayer = (playerIdToKick) => {
    if (socket && lobbyCode && currentUser && currentLobbyCreatorId === currentUser.id) {
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

  return (
    <Paper
      elevation={8}
      sx={{
        width: isCollapsed ? '60px' : '250px',
        height: '100%',
        background: theme.palette.background.default,
        backdropFilter: 'blur(10px)',
        borderTopLeftRadius: '24px',
        borderBottomLeftRadius: '24px',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Header
        count={members.length}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
        t={t}
        sx={{
          p: 1, 
          flexShrink: 0,
        }}
      />
      {isCollapsed ? (
        <Stack
          spacing={1}
          alignItems="center"
          sx={{
            p: 1, 
            flexGrow: 1, 
            overflowY: 'auto', 
          }}
        >
          {members.map((member) => (
            <Tooltip
              title={`${member.name}${member.isHost ? ` (${t("Host")})` : ''}`}
              key={member.id}
            >
              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Avatar
                  src={member.avatar || undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: '1.1rem',
                    bgcolor: member.isHost
                      ? theme.palette.secondary.gold || '#FFD700'
                      : theme.palette.background.card,
                    color: member.isHost
                      ? '#000'
                      : theme.palette.text.primary,
                    cursor: 'pointer',
                    border: member.isHost
                      ? `3px solid ${theme.palette.secondary.gold || '#FFD700'}`
                      : `2px solid ${theme.palette.divider}`,
                    boxShadow: member.isHost
                      ? `0 0 12px ${theme.palette.secondary.gold || '#FFD700'}66, 0 0 24px ${theme.palette.secondary.gold || '#FFD700'}33`
                      : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: member.isHost
                        ? `0 0 16px ${theme.palette.secondary.gold || '#FFD700'}88, 0 0 32px ${theme.palette.secondary.gold || '#FFD700'}44`
                        : `0 0 8px ${theme.palette.primary.main}44`,
                    },
                  }}
                >
                  {!member.avatar && <PersonIcon fontSize="medium" />}
                </Avatar>

                {member.isHost && (
                  <CrownIcon
                    sx={{
                      position: 'absolute',
                      top: -6, 
                      right: -6, 
                      fontSize: '18px', 
                      color: theme.palette.secondary.gold || '#FFD700',
                      filter: `drop-shadow(0 0 4px ${theme.palette.secondary.gold || '#FFD700'}66)`,
                   }}
                  />
                )}
              </Box>
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <List
          sx={{
            p: 1,
            flexGrow: 1,
            overflowY: 'auto',
          }}
        >
          {members.map((member, index) => (
            <MemberItem
              key={member.id}
              member={member}
              index={index}
              t={t}
              currentUserId={currentUser.id}
              isCurrentUserHost={isCurrentUserTheHost}
              onKickPlayer={handleKickPlayer}
            />
          ))}
        </List>
      )}
    </Paper>
  );
}

export default MembersList;