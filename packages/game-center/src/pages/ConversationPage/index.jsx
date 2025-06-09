import React, { useEffect, useState, useCallback } from "react";
import { Box, Snackbar, Alert, Typography } from "@mui/material";
import { Group as GroupIcon } from "@mui/icons-material";
import ConversationList from "./components/ConversationList";
import CreateFriendGroupDialog from "./components/CreateFriendGroupDialog";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useFriendGroupDialog } from "./components/useFriendGroupDialog";
import { useConversationsPage } from "./useConversationPage";
import { useNavigate } from "react-router-dom";
import { useSnackbar as useAppSnackbar } from "../../shared/context/SnackbarContext";
import ChatBox from "../../shared/components/ChatBox/ChatBox";
import { useFriendsContext } from "../../shared/context/FriendsContext/context";
import MessageModal from "../../shared/components/MessageModal";
import UpdateFriendGroupDialog from "./components/UpdateFriendGroup";
import { useTranslation } from "react-i18next";
import { useConversationSocket, useConversationUrlHandler } from "./useConversationSocket";

function ConversationPage() {
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    showSnackbar,
  } = useAppSnackbar();
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [friendGroups, setFriendGroups] = useState(null);
  
  const { friends, incomingRequests} = useFriendsContext();
  const navigate = useNavigate(); 

  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    message: "",
    severity: "error",
    title: undefined,
  });

  const {
    createFriendGroupDialogOpen,
    newFriendGroupName,
    newFriendGroupDescription,
    friendGroupPassword,
    handleCreateFriendGroupDialogOpen,
    handleCreateFriendGroupDialogClose,
    handleCreateFriendGroup,
    setNewFriendGroupName,
    setNewFriendGroupDescription,
    setFriendGroupPassword,
    fetchFriendGroups,
    friendGroupsLoading,
  } = useFriendGroupDialog(setFriendGroups, showSnackbar, t);

  const {
    messages,
    newMessage,
    isMessagingLoading,
    selectedFriend,
    setSelectedFriend,
    handleSendFriendMessage,
    setNewMessage,
    loadMoreMessages,
    hasMoreFriend,
    hasMorePrivate,
    isLoadingChat,
    isLoadingMore,
    isUpdateDialogOpen,
    groupToUpdate,
    openUpdateDialog,
    closeUpdateDialog,
    handleUpdateFriendGroup,
    handleDeleteFriendGroup: hookHandleDeleteFriendGroup,
    handleLeaveFriendGroup: hookHandleLeaveFriendGroup,
  } = useConversationsPage(
    friendGroups,
    selectedConversation
  );

  const showMessageModal = useCallback(
    (message, severity = "error", title = undefined) => {
      setModalConfig({ message, severity, title });
      setIsMessageModalOpen(true);
    },
    []
  );

  const handleMessageModalClose = () => {
    setIsMessageModalOpen(false);
  };


  useConversationSocket({
    setFriendGroups,
    selectedConversation,
    setSelectedConversation,
    friendGroups,
  });


  const { activeTab } = useConversationUrlHandler({
    friends,
    friendGroups,
    setSelectedConversation,
    setSelectedFriend,
    setFriendGroups,
    showMessageModal,
  });

  useEffect(() => {
    fetchFriendGroups();
  }, [fetchFriendGroups]);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <MessageModal
        open={isMessageModalOpen}
        onClose={handleMessageModalClose}
        message={modalConfig.message}
        severity={modalConfig.severity}
        title={modalConfig.title}
      />

      <CreateFriendGroupDialog
        open={createFriendGroupDialogOpen}
        onClose={handleCreateFriendGroupDialogClose}
        newFriendGroupName={newFriendGroupName}
        setNewFriendGroupName={setNewFriendGroupName}
        newFriendGroupDescription={newFriendGroupDescription}
        setNewFriendGroupDescription={setNewFriendGroupDescription}
        friendGroupPassword={friendGroupPassword}
        setFriendGroupPassword={setFriendGroupPassword}
        handleCreateFriendGroup={handleCreateFriendGroup}
        friends={friends}
        t={t}
      />

      <Box
        sx={{
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            padding: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <GroupIcon sx={{ color: "#fd5959", mr: 1 }} />
          <Typography variant="h6" component="div">
            {t("Conversations")}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 0,
            display: "flex",
            height: "calc(100% - 65px)",
            overflow: "hidden",
            gap: 1,
            flexDirection: "row",
          }}
        >
          <ConversationList
            sx={{ flex: 1, height: "100%" }}
            selectedConversation={selectedConversation}
            initialTabValue={activeTab}
            onFriendSelect={(item) => {
              if (item?.type === "friendGroup" && item._id) {
                navigate(`/conversation/all/friend-group/${item._id}`);
              } else if (item && item.id) {
                navigate(`/conversation/all/friend/${item.id}`);
              }
            }}
            onCreateFriendGroupDialogOpen={handleCreateFriendGroupDialogOpen}
            friendGroupsLoading={friendGroupsLoading}
            friendGroups={friendGroups}
            fetchFriendGroups={fetchFriendGroups}
            onDeleteFriendGroup={hookHandleDeleteFriendGroup}
            handleLeaveFriendGroup={hookHandleLeaveFriendGroup}
            friends={friends}
            incomingRequests={incomingRequests}
            onEditFriendGroup={openUpdateDialog}
            t={t}
          />

          <ChatBox
            sx={{ height: "100%" }}
            chatType={
              selectedConversation?.type === "friendGroup"
                ? "friendGroup"
                : "conversation"
            }
            selectedConversation={selectedConversation}
            chatTitle={
              selectedConversation
                ? selectedConversation.type === "friendGroup"
                  ? selectedConversation.groupName
                  : selectedConversation.name
                : t("chat.selectConversationToChat")
            }
            messages={messages}
            newMessage={newMessage}
            handleSendMessage={handleSendFriendMessage}
            setNewMessage={setNewMessage}
            isMessagingLoading={isMessagingLoading}
            selectedFriend={selectedFriend}
            isLoadingHistory={isLoadingChat}
            currentUser={currentUser}
            loadMoreMessages={loadMoreMessages}
            hasMore={
              selectedConversation?.type === "friendGroup"
                ? hasMoreFriend
                : hasMorePrivate
            }
            isLoadingMore={isLoadingMore}
          />
        </Box>
        <UpdateFriendGroupDialog
          open={isUpdateDialogOpen}
          onClose={closeUpdateDialog}
          group={groupToUpdate}
          onUpdate={handleUpdateFriendGroup}
          t={t}
        />
      </Box>
    </Box>
  );
}

export default ConversationPage;