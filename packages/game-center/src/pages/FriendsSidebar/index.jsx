import React, { memo, useEffect, useState } from 'react';
import { Box, Avatar, Typography, Tooltip, Paper, SvgIcon } from '@mui/material';
import { useFriendsContext } from '../Profile/context';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import UnifiedNotifications from '../MainScreen/MainScreenHeaderArea/components/UnifiedNotifications';

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

const FriendAvatar = memo(({ friend }) => (
  <Tooltip title={`${friend.name} (${friend.status})`} placement="right">
    <Box
      sx={{
        position: 'relative',
        mb: 2,
        p: '3px',
        borderRadius: '50%',
        background: 'linear-gradient(45deg, #00d2ff 0%, #3a7bd5 100%)',
      }}
    >
      <Avatar
        alt={friend.name}
        src={friend.avatar}
        sx={{
          width: 50,
          height: 50,
          border: '2px solid rgba(255, 255, 255, 0.8)',
          transition: 'all 0.3s ease',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 1,
          right: 1,
          width: 3,
          height: 3,
          borderRadius: '50%',
          backgroundColor: friend.status === 'online' 
            ? 'rgb(46, 213, 115)' 
            : 'rgb(255, 71, 87)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
        }}
      />
    </Box>
  </Tooltip>
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

const FriendsSidebar = () => {
  const { friends, requestFriendList } = useFriendsContext();
  const hasFriends = friends?.length > 0;
  const { socket } = useWebSocket();
  const [localFriends, setLocalFriends] = useState(friends);

  useEffect(() => {
    setLocalFriends(friends);
  }, [friends]);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      requestFriendList();
    }
  }, [socket, requestFriendList]);

  return (
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
          <FriendAvatar key={friend.id} friend={friend} />
        ))
      ) : (
        <EmptyFriendsList />
      )}
    </Box>
  );
};

export default memo(FriendsSidebar);