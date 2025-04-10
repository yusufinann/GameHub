import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthContext } from '../../shared/context/AuthContext';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import { useSnackbar } from '../../shared/context/SnackbarContext'; 

export const useConversationsPage = (friendGroups,setFriendGroups,selectedConversation, setSelectedConversation) => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
 const { showSnackbar } = useSnackbar(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isMessagingLoading, setIsMessagingLoading] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isLoadingPrivateChat, setIsLoadingPrivateChat] = useState(false);

  const fetchPrivateChatHistory = useCallback(async (targetUserId) => {
    if (targetUserId) {
      setIsLoadingPrivateChat(true);
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get(
          `http://localhost:3001/api/private-chat/private-chat-history?receiverId=${targetUserId}`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setMessages(response.data.history); 
      } catch (error) {
        console.error("Özel sohbet geçmişi alınırken hata:", error);
        showSnackbar({ message: 'Özel sohbet geçmişi yüklenirken hata oluştu.', severity: 'error' });
        setMessages([]); 
      } finally {
        setIsLoadingPrivateChat(false);
      }
    } else {
      setIsLoadingPrivateChat(false); 
      setMessages([]); 
    }
  }, [showSnackbar]); 

  const fetchFriendGroupChatHistory = useCallback(async (groupId) => {
    if (groupId) {
      setIsLoadingPrivateChat(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:3001/api/friend/friendgroup/chat/${groupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(response.data.history);
      } catch (error) {
        console.error("Friend Group chat history yüklenirken hata:", error);
        showSnackbar({ message: 'Friend Group chat geçmişi yüklenirken hata oluştu.', severity: 'error' }); 
      } finally {
        setIsLoadingPrivateChat(false);
      }
    }
  }, [showSnackbar]);

  useEffect(() => {
    if (selectedFriend && socket && socket.readyState === WebSocket.OPEN && selectedConversation?.type !== 'friendGroup') {
      fetchPrivateChatHistory(selectedFriend.id);
    }
    if (selectedConversation?.type === 'friendGroup') {
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
            setIsLoadingPrivateChat(false);
          }
          break;
        case "RECEIVE_FRIEND_GROUP_MESSAGE":
          if (selectedConversation?.type === 'friendGroup') {
            setMessages((prevMessages) => [...prevMessages, message.data]);
          }
          break;
          case "USER_LEFT_FRIEND_GROUP":
          showSnackbar({ message: `User "${message.data.userId}" left Friend Group "${message.groupId}".`, severity: 'info' }); // Snackbar çağrısı
          console.log("USER_LEFT_FRIEND_GROUP : ", message);
          setFriendGroups(prevGroups => {
            return prevGroups.map(group => {
              if (group._id === message.groupId) {
                return { ...group, members: group.members.filter(member => member._id !== message.data.userId) };
              }
              return group;
            });
          });
          if (selectedConversation?._id === message.groupId) {
            setSelectedConversation(prev => prev ? {...prev, members: prev.members.filter(member => member._id !== message.data.userId)} : null); // Update selected conversation members too
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
            console.log("FRIEND_GROUP_DELETED : ", message);
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
  }, [socket, selectedConversation, showSnackbar, setFriendGroups, setSelectedConversation]); 

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
        console.log("Gönderilen FRIEND_GROUP_MESSAGE_WS payload:", messagePayload);
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
    setIsLoadingPrivateChat(true);
    if (friend) {
      setSelectedConversation({ type: 'private', friendId: friend.id });
      fetchPrivateChatHistory(friend.id);
    } else {
      setIsLoadingPrivateChat(false);
      setMessages([]);
    }
  }, [fetchPrivateChatHistory, setSelectedConversation]);

  const handleFriendGroupSelection = useCallback((group) => {
    setSelectedFriend(null);
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
    isLoadingPrivateChat,
    handleSendFriendMessage,
    handleFriendSelection,
    handleFriendGroupSelection,
    handleDeleteFriendGroup,
    currentUser,
    handleLeaveFriendGroup
  };
};