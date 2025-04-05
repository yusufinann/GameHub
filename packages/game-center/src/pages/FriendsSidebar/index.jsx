import React, { memo } from 'react';
import { Box } from '@mui/material';
import { useFriendsContext } from '../Profile/context';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import { useLobbyContext } from '../MainScreen/MainScreenMiddleArea/context';
import InviteDialog from './components/InviteDialog';
import MessageDialog from './components/MessageDialog';
import Notifications from './components/Notifications/Notifications';
import FriendsList from './components/FriendList/FriendsList';
import { StreetLampPost, LampBase, LampGlowEffect } from './components/LampComponents';
import useFriendsSidebar from './useFriendsSidebar';

const sidebarStyles = {
  height: 'calc(100vh - 20px)',
  position: 'sticky',
  top: '10px',
  borderRadius: '20px',
  mr: '20px',
  background: '#caecd5',
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
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '3px',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.5)',
    },
  },
};

const FriendsSidebar = () => {
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
              background: 'linear-gradient(135deg, #328761 0%, #1e5240 100%)',
              boxShadow: '0 2px 15px rgba(50, 135, 97, 0.8)',
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
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
              mt: 2,
              mb: 2,
            }}
          />
        </Box>
        <FriendsList
          friends={friends}
          onMessage={handleOpenMessageDialog}
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
