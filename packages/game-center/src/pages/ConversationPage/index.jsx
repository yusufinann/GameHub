import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Snackbar, Alert, Typography } from "@mui/material";
import { Group as GroupIcon } from "@mui/icons-material";
import ConversationList from "./components/ConversationList";
import CreateFriendGroupDialog from "./components/CreateFriendGroupDialog";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useFriendGroupDialog } from "./components/useFriendGroupDialog";
import { useConversationsPage } from "./useConversationPage";
import { useParams, useLocation } from "react-router-dom";
import { useWebSocket } from "../../shared/context/WebSocketContext/context";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import ChatBox from "../../shared/components/ChatBox/ChatBox";
import { useFriendsContext } from "../../shared/context/FriendsContext/context";
import ErrorModal from "../../shared/components/ErrorModal";
import UpdateFriendGroupDialog from "./components/UpdateFriendGroup";
import { useTranslation } from "react-i18next";

function ConversationPage() {
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
    showSnackbar,
  } = useSnackbar();
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [friendGroups, setFriendGroups] = useState([]);
  const { friendId, groupId } = useParams();
  const { socket } = useWebSocket();
  const { friends, incomingRequests } = useFriendsContext();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(2); // Default to friend groups tab

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
  } = useFriendGroupDialog(friendGroups, setFriendGroups);

  const {
    messages,
    newMessage,
    isMessagingLoading,
    selectedFriend,
    setSelectedFriend,
    handleSendFriendMessage,
    handleFriendSelection,
    setNewMessage,
    handleFriendGroupSelection,
    handleDeleteFriendGroup,
    handleLeaveFriendGroup,
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
  } = useConversationsPage(
    friendGroups,
    setFriendGroups,
    selectedConversation,
    setSelectedConversation
  );

  // Set the appropriate tab based on URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/friend/')) {
      setActiveTab(1); // Set to friends tab
    } else if (path.includes('/friend-group/')) {
      setActiveTab(2); // Set to friend groups tab
    } else if (path.endsWith('/conversation/all')) {
      setActiveTab(0); // Set to all tab
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleMessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        console.error("WebSocket mesajı parse edilirken hata:", err);
        return;
      }

      if (data.type === "USER_JOINED_FRIEND_GROUP") {
        const { groupId: joinedGroupId, group } = data.data;

        setFriendGroups((prevGroups) => {
          const existingGroups = prevGroups.filter(
            (g) => g._id !== joinedGroupId
          );
          return [...existingGroups, group];
        });
        showSnackbar(
          `Gruba başarıyla katıldınız: ${group.groupName}`,
          "success"
        );
      }
      if (data.type === "ERROR") {
        // Show error modal instead of snackbar for errors
        setErrorMessage(data.message);
        setErrorModalOpen(true);
        return;
      }
    };

    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, currentUser, setFriendGroups, showSnackbar]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:3001/api/chat/friendgroup/${groupId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;

        if (data.group) {
          setSelectedConversation({
            ...data.group,
            type: "friendGroup",
          });
        } else {
          console.warn("Grup bilgisi alınamadı:", groupId);
        }
      } catch (error) {
        console.error(
          `Grup bilgisi alınamadı (ID: ${groupId})`,
          error.response?.data || error.message
        );
      }
    };

    if (friendId) {
      const friendConversation = friends.find((f) => f.id === friendId);
      if (friendConversation) {
        setSelectedConversation({
          ...friendConversation,
          type: "private",
        });
        setSelectedFriend(friendConversation);
      } else {
        console.warn("Arkadaş bilgisi bulunamadı:", friendId);
      }
    } else if (groupId) {
      const groupConversation = friendGroups.find((g) => g._id === groupId);
      if (groupConversation) {
        setSelectedConversation({
          ...groupConversation,
          type: "friendGroup",
        });
      } else {
        fetchGroupDetails();
      }
    } else {
      setSelectedConversation(null);
    }
  }, [friendId, groupId, friendGroups, friends, setSelectedConversation, setSelectedFriend]);

  useEffect(() => {
    if (selectedFriend) {
      const updatedFriend = friends.find((f) => f.id === selectedFriend.id);
      if (updatedFriend) {
        setSelectedFriend(updatedFriend);
      }
    }
  }, [friends, selectedFriend, setSelectedFriend]);

  const handleErrorModalClose = () => {
    setErrorModalOpen(false);
  };
  
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
      {/* Snackbar Notification */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
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
      <ErrorModal
        open={errorModalOpen}
        onClose={handleErrorModalClose}
        errorMessage={errorMessage}
      />

      {/* Create Friend Group Dialog */}
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

      {/* Main Content */}
      <Box
        sx={{
          overflow: "hidden",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
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

        {/* Content */}
        <Box
          sx={{
            p: 0,
            display: "flex",
            height: "100%",
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
              if (item?.type === "friendGroup") {
                handleFriendGroupSelection(item);
              } else {
                handleFriendSelection(item);
              }
            }}
            onCreateFriendGroupDialogOpen={handleCreateFriendGroupDialogOpen}
            friendGroupsLoading={friendGroupsLoading}
            friendGroups={friendGroups}
            fetchFriendGroups={fetchFriendGroups}
            onDeleteFriendGroup={handleDeleteFriendGroup}
            handleLeaveFriendGroup={handleLeaveFriendGroup}
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
            setSelectedConversation={setSelectedConversation}
            chatTitle={
              selectedConversation
                ? selectedConversation.type === "friendGroup"
                  ? selectedConversation.groupName
                  : selectedFriend
                  ? selectedFriend.name
                  : "Select a friend"
                : "Select a friend or group"
            }
            messages={messages}
            newMessage={newMessage}
            handleSendMessage={handleSendFriendMessage}
            setNewMessage={setNewMessage}
            isMessagingLoading={isMessagingLoading}
            selectedFriend={selectedFriend}
            isLoadingHistory={isLoadingChat}
            currentUser={currentUser}
            setFriendGroups={setFriendGroups}
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