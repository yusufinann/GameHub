import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useWebSocket } from "../../shared/context/WebSocketContext/context";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import axios from "axios";
import { useTranslation } from "react-i18next";
const LIMIT = 30;

export const useCommunityPage = () => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const { showSnackbar } = useSnackbar();
  const token = localStorage.getItem("token");
const{t}=useTranslation();
  const [communityMessages, setCommunityMessages] = useState([]);
  const [newCommunityMessage, setNewCommunityMessage] = useState("");
  const [isCommunityMessagingLoading, setIsCommunityMessagingLoading] =
    useState(false);
  const [isLoadingCommunityChat, setIsLoadingCommunityChat] = useState(false); 
  const [communityPage, setCommunityPage] = useState(1);
  const [hasMoreCommunity, setHasMoreCommunity] = useState(false);

  const [communityGroups, setCommunityGroups] = useState([]); 
  const [allGroups, setAllGroups] = useState([]); 
  const [isGroupListLoading, setIsGroupListLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);
  const [newGroupMessage, setNewGroupMessage] = useState("");
  const [isGroupMessagingLoading, setIsGroupMessagingLoading] = useState(false);
  const [isLoadingGroupChat, setIsLoadingGroupChat] = useState(false);
  const [groupPage, setGroupPage] = useState(1);
  const [hasMoreGroup, setHasMoreGroup] = useState(false);
  const [isGroupDeleting, setIsGroupDeleting] = useState(false);

  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const containerRef = useRef(null);

  const fetchAllGroups = useCallback(async () => {
    setIsGroupListLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3001/api/chat/groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllGroups(response.data.groups);
    } catch (error) {
      console.error("Error fetching all groups:", error);
      showSnackbar({
        message: "Gruplar yüklenirken bir hata oluştu.",
        severity: "error",
      });
    } finally {
      setIsGroupListLoading(false);
    }
  }, [showSnackbar, token]);

  const fetchUserGroups = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/chat/user-groups",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommunityGroups(response.data.groups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      showSnackbar({
        message: "Kullanıcı grupları yüklenirken bir hata oluştu.",
        severity: "error",
      });
    } finally {
      // Only set to false if both fetches might be complete, or handle loading state more granularly
      // Consider a combined loading state if necessary
      // setIsGroupListLoading(false);
    }
  }, [showSnackbar, token]);

  const fetchCommunityChatHistory = useCallback(
    async (page = 1) => {
      if (page === 1) {
        setIsLoadingCommunityChat(true);
        setCommunityMessages([]);
      } else {
        setIsLoadingMoreMessages(true);
      }
      try {
        const response = await axios.get(
          `http://localhost:3001/api/chat/community?page=${page}&limit=${LIMIT}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { history, pagination } = response.data;
        setHasMoreCommunity(pagination.hasMore);
        setCommunityPage(pagination.currentPage);

        if (page === 1) {
          setCommunityMessages(history);
        } else {
          setCommunityMessages((prevMessages) => [...history, ...prevMessages]);
        }
      } catch (error) {
        console.error("Error fetching community chat history:", error);
        showSnackbar({
          message: "Topluluk sohbet geçmişi yüklenirken bir hata oluştu.",
          severity: "error",
        });
      } finally {
        setIsLoadingCommunityChat(false);
        if (page > 1) {
          setIsLoadingMoreMessages(false);
        }
      }
    },
    [showSnackbar, token]
  );

  const fetchGroupChatHistory = useCallback(
    async (groupId, page = 1) => {
      if (!groupId) {
        console.error("Group ID missing, cannot fetch group chat history.");
        showSnackbar({
          message: "Grup sohbet geçmişi yüklenemedi, grup seçilmedi.",
          severity: "warning",
        });
        setIsLoadingGroupChat(false);
        return;
      }

      if (page === 1) {
        setIsLoadingGroupChat(true);
        setGroupMessages([]); 
      } else {
        setIsLoadingMoreMessages(true);
      }

      try {
        const response = await axios.get(
          `http://localhost:3001/api/chat/groups/${groupId}/history?page=${page}&limit=${LIMIT}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const { history, pagination } = response.data;
        setHasMoreGroup(pagination.hasMore);
        setGroupPage(pagination.currentPage);

        if (page === 1) {
          setGroupMessages(history);
        } else {
          setGroupMessages((prevMessages) => [...history, ...prevMessages]);
        }
      } catch (error) {
        console.error("Error fetching group chat history:", error);
        showSnackbar({
          message: "Grup sohbet geçmişi yüklenirken bir hata oluştu.",
          severity: "error",
        });
      } finally {
        setIsLoadingGroupChat(false);
        if (page > 1) {
          setIsLoadingMoreMessages(false);
        }
      }
    },
    [showSnackbar, token]
  );

  const loadMoreMessages = useCallback(() => {
    if (isLoadingMoreMessages) return;

    if (!selectedGroup && hasMoreCommunity) {
      fetchCommunityChatHistory(communityPage + 1);
    } else if (selectedGroup && hasMoreGroup) {
      fetchGroupChatHistory(selectedGroup._id, groupPage + 1);
    }
  }, [
    selectedGroup,
    hasMoreCommunity,
    hasMoreGroup,
    communityPage,
    groupPage,
    fetchCommunityChatHistory,
    fetchGroupChatHistory,
    isLoadingMoreMessages,
  ]);

  useEffect(() => {
    fetchCommunityChatHistory(1);
    fetchAllGroups();
    fetchUserGroups();
  }, [fetchAllGroups, fetchUserGroups, fetchCommunityChatHistory]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "RECEIVE_COMMUNITY_MESSAGE":
          setCommunityMessages((prevMessages) => [
            ...prevMessages,
            message.message,
          ]);
          break;

        case "RECEIVE_GROUP_MESSAGE":
          if (selectedGroup && message.data.groupId === selectedGroup._id) {
            setGroupMessages((prevMessages) => [...prevMessages, message.data]);
          }
          break;

        case "GROUP_CREATED":
          setAllGroups((prevAllGroups) => [...prevAllGroups, message.group]);
          showSnackbar({
            message: t("createdGroup"),
            severity: "success",
          });
          fetchUserGroups();
          break;

        case "GROUP_JOINED_SUCCESS":
          setCommunityGroups((prev) => {
            const exists = prev.some((g) => g._id === message.group._id);
            return exists ? prev : [...prev, message.group];
          });
          showSnackbar({ message: "Gruba katıldınız!", severity: "success" });
          break;

        case "GROUP_JOINED":
          setAllGroups((prev) =>
            prev.map((g) => (g._id === message.group._id ? message.group : g))
          );
          setCommunityGroups((prev) =>
            prev.some((g) => g._id === message.group._id)
              ? prev.map((g) =>
                  g._id === message.group._id ? message.group : g
                )
              : [...prev, message.group]
          );
          break;

        case "GROUP_LEFT_SUCCESS":
          setCommunityGroups((prevGroups) =>
            prevGroups.filter((group) => group._id !== message.groupId)
          );
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
            setGroupPage(1);
            setHasMoreGroup(false);
          }
          showSnackbar({
            message: t("leaveGroup"),
            severity: "success",
          });
          break;

        case "USER_LEFT_GROUP":
          setAllGroups((prevAllGroups) =>
            prevAllGroups.map((group) => {
              if (group._id === message.groupId) {
                return {
                  ...group,
                  members: group.members.filter(
                    (member) => member._id !== message.data.userId
                  ),
                };
              }
              return group;
            })
          );
          setCommunityGroups((prevGroups) => {
            return prevGroups.map((group) => {
              if (group._id === message.groupId) {
                return {
                  ...group,
                  members: group.members.filter(
                    (member) => member._id !== message.data.userId
                  ),
                };
              }
              return group;
            });
          });
          break;
        case "GROUP_UPDATED_SUCCESS":
          setCommunityGroups((prevGroups) =>
            prevGroups.map((group) =>
              group._id === message.group._id ? message.group : group
            )
          );
          setAllGroups((prevAllGroups) =>
            prevAllGroups.map((group) =>
              group._id === message.group._id ? message.group : group
            )
          );
          showSnackbar({
            message: "Grup başarıyla güncellendi!",
            severity: "success",
          });
          break;
        case "GROUP_UPDATED":
          setAllGroups((prevAllGroups) =>
            prevAllGroups.map((group) =>
              group._id === message.group._id ? message.group : group
            )
          );
          setCommunityGroups((prevGroups) =>
            prevGroups.map((group) =>
              group._id === message.group._id ? message.group : group
            )
          );
          break;
        case "GROUP_DELETED_SUCCESS":
          setIsGroupDeleting(false);
          setCommunityGroups((prevGroups) =>
            prevGroups.filter((group) => group._id !== message.groupId)
          );
          setAllGroups((prevAllGroups) =>
            prevAllGroups.filter((group) => group._id !== message.groupId)
          );
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
          }
          showSnackbar({
            message: "Grup başarıyla silindi!",
            severity: "success",
          });
          break;
        case "GROUP_DELETED":
          setIsGroupDeleting(false);
          setCommunityGroups((prevGroups) =>
            prevGroups.filter((group) => group._id !== message.groupId)
          );
          setAllGroups((prevAllGroups) =>
            prevAllGroups.filter((group) => group._id !== message.groupId)
          );
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
          }
          break;
        case "ERROR":
          setIsGroupDeleting(false);
          setIsGroupMessagingLoading(false);
          setIsCommunityMessagingLoading(false);
          showSnackbar({ message: message.message, severity: "error" });
          break;

        default:
          // console.log("Unknown WS message type in Community Hook:", message.type);
          break;
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, selectedGroup, showSnackbar, fetchUserGroups, currentUser?.id]);

  const handleSendCommunityMessage = () => {
    if (
      newCommunityMessage.trim() &&
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      setIsCommunityMessagingLoading(true);
      const messagePayload = {
        type: "COMMUNITY_MESSAGE",
        message: newCommunityMessage,
      };
      socket.send(JSON.stringify(messagePayload));
      setNewCommunityMessage("");
      setIsCommunityMessagingLoading(false);
    } else if (!newCommunityMessage.trim()) {
      // Maybe a small warning snackbar?
    } else {
      console.error(
        "WebSocket connection is not open, cannot send community message."
      );
      showSnackbar({
        message: "Topluluk mesajı gönderilemedi, WebSocket bağlantısı kapalı.",
        severity: "error",
      });
      setIsCommunityMessagingLoading(false);
    }
  };

  const handleSendGroupMessage = () => {
    if (
      newGroupMessage.trim() &&
      selectedGroup &&
      socket &&
      socket.readyState === WebSocket.OPEN
    ) {
      setIsGroupMessagingLoading(true);
      const messagePayload = {
        type: "GROUP_MESSAGE",
        groupId: selectedGroup._id,
        message: newGroupMessage,
      };
      socket.send(JSON.stringify(messagePayload));
      setNewGroupMessage("");
      setIsGroupMessagingLoading(false);
    } else if (!newGroupMessage.trim()) {
    } else if (!selectedGroup) {
      showSnackbar({
        message: "Mesaj göndermek için bir grup seçin.",
        severity: "warning",
      });
    } else {
      console.error(
        "WebSocket connection is not open, cannot send group message."
      );
      showSnackbar({
        message: "Grup mesajı gönderilemedi, WebSocket bağlantısı kapalı.",
        severity: "error",
      });
      setIsGroupMessagingLoading(false);
    }
  };

  const handleGroupSelect = useCallback(
    (group) => {
      if (selectedGroup?._id === group?._id) return;

      setSelectedGroup(group);
      setGroupMessages([]);
      setGroupPage(1);
      setHasMoreGroup(false);

      if (group) {
        fetchGroupChatHistory(group._id, 1);
      }
    },
    [fetchGroupChatHistory, selectedGroup?._id]
  );

  const handleLeaveGroup = (groupId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const leaveData = { type: "LEAVE_GROUP", groupId: groupId };
      socket.send(JSON.stringify(leaveData));
    } else {
      console.error("WebSocket connection is not open, cannot leave group.");
      showSnackbar({
        message: "Gruptan ayrılamadı, WebSocket bağlantısı kapalı.",
        severity: "error",
      });
    }
  };

  const handleDeleteGroup = (groupId) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      setIsGroupDeleting(true);
      const deleteData = { type: "DELETE_GROUP", groupId: groupId };
      socket.send(JSON.stringify(deleteData));
    } else {
      console.error("WebSocket connection is not open, cannot delete group.");
      showSnackbar({
        message: "Grup silinemedi, WebSocket bağlantısı kapalı.",
        severity: "error",
      });
      setIsGroupDeleting(false);
    }
  };

  return {
    currentUser,
    communityMessages,
    newCommunityMessage,
    setNewCommunityMessage,
    isCommunityMessagingLoading,
    isLoadingCommunityChat,
    handleSendCommunityMessage,
    hasMoreCommunity,
    communityPage,
    communityGroups,
    allGroups,
    isGroupListLoading,
    selectedGroup,
    groupMessages,
    newGroupMessage,
    setNewGroupMessage,
    isGroupMessagingLoading,
    isLoadingGroupChat,
    handleSendGroupMessage,
    handleGroupSelect,
    hasMoreGroup,
    groupPage,
    handleLeaveGroup,
    handleDeleteGroup,
    isGroupDeleting,
    containerRef,
    loadMoreMessages,
    isLoadingMoreMessages,
  };
};
