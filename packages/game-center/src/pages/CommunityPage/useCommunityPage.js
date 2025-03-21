import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../../shared/context/AuthContext';
import { useWebSocket } from '../../shared/context/WebSocketContext/context';
import { useSnackbar } from '../../shared/context/SnackbarContext';
import axios from 'axios';
export const useCommunityPage = () => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const { showSnackbar } = useSnackbar();

  const [communityMessages, setCommunityMessages] = useState([]);
  const [newCommunityMessage, setNewCommunityMessage] = useState("");
  const [isCommunityMessagingLoading, setIsCommunityMessagingLoading] = useState(false);
  const [isLoadingCommunityChat, setIsLoadingCommunityChat] = useState(true);

  const [communityGroups, setCommunityGroups] = useState([]);   // Groups the user is a member of
  const [allGroups, setAllGroups] = useState([]);              // All available groups
  const [isGroupListLoading, setIsGroupListLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMessage, setNewGroupMessage] = useState('');
  const [isGroupMessagingLoading, setIsGroupMessagingLoading] = useState(false);
  const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(false);
  const [isGroupDeleting, setIsGroupDeleting] = useState(false);

  const fetchAllGroups = useCallback(async () => {
    setIsGroupListLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAllGroups(response.data.groups);
    } catch (error) {
      console.error("Error fetching all groups:", error);
      showSnackbar({ message: "Gruplar yüklenirken bir hata oluştu.", severity: 'error' });
    } finally {
      setIsGroupListLoading(false);
    }
  }, [showSnackbar]);

  // Fetch groups that the current user is a member of
  const fetchUserGroups = useCallback(async () => {
    setIsGroupListLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/groups/user-groups', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCommunityGroups(response.data.groups);
      console.log("communitygroups : ",communityGroups)
    } catch (error) {
      console.error("Error fetching user groups:", error);
      showSnackbar({ message: "Kullanıcı grupları yüklenirken bir hata oluştu.", severity: 'error' });
    } finally {
      setIsGroupListLoading(false);
    }
  }, [showSnackbar]);

  const fetchCommunityChatHistory = useCallback(async () => {
    setIsLoadingCommunityChat(true);
    try {
      const token=localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/community-chat',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ); 
      setCommunityMessages(response.data.history);
    } catch (error) {
      console.error("Error fetching community chat history:", error);
      showSnackbar({ message: "Topluluk sohbet geçmişi yüklenirken bir hata oluştu.", severity: 'error' });
    } finally {
      setIsLoadingCommunityChat(false);
    }
  }, [showSnackbar]);


  const fetchGroupChatHistory = useCallback(async (groupId) => {
    if (groupId) {
      setIsLoadingGroupChat(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/groups/groups/${groupId}/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroupMessages(response.data.history);
      } catch (error) {
        console.error("Error fetching group chat history:", error);
        showSnackbar({ message: "Grup sohbet geçmişi yüklenirken bir hata oluştu.", severity: 'error' });
      } finally {
        setIsLoadingGroupChat(false);
      }
    } else {
      console.error("Group ID missing, cannot fetch group chat history.");
      setTimeout(() => setIsLoadingGroupChat(false), 1000); // Timeout to prevent indefinite loading if WebSocket is down
      showSnackbar({ message: "Grup sohbet geçmişi yüklenemedi, grup seçilmedi.", severity: 'error' });
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchCommunityChatHistory(); 
    fetchAllGroups();
    fetchUserGroups();
  }, [fetchAllGroups, fetchUserGroups, fetchCommunityChatHistory]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "RECEIVE_COMMUNITY_MESSAGE":
          setCommunityMessages((prevMessages) => [...prevMessages, message.message]);
          break;

        case "RECEIVE_GROUP_MESSAGE":
          setGroupMessages((prevMessages) => [...prevMessages, message.data]);
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
        console.error("WebSocket connection is not open, cannot send community message.");
        showSnackbar({ message: "Topluluk mesajı gönderilemedi, WebSocket bağlantısı kapalı.", severity: 'error' });
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
        console.error("WebSocket connection is not open, cannot send group message.");
        showSnackbar({ message: "Grup mesajı gönderilemedi, WebSocket bağlantısı kapalı.", severity: 'error' });
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
      console.error("WebSocket connection is not open, cannot leave group.");
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
      console.error("WebSocket connection is not open, cannot delete group.");
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