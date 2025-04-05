import { useEffect, useState } from 'react';

const useFriendsSidebar = ({ fetchFriendListHTTP, socket, setFriends }) => {
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  useEffect(() => {
    fetchFriendListHTTP();
  }, [fetchFriendListHTTP]);
  useEffect(() => {
    if (!socket) return;

    const handleUserStatus = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'USER_STATUS') {
          const { userId, isOnline } = message;
          setFriends(prevFriends =>
            prevFriends.map(friend =>
              friend.id.toString() === userId.toString()
                ? { ...friend, isOnline }
                : friend
            )
          );
        } else if (message.type === 'NEW_MESSAGE') {
          const { fromUserId } = message;
          setFriends(prevFriends =>
            prevFriends.map(friend =>
              friend.id.toString() === fromUserId.toString()
                ? { ...friend, hasNewMessages: true }
                : friend
            )
          );
        }
      } catch (error) {
        console.error("useFriendsSidebar: Error parsing message", error);
      }
    };

    socket.addEventListener('message', handleUserStatus);
    return () => {
      socket.removeEventListener('message', handleUserStatus);
    };
  }, [socket, setFriends]);

  const handleOpenMessageDialog = (friend) => {
    setSelectedFriend(friend);
    setMessageDialogOpen(true);
    setFriends(prevFriends =>
      prevFriends.map(f =>
        f.id === friend.id ? { ...f, hasNewMessages: false } : f
      )
    );
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

  return {
    messageDialogOpen,
    inviteDialogOpen,
    selectedFriend,
    handleOpenMessageDialog,
    handleCloseMessageDialog,
    handleOpenInviteDialog,
    handleCloseInviteDialog,
  };
};

export default useFriendsSidebar;
