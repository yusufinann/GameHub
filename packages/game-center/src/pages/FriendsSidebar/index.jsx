import React, { memo, useEffect, useState } from 'react';
import { Box, Avatar, Typography, Tooltip } from '@mui/material';
import { useFriendsContext } from '../Profile/context';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';

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
    Henüz arkadaş yok.
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
  const { friends,requestFriendList } = useFriendsContext();
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