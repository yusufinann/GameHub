// useCommunityPage.js
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useWebSocket } from "../../shared/context/WebSocketContext/context";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import { useTranslation } from "react-i18next";
import {
  fetchAllGroupsAPI,
  fetchUserGroupsAPI,
  fetchCommunityChatHistoryAPI,
  fetchGroupChatHistoryAPI,
} from "./api";

const LIMIT = 30;

export const useCommunityPage = () => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const { showSnackbar } = useSnackbar();
  const token = localStorage.getItem("token");
  const { t } = useTranslation();

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
      const data = await fetchAllGroupsAPI(token);
      setAllGroups(data.groups);
    } catch (error) {
      showSnackbar({
        message: t("error.fetchingAllGroups", "Gruplar yüklenirken bir hata oluştu."),
        severity: "error",
      });
    } finally {
      setIsGroupListLoading(false);
    }
  }, [showSnackbar, token, t]);

  const fetchUserGroups = useCallback(async () => {
    try {
      const data = await fetchUserGroupsAPI(token);
      setCommunityGroups(data.groups);
    } catch (error) {
      showSnackbar({
        message: t("error.fetchingUserGroups", "Kullanıcı grupları yüklenirken bir hata oluştu."),
        severity: "error",
      });
    }
  }, [showSnackbar, token, t]);

  const fetchCommunityChatHistory = useCallback(
    async (page = 1) => {
      if (page === 1) {
        setIsLoadingCommunityChat(true);
        setCommunityMessages([]);
      } else {
        setIsLoadingMoreMessages(true);
      }
      try {
        const data = await fetchCommunityChatHistoryAPI(token, page, LIMIT);
        const { history, pagination } = data;
        setHasMoreCommunity(pagination.hasMore);
        setCommunityPage(pagination.currentPage);

        if (page === 1) {
          setCommunityMessages(history);
        } else {
          setCommunityMessages((prevMessages) => [...history, ...prevMessages]);
        }
      } catch (error) {
        showSnackbar({
          message: t("error.fetchingCommunityChat", "Topluluk sohbet geçmişi yüklenirken bir hata oluştu."),
          severity: "error",
        });
      } finally {
        setIsLoadingCommunityChat(false);
        if (page > 1) {
          setIsLoadingMoreMessages(false);
        }
      }
    },
    [showSnackbar, token, t]
  );

  const fetchGroupChatHistory = useCallback(
    async (groupId, page = 1) => {
      if (!groupId) {
        showSnackbar({
          message: t("error.groupIdMissingForChat", "Grup sohbet geçmişi yüklenemedi, grup seçilmedi."),
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
        const data = await fetchGroupChatHistoryAPI(token, groupId, page, LIMIT);
        const { history, pagination } = data;
        setHasMoreGroup(pagination.hasMore);
        setGroupPage(pagination.currentPage);

        if (page === 1) {
          setGroupMessages(history);
        } else {
          setGroupMessages((prevMessages) => [...history, ...prevMessages]);
        }
      } catch (error) {
        showSnackbar({
          message: t("error.fetchingGroupChat", "Grup sohbet geçmişi yüklenirken bir hata oluştu."),
          severity: "error",
        });
      } finally {
        setIsLoadingGroupChat(false);
        if (page > 1) {
          setIsLoadingMoreMessages(false);
        }
      }
    },
    [showSnackbar, token, t]
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
            message: t("success.groupCreated", "Grup başarıyla oluşturuldu!"),
            severity: "success",
          });
          fetchUserGroups();
          break;

        case "GROUP_JOINED_SUCCESS":
          setCommunityGroups((prev) => {
            const exists = prev.some((g) => g._id === message.group._id);
            return exists ? prev : [...prev, message.group];
          });
          setAllGroups(prev => prev.map(g => g._id === message.group._id ? message.group : g));
          showSnackbar({ message: t("success.groupJoined", "Gruba katıldınız!"), severity: "success" });
          break;

        case "GROUP_JOINED":
          setAllGroups((prev) =>
            prev.map((g) => (g._id === message.group._id ? message.group : g))
          );
          setCommunityGroups((prev) =>
            prev.map((g) => (g._id === message.group._id ? message.group : g))
          );
          break;

        case "GROUP_LEFT_SUCCESS":
          setCommunityGroups((prevGroups) =>
            prevGroups.filter((group) => group._id !== message.groupId)
          );
          setAllGroups(prevAllGroups =>
            prevAllGroups.map(group => {
              if (group._id === message.groupId) {
                return { ...group, members: group.members.filter(m => m._id !== currentUser?.id) };
              }
              return group;
            }).filter(group => group.members?.length > 0 || group.createdBy?._id === currentUser?.id || !group.members )
          );
          if (selectedGroup && selectedGroup._id === message.groupId) {
            setSelectedGroup(null);
            setGroupMessages([]);
            setGroupPage(1);
            setHasMoreGroup(false);
          }
          showSnackbar({
            message: t("success.groupLeft", "Gruptan ayrıldınız."),
            severity: "success",
          });
          break;

        case "USER_LEFT_GROUP":
           setAllGroups((prevAllGroups) =>
            prevAllGroups.map((group) => {
              if (group._id === message.groupId) {
                return message.data.updatedGroup || {
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
                 return message.data.updatedGroup || {
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
          if (selectedGroup && selectedGroup._id === message.group._id) {
            setSelectedGroup(message.group);
          }
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
          if (selectedGroup && selectedGroup._id === message.group._id) {
            setSelectedGroup(message.group);
          }
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
            setGroupPage(1);
            setHasMoreGroup(false);
          }
          showSnackbar({
            message: t("success.groupDeleted", "Grup başarıyla silindi!"),
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
            setGroupPage(1);
            setHasMoreGroup(false);
          }
          break;

        case "ERROR":
          setIsGroupDeleting(false);
          setIsGroupMessagingLoading(false);
          setIsCommunityMessagingLoading(false);
          showSnackbar({ message: message.message, severity: "error" });
          break;

        default:
          break;
      }
    };

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket, selectedGroup, showSnackbar, fetchUserGroups, currentUser?.id, t]);

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
      // Potentially show snackbar for empty message
    } else {
      showSnackbar({
        message: t("error.wsCommunityMessage", "Topluluk mesajı gönderilemedi, WebSocket bağlantısı kapalı."),
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
        // Potentially show snackbar for empty message
    } else if (!selectedGroup) {
      showSnackbar({
        message: t("warning.selectGroupToSend", "Mesaj göndermek için bir grup seçin."),
        severity: "warning",
      });
    } else {
      showSnackbar({
        message: t("error.wsGroupMessage", "Grup mesajı gönderilemedi, WebSocket bağlantısı kapalı."),
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
      showSnackbar({
        message: t("error.wsLeaveGroup", "Gruptan ayrılamadı, WebSocket bağlantısı kapalı."),
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
      showSnackbar({
        message: t("error.wsDeleteGroup", "Grup silinemedi, WebSocket bağlantısı kapalı."),
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
    handleLeaveGroup,
    handleDeleteGroup,
    isGroupDeleting,
    containerRef,
    loadMoreMessages,
    isLoadingMoreMessages,
    t,
  };
};