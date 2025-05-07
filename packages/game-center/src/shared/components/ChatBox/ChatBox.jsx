// ChatBox.jsx
import React, { useState } from "react";
import { Box, Paper, Typography, Button, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatBoxHeader from "./ChatBoxHeader";
import ChatMessageList from "./ChatMessageList";
import ChatInput from "./ChatInput";
import { Message as MessageIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import ErrorModal from "../ErrorModal";
import { useWebSocket } from "../../context/WebSocketContext/context";
import GroupMemberList from "./GroupMemberList";
import { useTranslation } from "react-i18next";

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
  const{t}=useTranslation();
  const { socket } = useWebSocket();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isJoiningGroup, setIsJoiningGroup] = useState(false);
  const { groupId } = useParams();
  const navigate = useNavigate();

  let isMember = true;
  if (chatType === "friendGroup" && selectedConversation) {
    isMember = selectedConversation.members?.some(
      (member) => member._id === currentUser.id
    );
  }
  const handleJoinGroup = () => {
    if (isJoiningGroup || !socket) return;

    setIsJoiningGroup(true); 
    try {
      const messagePayload = {
        type: "ACCEPT_FRIEND_GROUP_INVITATION_WS",
        acceptedGroupId: groupId,
      };
      socket.send(JSON.stringify(messagePayload));
      navigate(`/conversation/all/friend-group/${groupId}`);
    } catch (error) {
      console.error("Error sending join group message:", error);
      setErrorMessage("Failed to send join request. Please try again.");
      setIsJoiningGroup(false); 
    }
  };

  const isJoinGroupViewVisible = chatType === "friendGroup" && !isMember;
  const isChatContentVisible =
    !isJoinGroupViewVisible &&
    (chatType === "community" ||
      chatType === "group" ||
      selectedFriend ||
      (chatType === "friendGroup" && isMember));
  const isPlaceholderVisible = !isJoinGroupViewVisible && !isChatContentVisible;

  const handleCloseModal = () => {
    setErrorMessage(null);
  };

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
      {isJoinGroupViewVisible && selectedConversation ? (
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
            chatTitle={selectedConversation?.groupName || t("groupFallbackTitle")}
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
            {t("notMemberOfGroupMessage")}
            </Typography>
            <Typography variant="subtitle1" gutterBottom textAlign="center">
            {t("groupNameLabel", { groupName: selectedConversation?.groupName })}
            </Typography>
            <Typography
              variant="body2"
              gutterBottom
              textAlign="center"
              sx={{ mt: 2 }}
            >
               {t("groupMembersLabel")}
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
                  t("joinGroupButtonLabel")
                )}
              </Button>
              {!socket && ( 
                 <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                    {t("connectionNotAvailableError")}
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
            {t("selectChatPlaceholder")}
            </Typography>
          </Paper>
        )
      )}

      <ErrorModal
        open={Boolean(errorMessage)}
        onClose={handleCloseModal}
        errorMessage={errorMessage}
      />
    </Box>
  );
};

export default ChatBox;
