import React, { memo } from 'react';
import { Typography } from '@mui/material';
import FriendAvatar from './FriendAvatar';

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

const FriendsList = ({ friends, onMessage, onInvite, existingLobby }) => {
  const hasFriends = friends?.length > 0;

  return (
    <>
      {hasFriends ? (
        friends.map((friend) => (
          <FriendAvatar
            key={friend.id}
            friend={friend}
            onMessage={onMessage}
            onInvite={onInvite}
            existingLobby={existingLobby}
          />
        ))
      ) : (
        <EmptyFriendsList />
      )}
    </>
  );
};

export default memo(FriendsList);
