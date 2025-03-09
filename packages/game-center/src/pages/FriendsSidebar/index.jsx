// FriendsSidebar.js
import React, { memo, useEffect, useState } from 'react';
import { Box,Typography} from '@mui/material';
import { useFriendsContext } from '../Profile/context';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import UnifiedNotifications from '../MainScreen/MainScreenHeaderArea/components/UnifiedNotifications';
import FriendAvatar from './components/FriendAvatar';
import { useLobbyContext } from '../MainScreen/MainScreenMiddleArea/context';
import InviteDialog from './components/InviteDialog';
import MessageDialog from './components/MessageDialog';

// Create a street lamp post component
const StreetLampPost = memo(() => (
  <Box
    sx={{
      height: '60px',
      width: '6px',
      bgcolor: 'rgba(255, 255, 255, 0.7)',
      borderRadius: '3px',
      boxShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
      mb: 0,
      mt: '5px'
    }}
  />
));

// Custom lamp base component
const LampBase = memo(() => (
  <Box
    sx={{
      height: '12px',
      width: '24px',
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '0 0 12px 12px',
      boxShadow: '0 2px 8px rgba(255, 255, 255, 0.6)',
    }}
  />
));

// Lamp glow effect component
const LampGlowEffect = memo(() => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
      opacity: 0.7,
      filter: 'blur(5px)',
      animation: 'pulse 2s infinite alternate',
      '@keyframes pulse': {
        '0%': { opacity: 0.5, transform: 'translateX(-50%) scale(0.9)' },
        '100%': { opacity: 0.8, transform: 'translateX(-50%) scale(1.1)' }
      }
    }}
  />
));

const EmptyFriendsList = memo(() => (
  <Typography
    variant="caption"
    sx={{
      mt: 2,
      textAlign: 'center',
      color: 'rgba(255, 255, 255, 0.9)',
      p: '10px',
      bgcolor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 2,
      backdropFilter: 'blur(4px)',
    }}
  >
    There are no Friends
  </Typography>
));

const sidebarStyles = {
  height: 'calc(100vh - 20px)',
  position: 'sticky',
  top: '10px',
  borderRadius: '20px',
  mr: '20px',
  background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
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
  const { friends, requestFriendList} = useFriendsContext();
  const{existingLobby,userLobby }=useLobbyContext();
  const hasFriends = friends?.length > 0;
  const { socket } = useWebSocket();
  const [localFriends, setLocalFriends] = useState(friends);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    setLocalFriends(friends);
  }, [friends]);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      requestFriendList();
    }
  }, [socket, requestFriendList]);

  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'USER_STATUS') {
          const userId = message.userId;
          const isOnline = message.isOnline;

          setLocalFriends(prevFriends => {
            return prevFriends.map(friend => {
              if (friend.id.toString() === userId.toString()) {
                return { ...friend, isOnline: isOnline };
              }
              return friend;
            });
          });
        } else if (message.type === 'NEW_MESSAGE') {
          // Handle new message notifications
          const { fromUserId } = message;
          
          setLocalFriends(prevFriends => {
            return prevFriends.map(friend => {
              if (friend.id.toString() === fromUserId.toString()) {
                return { ...friend, hasNewMessages: true };
              }
              return friend;
            });
          });
        }
      } catch (error) {
        console.error("FriendsSidebar: Error parsing user status message", error);
      }
    };

    socket.addEventListener('message', handleUserStatus);
    return () => {
      socket.removeEventListener('message', handleUserStatus);
    };
  }, [socket]);

  const handleOpenMessageDialog = (friend) => {
    setSelectedFriend(friend);
    setMessageDialogOpen(true);
    
    // Clear new message indicator when opening messages
    setLocalFriends(prevFriends => {
      return prevFriends.map(f => {
        if (f.id === friend.id) {
          return { ...f, hasNewMessages: false };
        }
        return f;
      });
    });
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
  };

  const handleOpenInviteDialog = (friend) => {
    setSelectedFriend(friend);
    setInviteDialogOpen(true);
  };

  const handleCloseInviteDialog = () => {
    setInviteDialogOpen(false);
  };

  return (
    <>
      <Box sx={sidebarStyles}>
        {/* Street lamp notification area at the top */}
        <Box sx={{
          mb: 4,
          mt: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}>
          {/* Glow effect */}
          <LampGlowEffect />

          {/* Lamp housing for notifications */}
          <Box sx={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '45px',
            height: '45px',
            borderRadius: '50% 50% 5px 5px',
            background: 'linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%)',
            boxShadow: '0 2px 15px rgba(58, 123, 213, 0.8)',
            '&:hover': {
              filter: 'brightness(1.2)',
              transform: 'scale(1.05)',
            },
            transition: 'all 0.3s ease',
            zIndex: 2,
          }}>
            <UnifiedNotifications />
          </Box>

          {/* Lamp base */}
          <LampBase />

          {/* Lamp post */}
          <StreetLampPost />

          {/* Decorative line separator */}
          <Box
            sx={{
              width: '50px',
              height: '2px',
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 50%, rgba(255,255,255,0) 100%)',
              mt: 2,
              mb: 2
            }}
          />
        </Box>

        {/* Friends list */}
        {hasFriends ? (
          localFriends.map((friend) => (
            <FriendAvatar 
              key={friend.id} 
              friend={friend} 
              onMessage={handleOpenMessageDialog}
              onInvite={handleOpenInviteDialog}
              existingLobby={existingLobby}
            />
          ))
        ) : (
          <EmptyFriendsList />
        )}
      </Box>

      {/* Message dialog */}
      <MessageDialog 
        open={messageDialogOpen} 
        handleClose={handleCloseMessageDialog} 
        friend={selectedFriend} 
      />
      {/* Invite dialog */}
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