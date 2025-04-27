import React from "react";
import { Box, Snackbar, Alert, Typography } from "@mui/material";
import { Forum as ForumIcon } from "@mui/icons-material";
import CommunityList from "./components/CommunityList/CommunityList";
import { CreateGroupDialog, JoinGroupDialog } from "./components/Dialogs";
import { useCommunityPage } from "./useCommunityPage";
import { useGroupDialog } from "./components/useGroupDialog";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import ChatBox from "../../shared/components/ChatBox/ChatBox"; 

function CommunityPage() {
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
  } = useSnackbar();

  const { currentUser } = useAuthContext();

  const {
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
    isGroupDeleting,
    handleSendGroupMessage,
    handleGroupSelect,
    handleLeaveGroup,
    handleDeleteGroup,
    hasMoreGroup,           
    loadMoreMessages,     
    isLoadingMoreMessages,  
    // currentUser is also returned, but we get it from AuthContext directly here
  } = useCommunityPage();

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
    maxMembers, // <-- Receive prop
    setMaxMembers, // <-- Receive prop
    joinGroupRequiresPassword
  } = useGroupDialog();

  const handleCommunitySelect = () => {
      handleGroupSelect(null); // Deselect any active group
      //setCommunityPage(1);
      //setHasMoreCommunity(false); // Reset hasMoreCommunity when selecting the community
      // No need to call fetchCommunityChatHistory here,
      // useCommunityPage handles initial load and selection changes internally now.
      // If you need an explicit refresh button, you could call fetchCommunityChatHistory(1).
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
        maxMembers={maxMembers} // <-- Receive prop
        setMaxMembers={setMaxMembers} // <-- Receive prop
      />

      <JoinGroupDialog
        open={joinGroupDialogOpen}
        onClose={handleJoinGroupDialogClose}
        joinPassword={joinPassword}
        setJoinPassword={setJoinPassword}
        handleJoinGroup={handleJoinGroup}
        requiresPassword={joinGroupRequiresPassword} // <-- Pass the prop to
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
            flexShrink: 0, 
          }}
        >
          <ForumIcon sx={{ color: " #fd5959", mr: 1 }} />
          <Typography variant="h6" component="div">
            COMMUNITY
          </Typography>
        </Box>
        <Box
          sx={{
            p: 0,
            display: "flex",
            flexGrow: 1, 
            height: "calc(100% - 73px)", 
            overflow: "hidden", 
            flexDirection: "row",
            gap: 1,
          }}
        >
          <CommunityList
            onCommunitySelect={handleCommunitySelect}
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
            selectedGroupId={selectedGroup?._id} 
          />
          <ChatBox
            chatType={selectedGroup ? "group" : "community"}
            chatTitle={selectedGroup ? selectedGroup.groupName : "Global Community"}
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
            loadMoreMessages={loadMoreMessages} 
            hasMore={selectedGroup ? hasMoreGroup : hasMoreCommunity} 
            isLoadingMore={isLoadingMoreMessages}
          />
        </Box>
      </Box>
    </Box>
  );
}

export default CommunityPage;