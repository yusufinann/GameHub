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
import { useTranslation } from 'react-i18next';
function CommunityPage() {
  const {
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleSnackbarClose,
  } = useSnackbar();

  const { currentUser } = useAuthContext();
  const{t}=useTranslation();
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
    maxMembers, 
    setMaxMembers, 
    joinGroupRequiresPassword
  } = useGroupDialog();

  const handleCommunitySelect = () => {
      handleGroupSelect(null); 
  };

  const translatedChatTitle = selectedGroup
  ? selectedGroup.groupName // Group names are usually dynamic and don't need translation
  : t("globalCommunityTitle");
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
        maxMembers={maxMembers}
        setMaxMembers={setMaxMembers} 
        t={t}
      />

      <JoinGroupDialog
        open={joinGroupDialogOpen}
        onClose={handleJoinGroupDialogClose}
        joinPassword={joinPassword}
        setJoinPassword={setJoinPassword}
        handleJoinGroup={handleJoinGroup}
        requiresPassword={joinGroupRequiresPassword} 
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
            flexShrink: 0, 
          }}
        >
          <ForumIcon sx={{ color: " #fd5959", mr: 1 }} />
          <Typography variant="h6" component="div">
            {t("COMMUNITY")}
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
            t={t}
          />
          <ChatBox
            chatType={selectedGroup ? "group" : "community"}
            chatTitle={translatedChatTitle}
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