// CommunityList.jsx
import React, { useState, useEffect } from 'react';
import { Box, List, Divider} from '@mui/material';
import Header from './Header';
import MyGroups from './MyGroups';
import JoinableGroups from './JoinableGroups';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const CommunityList = ({
  onCommunitySelect,
  onGroupSelect,
  groups,
  allGroups,
  onCreateGroupDialogOpen,
  onJoinGroupDialogOpen,
  onLeaveGroup,
  onDeleteGroup,
  isGroupListLoading,
  isGroupDeleting,
  currentUser 
}) => {
  const [activeItem, setActiveItem] = useState('global');
  const [joinableGroups, setJoinableGroups] = useState([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [groupToDeleteId, setGroupToDeleteId] = useState(null);
  const [myGroupSearch, setMyGroupSearch] = useState('');
  const [joinableGroupSearch, setJoinableGroupSearch] = useState('');

  useEffect(() => {
    if (allGroups && groups) {
      const filteredGroups = allGroups.filter(group => {
        const isMember = groups.some(userGroup => userGroup._id === group._id);
        return !isMember;
      });
      setJoinableGroups(filteredGroups);
    }
  }, [allGroups, groups]);

  const handleSelectCommunity = (communityId) => {
    setActiveItem(communityId);
    if (onCommunitySelect) {
      if (communityId === 'global') {
        onCommunitySelect({ id: 'global', name: 'Global Community' });
      } else {
        const group = groups.find(g => g._id === communityId) || allGroups.find(g => g._id === communityId);
        if (group) onCommunitySelect(group);
      }
    }
    if (communityId !== 'global' && onGroupSelect) {
      const group = groups.find(g => g._id === communityId) || allGroups.find(g => g._id === communityId);
      if (group) onGroupSelect(group);
    }
  };

  const handleLeaveGroupClick = (groupId) => {
    onLeaveGroup(groupId);
    setActiveItem('global');
    onCommunitySelect({ id: 'global', name: 'Global Community' });
  };

  const handleDeleteGroupClick = (groupId) => {
    setGroupToDeleteId(groupId);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteGroup = () => {
    if (groupToDeleteId) {
      onDeleteGroup(groupToDeleteId);
      setGroupToDeleteId(null);
    }
    setDeleteConfirmationOpen(false);
    setActiveItem('global');
    onCommunitySelect({ id: 'global', name: 'Global Community' });
  };

  const cancelDeleteGroup = () => {
    setDeleteConfirmationOpen(false);
    setGroupToDeleteId(null);
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "30%" },
        height: '100vh',
        backgroundColor: '#f5f5f5',
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        mt: 1
      }}
    >
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List disablePadding>
          <Header activeItem={activeItem} handleSelectCommunity={handleSelectCommunity} />
        </List>

        <Divider sx={{ my: 1.5 }} />

        {/* My Groups */}
        <MyGroups
          groups={groups}
          myGroupSearch={myGroupSearch}
          setMyGroupSearch={setMyGroupSearch}
          activeItem={activeItem}
          onSelectCommunity={handleSelectCommunity}
          onCreateGroupDialogOpen={onCreateGroupDialogOpen}
          onLeaveGroup={handleLeaveGroupClick}
          onDeleteGroupClick={handleDeleteGroupClick}
          currentUser={currentUser}
          isGroupListLoading={isGroupListLoading}
          isGroupDeleting={isGroupDeleting}
        />

        <Divider sx={{ my: 1.5 }} />

        {/* Joinable Groups */}
        <JoinableGroups
          joinableGroups={joinableGroups}
          joinableGroupSearch={joinableGroupSearch}
          setJoinableGroupSearch={setJoinableGroupSearch}
          activeItem={activeItem}
          onJoinGroupDialogOpen={onJoinGroupDialogOpen}
          isGroupListLoading={isGroupListLoading}
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteConfirmationOpen}
        onClose={cancelDeleteGroup}
        onConfirm={confirmDeleteGroup}
        isGroupDeleting={isGroupDeleting}
      />
    </Box>
  );
};

export default CommunityList;
