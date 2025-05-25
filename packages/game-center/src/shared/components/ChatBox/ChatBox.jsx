import React, { useState, useCallback, useEffect, useRef } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBoxHeader from "./ChatBoxHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import { Message as MessageIcon } from "@mui/icons-material";
import {useParams } from "react-router-dom";
import MessageModal from "../MessageModal";
import { useWebSocket } from "../../context/WebSocketContext/context";
import GroupMemberList from "./GroupMemberList";
import { useTranslation } from "react-i18next";


const FRIENDSHIP_REQUIRED_MSG = "you must be friends with the founder of the group to join the group";
const GROUP_NOT_FOUND_MSG = "Friend Grup bulunamadı.";
const GROUP_MAX_MEMBERS_MSG = "Friend Grup maksimum üye sayısına ulaştı.";
const INCORRECT_PASSWORD_MSG = "Yanlış şifre.";
const ALREADY_MEMBER_MSG = "Zaten bu Friend grubun üyesisiniz.";
const GENERIC_JOIN_ERROR_MSG = "Friend Gruba katılırken bir hata oluştu.";


const ChatBox = ({
  chatType,
  chatTitle,
  selectedConversation,
  messages,
  newMessage,
  handleSendMessage,
  setNewMessage,
  isMessagingLoading,
  currentUser,
  selectedFriend,
  isLoadingHistory,
  loadMoreMessages,
  hasMore,
  isLoadingMore,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { socket } = useWebSocket();

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    severity: "error",
    title: undefined,
  });

  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const { groupId } = useParams();

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  let isMember = true;
  if (chatType === "friendGroup" && selectedConversation) {
    isMember = selectedConversation.members?.some(
      (member) => member._id === currentUser.id
    );
  }

  const showModal = useCallback(
    (message, severity = "error", title = undefined) => {
      if (mountedRef.current) {
        setModalConfig({ message, severity, title });
        setIsMessageModalOpen(true);
      }
    },
    [setModalConfig, setIsMessageModalOpen]
  );

  const handleCloseModal = useCallback(() => {
    setIsMessageModalOpen(false);
  }, [setIsMessageModalOpen]);

  const handleJoinGroup = () => {
    if (isJoiningGroup || !socket || !groupId) return;

    setIsJoiningGroup(true);
    try {
      const messagePayload = {
        type: "ACCEPT_FRIEND_GROUP_INVITATION_WS",
        acceptedGroupId: groupId,
      };
      socket.send(JSON.stringify(messagePayload));
    } catch (error) {
      console.error("Error sending join group message (client-side):", error);
      showModal(t("failedToSendRequestError", "Failed to send request. Check connection."), "error", t("Error"));
      if (mountedRef.current) {
        setIsJoiningGroup(false);
      }
    }
  };

  useEffect(() => {
    if (!socket) return;

    const handleSocketMessage = (event) => {
      if (!mountedRef.current) return; 

      try {
        const data = JSON.parse(event.data);
        let actionCompleted = false; 

        if (data.type === "ERROR" && isJoiningGroup) { 
          actionCompleted = true; 
          let errorTitle = t("errorTitle", "Error"); 
          let errorSeverity = "error";
          let messageHandled = false; 

          switch (data.message) {
            case FRIENDSHIP_REQUIRED_MSG:
              showModal(
                t("friendshipRequiredForGroupJoin", data.message),
                "warning", 
                t("groupJoinWarningTitle", "Group Join") 
              );
              messageHandled = true;
              break;
            case GROUP_NOT_FOUND_MSG:
              showModal(t("groupNotFound", data.message), errorSeverity, errorTitle);
              messageHandled = true;
              break;
            case GROUP_MAX_MEMBERS_MSG:
              showModal(t("groupMaxMembersReached", data.message), errorSeverity, errorTitle);
              messageHandled = true;
              break;
            case INCORRECT_PASSWORD_MSG:
              showModal(t("incorrectGroupPassword", data.message), errorSeverity, errorTitle);
              messageHandled = true;
              break;
            case ALREADY_MEMBER_MSG:
              showModal(t("alreadyGroupMemberError", data.message), "info", t("common.infoTitle", "Info"));
              messageHandled = true;
              break;
            case GENERIC_JOIN_ERROR_MSG:
              showModal(t("joinGroupGenericError", data.message), errorSeverity, errorTitle);
              messageHandled = true;
              break;
            default:
              if (!messageHandled) {
                showModal(data.message || t("joinGroupGenericError", "An unknown error occurred while joining."), errorSeverity, errorTitle);
              }
              break;
          }
        } else if (data.type === "JOIN_FRIEND_GROUP_SUCCESS") {
          if (data.group && data.group.id === groupId) {
            actionCompleted = true;
            showModal(
              t("joinedGroupSuccessMessage", "Successfully joined the group: {{groupName}}", { groupName: data.group.groupName || t("theGroup","the group") }),
              "success",
              t("common.successTitle", "Success")
            );
          }
        }
        // Potentially listen for "FRIEND_GROUP_UPDATED" if it's relevant for UI changes after join
        else if (data.type === "FRIEND_GROUP_UPDATED" && data.groupId === groupId) {
            // This event might indicate that selectedConversation data needs refresh
            // If `isJoiningGroup` was true and this comes, it might also imply success.
            // Handle as per your application's state management for selectedConversation.
        }

        if (actionCompleted && isJoiningGroup && mountedRef.current) {
          setIsJoiningGroup(false);
        }

      } catch (e) {
        console.error("Error processing WebSocket message in ChatBox:", e);
        // If an error occurs during parsing but we were in a joining state
        if (isJoiningGroup && mountedRef.current) {
          showModal(t("genericProcessingError", "Error processing server response."), "error", t("Error"));
          setIsJoiningGroup(false);
        }
      }
    };

    socket.addEventListener('message', handleSocketMessage);
    return () => {
      socket.removeEventListener('message', handleSocketMessage);
    };
  }, [socket, showModal, t, groupId, isJoiningGroup, setIsJoiningGroup]);

  const isJoinGroupViewVisible = chatType === "friendGroup" && !isMember && selectedConversation;
  const isChatContentVisible =
    !isJoinGroupViewVisible &&
    (chatType === "community" ||
      chatType === "group" ||
      selectedFriend ||
      (chatType === "friendGroup" && isMember));
  const isPlaceholderVisible = !isJoinGroupViewVisible && !isChatContentVisible;

  if (chatType === "friendGroup" && !selectedConversation && groupId) {
  }

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "80%" },
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        mt: 1,
      }}
    >
      {isJoinGroupViewVisible ? (
        <Paper
          elevation={0}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.paper",
            overflow: "hidden",
            boxShadow: theme.shadows[3],
            borderRadius: 2
          }}
        >
          <ChatBoxHeader
            chatType={chatType}
            chatTitle={selectedConversation?.groupName || t("groupFallbackTitle", "Group Chat")}
            selectedFriend={null}
            selectedConversation={selectedConversation}
            currentUser={currentUser}
            t={t}
          />
          <Box
            sx={{
              p: 3,
              overflowY: "auto",
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="h6" gutterBottom textAlign="center">
              {t("notMemberOfGroupMessage", "You are not a member of this group.")}
            </Typography>
            <Typography variant="subtitle1" gutterBottom textAlign="center">
              {t("groupNameLabel", "Group Name: {{groupName}}", { groupName: selectedConversation?.groupName })}
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              textAlign="center"
              sx={{ mt: 2 }}
            >
              {t("groupMembersLabel", "Members:")}
            </Typography>
            <GroupMemberList members={selectedConversation?.members} t={t}/>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleJoinGroup}
                disabled={isJoiningGroup || !socket}
                sx={{ minWidth: '130px' }}
              >
                {isJoiningGroup ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  t("Join Group") 
                )}
              </Button>
              {!socket && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  {t("connectionNotAvailableError", "Connection not available.")}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      ) : isChatContentVisible ? (
        <Paper
          elevation={0}
          sx={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "background.paper",
            overflow: "hidden",
            boxShadow: theme.shadows[3],
            borderRadius: 2,
          }}
        >
          <ChatBoxHeader
            chatType={chatType}
            chatTitle={chatTitle}
            selectedFriend={selectedFriend}
            selectedConversation={selectedConversation}
            currentUser={currentUser}
            t={t}
          />
          <ChatMessageList
            messages={messages}
            currentUser={currentUser}
            isLoadingHistory={isLoadingHistory}
            selectedConversation={selectedConversation}
            loadMoreMessages={loadMoreMessages}
            hasMore={hasMore}
            isLoadingMore={isLoadingMore}
            t={t}
          />
          <ChatInput
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            isMessagingLoading={isMessagingLoading}
            t={t}
          />
        </Paper>
      ) : (
        isPlaceholderVisible && (
          <Paper
            elevation={0}
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              bgcolor: "background.paper",
              borderRadius: 2,
              boxShadow: theme.shadows[3],
              textAlign: "center",
            }}
          >
            <MessageIcon
              color="action"
              sx={{ fontSize: 60, mb: 2, color: "text.secondary" }}
            />
            <Typography variant="subtitle1" color="textSecondary">
              {t("selectChatPlaceholder", "Select a chat to start messaging")}
            </Typography>
          </Paper>
        )
      )}

      <MessageModal
        open={isMessageModalOpen}
        onClose={handleCloseModal}
        message={modalConfig.message}
        severity={modalConfig.severity}
        title={modalConfig.title}
      />
    </Box>
  );
};

export default ChatBox;