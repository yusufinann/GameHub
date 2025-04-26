import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuthContext } from '../../shared/context/AuthContext';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import { useSnackbar } from '../../shared/context/SnackbarContext'; 

export const useConversationsPage = (friendGroups, setFriendGroups, selectedConversation, setSelectedConversation) => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const { showSnackbar } = useSnackbar(); 

  // Messages and pagination state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMessagingLoading, setIsMessagingLoading] = useState(false); // while sending message
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Added isLoadingMore state

  // Pagination and "hasMore" flags
  const [privatePage, setPrivatePage] = useState(1);
  const [friendPage, setFriendPage] = useState(1);
  const [hasMorePrivate, setHasMorePrivate] = useState(false);
  const [hasMoreFriend, setHasMoreFriend] = useState(false);

  // Scroll container ref for infinite scroll
  const containerRef = useRef(null);
  const LIMIT = 30;
  const token = localStorage.getItem('token');

  const fetchPrivateChatHistory = useCallback(
    async (targetUserId, page = 1) => {
      if (!targetUserId) return;
      if (page === 1) {
        setIsLoadingChat(true);
      } else {
        setIsLoadingMore(true); // Set loading more state when loading additional pages
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/api/chat/private-chat-history?receiverId=${targetUserId}&page=${page}&limit=${LIMIT}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { history, pagination } = response.data;
        setHasMorePrivate(pagination.hasMore);
        setPrivatePage(pagination.currentPage);
        if (page === 1) {
          setMessages(history);
        } else {
          setMessages(prevMessages => [...history, ...prevMessages]);
        }
      } catch (error) {
        console.error('Özel sohbet geçmişi alınırken hata:', error);
        showSnackbar({ message: 'Özel sohbet geçmişi yüklenirken hata oluştu.', severity: 'error' });
      } finally {
        setIsLoadingChat(false);
        if (page > 1) {
          setIsLoadingMore(false); 
        }
      }
    },
    [showSnackbar, token]
  );

  const fetchFriendGroupChatHistory = useCallback(
    async (groupId, page = 1) => {
      if (!groupId) return;
      if (page === 1) {
        setIsLoadingChat(true);
      } else {
        setIsLoadingMore(true); // Set loading more state when loading additional pages
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/api/chat/friendgroup/${groupId}/history?page=${page}&limit=${LIMIT}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { history, pagination } = response.data;
        setHasMoreFriend(pagination.hasMore);
        setFriendPage(pagination.currentPage);
        if (page === 1) {
          setMessages(history);
        } else {
          setMessages(prevMessages => [...history, ...prevMessages]);
        }
      } catch (error) {
        console.error('Friend Group chat geçmişi alınırken hata:', error);
        showSnackbar({ message: 'Friend Group chat geçmişi yüklenirken hata oluştu.', severity: 'error' });
      } finally {
        setIsLoadingChat(false);
        if (page > 1) {
          setIsLoadingMore(false); // Reset loading more state
        }
      }
    },
    [showSnackbar, token]
  );

  const loadMoreMessages = useCallback(() => {
    if (isLoadingMore) return; // Prevent multiple simultaneous requests
    if (selectedConversation?.type === 'friendGroup' && hasMoreFriend) {
      fetchFriendGroupChatHistory(selectedConversation._id, friendPage + 1);
    } else if (selectedConversation?.type === 'private' && hasMorePrivate) {
      fetchPrivateChatHistory(selectedFriend.id, privatePage + 1);
    }
  }, [
    selectedConversation,
    selectedFriend,
    friendPage,
    privatePage,
    hasMoreFriend,
    hasMorePrivate,
    fetchFriendGroupChatHistory,
    fetchPrivateChatHistory,
    isLoadingMore
  ]);

  useEffect(() => {
    if (selectedFriend && socket && socket.readyState === WebSocket.OPEN && selectedConversation?.type !== 'friendGroup') {
      // Reset pagination state when selecting a new conversation
      setPrivatePage(1);
      fetchPrivateChatHistory(selectedFriend.id);
    }
    if (selectedConversation?.type === 'friendGroup') {
      // Reset pagination state when selecting a new conversation
      setFriendPage(1);
      fetchFriendGroupChatHistory(selectedConversation._id);
    }
  }, [selectedFriend, socket, fetchPrivateChatHistory, selectedConversation, fetchFriendGroupChatHistory]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "RECEIVE_PRIVATE_MESSAGE":
          if (selectedConversation?.type !== 'friendGroup') {
            setMessages((prevMessages) => [...prevMessages, message.message]);
          }
          break;
        case "PRIVATE_CHAT_HISTORY":
          if (selectedConversation?.type !== 'friendGroup') {
            setMessages(message.history);
            setIsLoadingChat(false);
          }
          break;
        case "RECEIVE_FRIEND_GROUP_MESSAGE":
          if (selectedConversation?.type === 'friendGroup') {
            setMessages((prevMessages) => [...prevMessages, message.data]);
          }
          break;
        case "USER_LEFT_FRIEND_GROUP":
          showSnackbar({ message: `User "${message.data.userId}" left Friend Group "${message.groupId}".`, severity: 'info' });
          setFriendGroups(prevGroups => {
            return prevGroups.map(group => {
              if (group._id === message.groupId) {
                return { ...group, members: group.members.filter(member => member._id !== message.data.userId) };
              }
              return group;
            });
          });
          if (selectedConversation?._id === message.groupId) {
            setSelectedConversation(prev => prev ? {...prev, members: prev.members.filter(member => member._id !== message.data.userId)} : null);
          }
          break;
        case "FRIEND_GROUP_DELETED":
          // Find the group name from the friendGroups state
          const deletedGroup = friendGroups.find(group => group._id === message.groupId);
          const deletedGroupName = deletedGroup ? deletedGroup.groupName : message.groupId;
          
          showSnackbar({ 
            message: `Friend Group "${deletedGroupName}" has been deleted by the host.`, 
            severity: 'info' 
          });
          setFriendGroups(prevGroups => prevGroups.filter(group => group._id !== message.groupId));
          
          if (selectedConversation?._id === message.groupId) {
            setSelectedConversation(null);
            setMessages([]);
          }
          break;
        default:
          console.log("Bilinmeyen mesaj tipi:", message.type);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, selectedConversation, showSnackbar, setFriendGroups, setSelectedConversation, friendGroups]); 

  const handleSendFriendMessage = () => {
    if (newMessage.trim()) {
      setIsMessagingLoading(true);
      let messagePayload = {};

      if (selectedConversation?.type === 'friendGroup') {
        messagePayload = {
          type: "FRIEND_GROUP_MESSAGE_WS",
          groupId: selectedConversation._id,
          message: newMessage,
        };
      } else if (selectedFriend) {
        messagePayload = {
          type: "PRIVATE_MESSAGE",
          receiverId: selectedFriend.id,
          message: newMessage,
        };
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(messagePayload));
        setNewMessage("");
      } else {
        console.error("WebSocket bağlantısı açık değil.");
      }
      setIsMessagingLoading(false);
    }
  };

  const handleFriendSelection = useCallback((friend) => { 
    setSelectedFriend(friend);
    setSelectedConversation(null);
    // Reset pagination state when selecting a new friend
    setPrivatePage(1);
    setHasMorePrivate(false);
    if (friend) {
      setSelectedConversation({ type: 'private', friendId: friend.id });
      fetchPrivateChatHistory(friend.id);
    } else {
      setMessages([]);
    }
  }, [fetchPrivateChatHistory, setSelectedConversation]);

  const handleFriendGroupSelection = useCallback((group) => {
    setSelectedFriend(null);
    // Reset pagination state when selecting a new group
    setFriendPage(1);
    setHasMoreFriend(false);
    setSelectedConversation({
      _id: group._id,
      groupName: group.groupName,
      description: group.description,
      members: group.members,
      invitationLink: group.invitationLink,
      type: 'friendGroup'
    });
    fetchFriendGroupChatHistory(group._id);
  }, [fetchFriendGroupChatHistory, setSelectedConversation]);

  const handleDeleteFriendGroup = async (groupId) => {
    const groupToDelete = friendGroups.find(group => group._id === groupId);
    const groupName = groupToDelete ? groupToDelete.groupName : "Unknown group";
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      const deletePayload = {
        type: "DELETE_FRIEND_GROUP_WS",
        groupId: groupId,
      };
      socket.send(JSON.stringify(deletePayload));
      showSnackbar({ 
        message: `Friend Group "${groupName}" has been deleted successfully.`, 
        severity: 'success' 
      });
    } else {
      console.error("WebSocket bağlantısı açık değil, Friend Group silinemiyor.");
      showSnackbar({ message: 'WebSocket bağlantısı kurulamadı. Friend Group silinemiyor.', severity: 'error' }); 
    }
  };

  const handleLeaveFriendGroup = async (groupId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const leavePayload = {
        type: "LEAVE_FRIEND_GROUP_WS",
        groupId: groupId,
      };
      socket.send(JSON.stringify(leavePayload));
      setSelectedConversation(null);
      setMessages([]);
      setFriendGroups(prevGroups => prevGroups.filter(group => group._id !== groupId));
      showSnackbar({ message: 'Friend Group left successfully.', severity: 'success' }); 
    } else {
      console.error("WebSocket bağlantısı açık değil, Friend Group dan ayrılamıyor.");
      showSnackbar({ message: 'WebSocket bağlantısı kurulamadı. Friend Group dan ayrılamıyor.', severity: 'error' }); 
    }
  };

  return {
    selectedConversation,
    messages,
    newMessage,
    setNewMessage,
    isMessagingLoading,
    selectedFriend,
    setSelectedFriend,
    isLoadingChat,
    handleSendFriendMessage,
    handleFriendSelection,
    handleFriendGroupSelection,
    handleDeleteFriendGroup,
    currentUser,
    handleLeaveFriendGroup,
    hasMorePrivate,
    hasMoreFriend,
    containerRef,
    loadMoreMessages,
    privatePage,
    friendPage,
    isLoadingMore,
  };
};