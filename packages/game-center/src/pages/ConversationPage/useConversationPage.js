import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next"; // Added
import { useAuthContext } from "../../shared/context/AuthContext";
import { useWebSocket } from "../../shared/context/WebSocketContext/context";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import { fetchPrivateChatHistoryAPI, fetchFriendGroupChatHistoryAPI } from "./api";

export const useConversationsPage = (
  friendGroups, 
  selectedConversation,
) => {
  const { currentUser } = useAuthContext();
  const { socket } = useWebSocket();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation(); 

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isMessagingLoading, setIsMessagingLoading] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [privatePage, setPrivatePage] = useState(1);
  const [friendPage, setFriendPage] = useState(1);
  const [hasMorePrivate, setHasMorePrivate] = useState(false);
  const [hasMoreFriend, setHasMoreFriend] = useState(false);

  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [groupToUpdate, setGroupToUpdate] = useState(null);

  const containerRef = useRef(null);
  const LIMIT = 30;
  const token = localStorage.getItem("token");

  const fetchPrivateChatHistory = useCallback(
    async (targetUserId, page = 1) => {
      if (!targetUserId) return;
      if (page === 1) setIsLoadingChat(true);
      else setIsLoadingMore(true);
      try {
        const response = await fetchPrivateChatHistoryAPI(token, targetUserId, page, LIMIT);
        const { history, pagination } = response.data;
        setHasMorePrivate(pagination.hasMore);
        setPrivatePage(pagination.currentPage);
        if (page === 1) {
          setMessages(history);
        } else {
          setMessages((prevMessages) => [...history, ...prevMessages]);
        }
      } catch (error) {
        showSnackbar({ message: t("error.fetchPrivateChatHistoryError"), severity: "error" });
      } finally {
        setIsLoadingChat(false);
        if (page > 1) setIsLoadingMore(false);
      }
    },
    [showSnackbar, token, t] 
  );

  const fetchFriendGroupChatHistory = useCallback(
    async (groupId, page = 1) => {
      if (!groupId) return;
      if (page === 1) setIsLoadingChat(true);
      else setIsLoadingMore(true);
      try {
        const response = await fetchFriendGroupChatHistoryAPI(token, groupId, page, LIMIT);
        const { history, pagination } = response.data;
        setHasMoreFriend(pagination.hasMore);
        setFriendPage(pagination.currentPage);
        if (page === 1) {
          setMessages(history);
        } else {
          setMessages((prevMessages) => [...history, ...prevMessages]);
        }
      } catch (error) {
        showSnackbar({ message: t("error.fetchFriendGroupChatHistoryError"), severity: "error" });
      } finally {
        setIsLoadingChat(false);
        if (page > 1) setIsLoadingMore(false);
      }
    },
    [showSnackbar, token, t] // Added t to dependencies
  );

  useEffect(() => {
    if (selectedConversation) {
      if (selectedConversation.type === "private" && selectedConversation.id) {
        fetchPrivateChatHistory(selectedConversation.id, 1);
      } else if (selectedConversation.type === "friendGroup" && selectedConversation._id) {
        fetchFriendGroupChatHistory(selectedConversation._id, 1);
      }
    } else {
      setMessages([]);
    }
  }, [selectedConversation, fetchPrivateChatHistory, fetchFriendGroupChatHistory]);

  const loadMoreMessages = useCallback(() => {
    if (isLoadingMore || !selectedConversation) return;
    if (selectedConversation.type === "friendGroup" && hasMoreFriend) {
      fetchFriendGroupChatHistory(selectedConversation._id, friendPage + 1);
    } else if (selectedConversation.type === "private" && hasMorePrivate) {
      fetchPrivateChatHistory(selectedConversation.id, privatePage + 1);
    }
  }, [selectedConversation, friendPage, privatePage, hasMoreFriend, hasMorePrivate, fetchFriendGroupChatHistory, fetchPrivateChatHistory, isLoadingMore]);

  useEffect(() => {
    if (selectedConversation) {
      if (selectedConversation.type === "private") {
        setPrivatePage(1);
        setHasMorePrivate(true);
      } else if (selectedConversation.type === "friendGroup") {
        setFriendPage(1);
        setHasMoreFriend(true);
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleWebSocketMessage = (event) => {
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(event.data);
      } catch (error) {
        return;
      }

      switch (parsedMessage.type) {
        case "RECEIVE_PRIVATE_MESSAGE":
          const receivedPrivateMsg = parsedMessage.message;
          const senderIdFromMessage = typeof receivedPrivateMsg.senderId === 'object' ? receivedPrivateMsg.senderId?._id : receivedPrivateMsg.senderId;
          const receiverIdFromMessage = typeof receivedPrivateMsg.receiverId === 'object' ? receivedPrivateMsg.receiverId?._id : receivedPrivateMsg.receiverId;
          const isCorrectPrivateChat = selectedConversation &&
            selectedConversation.type === "private" &&
            currentUser &&
            ((senderIdFromMessage === currentUser.id && receiverIdFromMessage === selectedConversation.id) ||
             (receiverIdFromMessage === currentUser.id && senderIdFromMessage === selectedConversation.id));

          if (isCorrectPrivateChat) {
            setMessages((prevMessages) => {
              const existingIndex = prevMessages.findIndex(m =>
                (m._id === receivedPrivateMsg._id && !m._id?.startsWith('temp_')) ||
                (m._id?.startsWith('temp_') && m.message === receivedPrivateMsg.message && senderIdFromMessage === (typeof m.senderId === 'object' ? m.senderId._id : m.senderId))
              );
              if (existingIndex > -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[existingIndex] = { ...receivedPrivateMsg, status: 'SENT' };
                return updatedMessages;
              }
              return [...prevMessages, { ...receivedPrivateMsg, status: 'SENT' }];
            });
          }
          break;

        case "RECEIVE_FRIEND_GROUP_MESSAGE":
          const receivedGroupMsg = parsedMessage.data;
          if (!receivedGroupMsg || !receivedGroupMsg.senderId || !receivedGroupMsg.groupId) {
            return;
          }
          const groupSenderId = typeof receivedGroupMsg.senderId === 'object' ? receivedGroupMsg.senderId?._id : receivedGroupMsg.senderId;
          const isCorrectGroupChat = selectedConversation &&
            selectedConversation.type === "friendGroup" &&
            selectedConversation._id === receivedGroupMsg.groupId;

          if (isCorrectGroupChat) {
            setMessages((prevMessages) => {
              const existingIndex = prevMessages.findIndex(m =>
                (m._id === receivedGroupMsg._id && !m._id?.startsWith('temp_')) ||
                (m._id?.startsWith('temp_') && m.message === receivedGroupMsg.message && groupSenderId === (typeof m.senderId === 'object' ? m.senderId._id : m.senderId))
              );
              if (existingIndex > -1) {
                const updatedMessages = [...prevMessages];
                updatedMessages[existingIndex] = { ...receivedGroupMsg, status: 'SENT' };
                return updatedMessages;
              }
              return [...prevMessages, { ...receivedGroupMsg, status: 'SENT' }];
            });
          }
          break;
        
        case "ACKNOWLEDGEMENT":
          if (parsedMessage.data && parsedMessage.data.tempId && parsedMessage.data.actualMessage) {
            const { tempId, actualMessage } = parsedMessage.data;
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg._id === tempId ? { ...actualMessage, status: 'SENT' } : msg
              )
            );
          } else if (parsedMessage.tempId && parsedMessage.messageId) {
             setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg._id === parsedMessage.tempId ? { ...msg, _id: parsedMessage.messageId, status: 'SENT' } : msg
              )
            );
          }
          break;

        case "USER_LEFT_FRIEND_GROUP":
            if (selectedConversation?._id === parsedMessage.groupId && parsedMessage.data?.userId === currentUser?.id) {
                 setMessages([]);
            }
            break;
        case "FRIEND_GROUP_DELETED":
            if (selectedConversation?._id === parsedMessage.groupId) {
                setMessages([]);
            }
            break;
        default:
          break;
      }
    };

    socket.addEventListener("message", handleWebSocketMessage);
    return () => {
      socket.removeEventListener("message", handleWebSocketMessage);
    };
  }, [socket, selectedConversation, currentUser, showSnackbar]);

  const handleSendFriendMessage = () => {
    if (newMessage.trim() && selectedConversation && currentUser) {
      setIsMessagingLoading(true);
      let messagePayload = {};
      const timestamp = new Date().toISOString();
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      let tempMessageForUI = {
        _id: tempId,
        message: newMessage,
        createdAt: timestamp,
        status: 'PENDING',
        senderId: currentUser.id,
        sender: { _id: currentUser.id, username: currentUser.username, profileImage: currentUser.profileImage },
      };

      if (selectedConversation.type === "friendGroup") {
        messagePayload = {
          type: "FRIEND_GROUP_MESSAGE_WS",
          groupId: selectedConversation._id,
          message: newMessage,
          tempId: tempId,
        };
        tempMessageForUI.groupId = selectedConversation._id;
      } else if (selectedConversation.type === "private" && selectedConversation.id) {
        messagePayload = {
          type: "PRIVATE_MESSAGE",
          receiverId: selectedConversation.id,
          message: newMessage,
          tempId: tempId,
        };
        tempMessageForUI.receiverId = selectedConversation.id;
      }

      if (socket && socket.readyState === WebSocket.OPEN && Object.keys(messagePayload).length > 0) {
        socket.send(JSON.stringify(messagePayload));
        setMessages((prevMessages) => [...prevMessages, tempMessageForUI]);
        setNewMessage("");
      } else {
        if (Object.keys(messagePayload).length === 0) {
           showSnackbar({ message: t("error.messageSendNoChatSelected"), severity: "error" });
        } else {
           showSnackbar({ message: t("error.messageSendConnectionIssue"), severity: "error" });
        }
      }
      setIsMessagingLoading(false);
    }
  };

  const handleFriendSelection = useCallback(
    (friend) => {
      if (friend && friend.id) {
        setSelectedFriend(friend);
      } else {
        setSelectedFriend(null);
      }
    },
    []
  );

  const handleFriendGroupSelection = useCallback(
    (group) => {
      if (group && group._id) {
        setSelectedFriend(null);
      }
    },
    []
  );

  const handleDeleteFriendGroup = async (groupId) => {
    const group = friendGroups?.find((g) => g._id === groupId);
    const groupName = group?.groupName || t("common.unknownGroupName", "Unknown Group"); 

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "DELETE_FRIEND_GROUP_WS", groupId }));
      showSnackbar({ message: t("friendGroups.deleteSuccess", { groupName }), severity: "info" });
    } else {
      showSnackbar({ message: t("error.webSocketConnectionDeleteFailed", "WebSocket connection not available. Group cannot be deleted."), severity: "error" });
    }
  };

  const handleLeaveFriendGroup = async (groupId) => {
    const group = friendGroups?.find((g) => g._id === groupId);
    const groupName = group?.groupName || t("common.unknownGroupName", "Unknown Group");

    if (socket && socket.readyState === WebSocket.OPEN && currentUser) {
      socket.send(JSON.stringify({ type: "LEAVE_FRIEND_GROUP_WS", groupId }));
      showSnackbar({ message: t("notifications.leaveGroupRequestSent", { groupName }), severity: "info" });
      if (selectedConversation?._id === groupId) {
         setMessages([]);
      }
    } else {
      showSnackbar({ message: t("error.webSocketConnectionOrUserMissing", "WebSocket connection not available or user info missing."), severity: "error" });
    }
  };

  const openUpdateDialog = useCallback((group) => {
    setGroupToUpdate(group);
    setIsUpdateDialogOpen(true);
  }, []);

  const closeUpdateDialog = useCallback(() => {
    setIsUpdateDialogOpen(false);
    setGroupToUpdate(null);
  }, []);

  const handleUpdateFriendGroup = useCallback(
    (updates) => {
      if (!groupToUpdate || !socket || socket.readyState !== WebSocket.OPEN) {
        showSnackbar({ message: t("error.groupUpdateFailedConnectionOrGroup"), severity: "error" });
        return;
      }
      socket.send(JSON.stringify({ type: "UPDATE_FRIEND_GROUP_WS", groupId: groupToUpdate._id, ...updates }));
      closeUpdateDialog();
    },
    [socket, groupToUpdate, closeUpdateDialog, showSnackbar, t] 
  );

  return {
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
    isLoadingMore,
    isUpdateDialogOpen,
    groupToUpdate,
    openUpdateDialog,
    closeUpdateDialog,
    handleUpdateFriendGroup,
  };
};