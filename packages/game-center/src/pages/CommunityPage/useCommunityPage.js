import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../shared/context/AuthContext';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import { useSnackbar } from '../../shared/context/SnackbarContext';

export const useCommunityPage = () => { 
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const { showSnackbar } = useSnackbar();
  // Community message states
  const [communityMessages, setCommunityMessages] = useState([]);
  const [newCommunityMessage, setNewCommunityMessage] = useState("");
  const [isCommunityMessagingLoading, setIsCommunityMessagingLoading] = useState(false);
  const [isLoadingCommunityChat, setIsLoadingCommunityChat] = useState(true);
  const [communityGroups, setCommunityGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isGroupListLoading, setIsGroupListLoading] = useState(true);

  // Group Community State
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMessage, setNewGroupMessage] = useState('');
  const [isGroupMessagingLoading, setIsGroupMessagingLoading] = useState(false);
  const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(false);
  const [isGroupDeleting, setIsGroupDeleting] = useState(false); 

  const fetchAllGroups = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsGroupListLoading(true);
      socket.send(JSON.stringify({ type: "GET_ALL_GROUPS" }));
    } else {
      console.error("WebSocket bağlantısı açık değil, tüm gruplar alınamıyor.");
      setIsGroupListLoading(false);
    }
  }, [socket]);

  const fetchUserGroups = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsGroupListLoading(true);
      socket.send(JSON.stringify({ type: "GET_USER_GROUPS" }));
    } else {
      console.error("WebSocket bağlantısı açık değil, kullanıcı grupları alınamıyor.");
      setIsGroupListLoading(false);
    }
  }, [socket]);

  const fetchCommunityChatHistory = useCallback(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsLoadingCommunityChat(true);
      const historyRequestPayload = {
        type: "GET_COMMUNITY_CHAT_HISTORY",
      };
      socket.send(JSON.stringify(historyRequestPayload));
    } else {
      console.error("WebSocket bağlantısı açık değil, topluluk sohbet geçmişi alınamıyor.");
      setTimeout(() => setIsLoadingCommunityChat(false), 1000);
    }
  }, [socket]);

  const fetchGroupChatHistory = useCallback((groupId) => {
    if (socket && socket.readyState === WebSocket.OPEN && groupId) {
      setIsLoadingGroupChat(true);
      const historyRequestPayload = {
        type: "GET_GROUP_CHAT_HISTORY",
        groupId: groupId,
      };
      socket.send(JSON.stringify(historyRequestPayload));
    } else {
      console.error("WebSocket bağlantısı açık değil veya grup ID'si yok, grup sohbet geçmişi alınamıyor.");
      setTimeout(() => setIsLoadingGroupChat(false), 1000);
    }
  }, [socket]);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      fetchCommunityChatHistory();
      fetchAllGroups();
      fetchUserGroups();
    }
  }, [socket, fetchAllGroups, fetchUserGroups, fetchCommunityChatHistory]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "RECEIVE_COMMUNITY_MESSAGE":
          setCommunityMessages((prevMessages) => [...prevMessages, message.message]);
          break;
        case "COMMUNITY_CHAT_HISTORY":
          setCommunityMessages(message.history);
          setIsLoadingCommunityChat(false);
          break;
        case "RECEIVE_GROUP_MESSAGE":
          setGroupMessages((prevMessages) => [...prevMessages, message.data]);
          break;
        case "GROUP_CHAT_HISTORY":
          setGroupMessages(message.history);
          setIsLoadingGroupChat(false);
          break;
        case "ALL_GROUPS_LIST":
          setAllGroups(message.groups);
          setIsGroupListLoading(false);
          break;
        case "USER_GROUPS_LIST":
          setCommunityGroups(message.groups);
          setIsGroupListLoading(false);
          break;
        case "GROUP_CREATED":
          setAllGroups(prevAllGroups => [...prevAllGroups, message.group]);
          showSnackbar({ message: "Grup başarıyla oluşturuldu!", severity: 'success' }); 
          fetchUserGroups();
          break;
        case "GROUP_JOINED_SUCCESS":
          setCommunityGroups(prevGroups => [...prevGroups, message.group]);
          showSnackbar({ message: "Gruba başarıyla katıldınız!", severity: 'success' }); 
          break;
        case "GROUP_LEFT_SUCCESS":
          setCommunityGroups(prevGroups => prevGroups.filter(group => group._id !== message.groupId));
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
          }
          showSnackbar({ message: "Gruptan başarıyla ayrıldınız!", severity: 'success' }); 
          break;
        case "GROUP_UPDATED_SUCCESS":
          setCommunityGroups(prevGroups =>
            prevGroups.map(group => group._id === message.group._id ? message.group : group)
          );
          setAllGroups(prevAllGroups =>
            prevAllGroups.map(group => group._id === message.group._id ? message.group : group)
          );
          showSnackbar({ message: "Grup başarıyla güncellendi!", severity: 'success' }); 
          break;
        case "GROUP_UPDATED":
          setAllGroups(prevAllGroups =>
            prevAllGroups.map(group => group._id === message.group._id ? message.group : group)
          );
          setCommunityGroups(prevGroups =>
            prevGroups.map(group => group._id === message.group._id ? message.group : group)
          );
          break;
        case "GROUP_DELETED_SUCCESS":
          setIsGroupDeleting(false);
          setCommunityGroups(prevGroups => prevGroups.filter(group => group._id !== message.groupId));
          setAllGroups(prevAllGroups => prevAllGroups.filter(group => group._id !== message.groupId));
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
          }
          showSnackbar({ message: "Grup başarıyla silindi!", severity: 'success' }); 
          break;
        case "GROUP_JOINED":
          setAllGroups(prevAllGroups =>
            prevAllGroups.map(group =>
              group._id === message.group._id ? message.group : group
            )
          );
          setCommunityGroups(prevGroups => {
            if (prevGroups.some(group => group._id === message.group._id)) {
              return prevGroups.map(group =>
                group._id === message.group._id ? message.group : group
              );
            } else {
              return prevGroups;
            }
          });
          break;
        case "USER_LEFT_GROUP":
          setAllGroups(prevAllGroups =>
            prevAllGroups.map(group => {
              if (group._id === message.groupId) {
                return { ...group, members: group.members.filter(member => member._id !== message.data.userId) };
              }
              return group;
            })
          );

          setCommunityGroups(prevGroups => {
            return prevGroups.map(group => {
              if (group._id === message.groupId) {
                return { ...group, members: group.members.filter(member => member._id !== message.data.userId) };
              }
              return group;
            });
          });
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
          }
          break;
        case "GROUP_DELETED":
          setIsGroupDeleting(false);
          setCommunityGroups(prevGroups => prevGroups.filter(group => group._id !== message.groupId));
          setAllGroups(prevAllGroups => prevAllGroups.filter(group => group._id !== message.groupId));
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
          }
          break;
          case "ERROR":
          setIsGroupDeleting(false); 
          showSnackbar({ message: message.message, severity: 'error' });
          break;
        default:
          break;
      }
    };

    socket.addEventListener('message', handleMessage);

    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, selectedGroup, showSnackbar, fetchUserGroups]);

  const handleSendCommunityMessage = () => {
    if (newCommunityMessage.trim()) {
      setIsCommunityMessagingLoading(true);
      const messagePayload = {
        type: "COMMUNITY_MESSAGE",
        message: newCommunityMessage,
      };
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(messagePayload));
        setNewCommunityMessage("");
      } else {
        console.error("WebSocket bağlantısı açık değil.");
      }
      setIsCommunityMessagingLoading(false);
    }
  };

  const handleSendGroupMessage = () => {
    if (newGroupMessage.trim() && selectedGroup) {
      setIsGroupMessagingLoading(true);
      const messagePayload = {
        type: "GROUP_MESSAGE",
        groupId: selectedGroup._id,
        message: newGroupMessage,
      };
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(messagePayload));
        setNewGroupMessage("");
      } else {
        console.error("WebSocket bağlantısı açık değil.");
      }
      setIsGroupMessagingLoading(false);
    }
  };

  const handleGroupSelect = useCallback((group) => {
    setSelectedGroup(group);
    if (group) {
      fetchGroupChatHistory(group._id);
    } else {
      setGroupMessages([]);
    }
  }, [fetchGroupChatHistory]);

  const handleLeaveGroup = (groupId) => {
    const leaveData = {
      type: "LEAVE_GROUP",
      groupId: groupId,
    };
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(leaveData));
    } else {
      console.error("WebSocket bağlantısı açık değil, gruptan ayrılamıyor.");
      showSnackbar({ message: "Gruptan ayrılamadı, WebSocket bağlantısı kapalı.", severity: 'error' });
    }
  };

  const handleDeleteGroup = (groupId) => {
    setIsGroupDeleting(true);
    const deleteData = {
      type: "DELETE_GROUP",
      groupId: groupId,
    };
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(deleteData));
    } else {
      setIsGroupDeleting(false); 
      console.error("WebSocket bağlantısı açık değil, grup silinemiyor.");
      showSnackbar({ message: "Grup silinemedi, WebSocket bağlantısı kapalı.", severity: 'error' });
    }
  };


  return {
    // Community states
    communityMessages,
    newCommunityMessage,
    setNewCommunityMessage,
    isCommunityMessagingLoading,
    isLoadingCommunityChat,
    // Group states
    communityGroups,
    allGroups,
    isGroupListLoading,
    selectedGroup,
    groupMessages,
    newGroupMessage,
    setNewGroupMessage,
    isGroupMessagingLoading,
    isLoadingGroupChat,
    isGroupDeleting,
    // Functions
    handleSendCommunityMessage,
    handleSendGroupMessage,
    handleGroupSelect,
    fetchCommunityChatHistory,
    fetchAllGroups,
    fetchUserGroups,
    handleLeaveGroup,
    handleDeleteGroup,
    currentUser
  };
};