// CommunityPage.jsx
import React from "react";
import { Box, Snackbar, Alert, Typography } from "@mui/material";
import { Forum as ForumIcon } from "@mui/icons-material";
import ChatBox from "../../shared/ChatBox/ChatBox";
import CommunityList from "./components/CommunityList/CommunityList";
import { CreateGroupDialog, JoinGroupDialog } from "./components/Dialogs";
import { useCommunityPage } from "./useCommunityPage";
import { useGroupDialog } from "./components/useGroupDialog";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useSnackbar } from "../../shared/context/SnackbarContext";

function CommunityPage() {
  // Snackbar state
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
  } = useSnackbar();

  const { currentUser } = useAuthContext();

  // Community  state and handlers
  const {
    communityMessages,
    newCommunityMessage,
    isCommunityMessagingLoading,
    isLoadingCommunityChat,
    communityGroups,
    allGroups,
    isGroupListLoading,
    selectedGroup,
    groupMessages,
    newGroupMessage,
    isGroupMessagingLoading,
    isLoadingGroupChat,
    isGroupDeleting,
    handleSendCommunityMessage,
    handleSendGroupMessage,
    handleGroupSelect,
    fetchCommunityChatHistory,
    handleLeaveGroup,
    handleDeleteGroup,
    setNewCommunityMessage,
    setNewGroupMessage,
  } = useCommunityPage();

  // Group dialog state and handlers (for community groups - lobby groups)
  const {
    createGroupDialogOpen,
    joinGroupDialogOpen,
    newGroupName,
    newGroupDescription,
    isPasswordProtected,
    newGroupPassword,
    joinPassword,
    handleCreateGroupDialogOpen,
    handleCreateGroupDialogClose,
    handleJoinGroupDialogOpen,
    handleJoinGroupDialogClose,
    handleCreateGroup,
    handleJoinGroup,
    setNewGroupName,
    setNewGroupDescription,
    setIsPasswordProtected,
    setNewGroupPassword,
    setJoinPassword,
  } = useGroupDialog();

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

      {/* Community Group Dialogs*/}
      <CreateGroupDialog
        open={createGroupDialogOpen}
        onClose={handleCreateGroupDialogClose}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        newGroupDescription={newGroupDescription}
        setNewGroupDescription={setNewGroupDescription}
        isPasswordProtected={isPasswordProtected}
        setIsPasswordProtected={setIsPasswordProtected}
        newGroupPassword={newGroupPassword}
        setNewGroupPassword={setNewGroupPassword}
        handleCreateGroup={handleCreateGroup}
      />

      <JoinGroupDialog
        open={joinGroupDialogOpen}
        onClose={handleJoinGroupDialogClose}
        joinPassword={joinPassword}
        setJoinPassword={setJoinPassword}
        handleJoinGroup={handleJoinGroup}
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
        {/* Community Header */}
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
          <ForumIcon sx={{ color: " #fd5959", mr: 1 }} />
          <Typography variant="h6" component="div">
            COMMUNITY
          </Typography>
        </Box>

        {/* COMMUNITY Content */}
        <Box
          sx={{
            p: 0,
            display: "flex",
            height: "100%",
            overflow: "hidden",
            flexDirection: "row",
            gap: 1,
          }}
        >
          <CommunityList
            onCommunitySelect={() => {
              handleGroupSelect(null);
              fetchCommunityChatHistory();
            }}
            onGroupSelect={handleGroupSelect}
            groups={communityGroups}
            allGroups={allGroups}
            onCreateGroupDialogOpen={handleCreateGroupDialogOpen}
            onJoinGroupDialogOpen={handleJoinGroupDialogOpen}
            onLeaveGroup={handleLeaveGroup}
            onDeleteGroup={handleDeleteGroup}
            isGroupListLoading={isGroupListLoading}
            isGroupDeleting={isGroupDeleting} 
            currentUser={currentUser}
          />
          <ChatBox
            chatType={selectedGroup ? "group" : "community"}
            chatTitle={
              selectedGroup ? selectedGroup.groupName : "Global Community"
            }
            selectedConversation={selectedGroup}
            messages={selectedGroup ? groupMessages : communityMessages}
            newMessage={selectedGroup ? newGroupMessage : newCommunityMessage}
            handleSendMessage={
              selectedGroup
                ? handleSendGroupMessage
                : handleSendCommunityMessage
            }
            setNewMessage={
              selectedGroup ? setNewGroupMessage : setNewCommunityMessage
            }
            isMessagingLoading={
              selectedGroup
                ? isGroupMessagingLoading
                : isCommunityMessagingLoading
            }
            isLoadingHistory={
              selectedGroup ? isLoadingGroupChat : isLoadingCommunityChat
            }
            currentUser={currentUser}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default CommunityPage;