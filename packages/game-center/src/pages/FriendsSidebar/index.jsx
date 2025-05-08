import React, { memo } from 'react';
import { Box, useTheme } from '@mui/material';
import { useFriendsContext } from '../../shared/context/FriendsContext/context';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import InviteDialog from './components/InviteDialog';
import MessageDialog from './components/MessageDialog';
import Notifications from './components/Notifications/Notifications';
import FriendsList from './components/FriendList/FriendsList';
import { StreetLampPost, LampBase, LampGlowEffect } from './components/LampComponents';
import useFriendsSidebar from './useFriendsSidebar';
import { useLobbyContext } from '../../shared/context/LobbyContext/context';

const FriendsSidebar = () => {
  const theme = useTheme();
  const { friends, fetchFriendListHTTP, setFriends } = useFriendsContext();
  const { existingLobby } = useLobbyContext();
  const { socket } = useWebSocket();

  const {
    messageDialogOpen,
    inviteDialogOpen,
    selectedFriend,
    handleOpenMessageDialog,
    handleCloseMessageDialog,
    handleOpenInviteDialog,
    handleCloseInviteDialog,
  } = useFriendsSidebar({ fetchFriendListHTTP, socket, setFriends });

  // Using theme values directly instead of hardcoded colors
  const sidebarStyles = {
    height: 'calc(100vh - 20px)',
    position: 'sticky',
    top: '10px',
    borderRadius: '20px',
    mr: '20px',
    bgcolor: theme.palette.background.default,
    backdropFilter: 'blur(4px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    overflowY: 'auto',
    width: '70px',
    p: '15px 0',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: theme.palette.background.elevation[1],
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.background.elevation[2],
      borderRadius: '3px',
      '&:hover': {
        background: theme.palette.background.elevation[3],
      },
    },
  };

  return (
    <>
      <Box sx={sidebarStyles}>
        <Box
          sx={{
            mb: 4,
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <LampGlowEffect />
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '45px',
              height: '45px',
              borderRadius: '50% 50% 5px 5px',
              background: `linear-gradient(135deg, ${theme.palette.primary.medium || theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 2px 15px ${theme.palette.primary.main}80`,
              '&:hover': {
                filter: 'brightness(1.2)',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.3s ease',
              zIndex: 2,
            }}
          >
            <Notifications />
          </Box>
          <LampBase />
          <StreetLampPost />
          <Box
            sx={{
              width: '50px',
              height: '2px',
              background: `linear-gradient(90deg, ${theme.palette.background.offwhite}00 0%, ${theme.palette.background.offwhite} 50%, ${theme.palette.background.offwhite}00 100%)`,
              mt: 2,
              mb: 2,
            }}
          />
        </Box>
        <FriendsList
          friends={friends}
          onInvite={handleOpenInviteDialog}
          existingLobby={existingLobby}
        />
      </Box>
      <MessageDialog
        open={messageDialogOpen}
        handleClose={handleCloseMessageDialog}
        friend={selectedFriend}
      />
      <InviteDialog
        open={inviteDialogOpen}
        handleClose={handleCloseInviteDialog}
        friend={selectedFriend}
        existingLobby={existingLobby}
      />
    </>
  );
};

export default memo(FriendsSidebar);