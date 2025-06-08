import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Tooltip,
  Chip,
} from '@mui/material';
import { Group as GroupIcon, Add as AddIcon, ExitToApp as LeaveGroupIcon, Delete as DeleteGroupIcon, Star as HostIcon } from '@mui/icons-material';

const MyGroups = ({
  groups,
  myGroupSearch,
  setMyGroupSearch,
  activeItem,
  onSelectCommunity,
  onCreateGroupDialogOpen,
  onLeaveGroup,
  onDeleteGroupClick,
  currentUser,
  isGroupListLoading,
  isGroupDeleting,
  t 
}) => {
  const filteredMyGroups = groups?.filter(group =>
    group.groupName.toLowerCase().includes(myGroupSearch.toLowerCase())
  );
  return (
    <Box>
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ fontWeight: 'bold', color: 'text.secondary' }}>
          {t('myGroupsTitle')}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            value={myGroupSearch}
            onChange={(e) => setMyGroupSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            size="small"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Tooltip title={t('createNewGroupTooltip')}>
            <IconButton size="small" sx={{ color: '#fd5959' }} onClick={onCreateGroupDialogOpen}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <List disablePadding>
        {isGroupListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          filteredMyGroups?.map((group) => (
            <ListItem
              key={group._id}
              button
              onClick={() => onSelectCommunity(group._id)}
              selected={activeItem === group._id}
              sx={{
                py: 1.5,
                backgroundColor: activeItem === group._id ? 'rgba(253, 89, 89, 0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(253, 89, 89, 0.05)' }
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ bgcolor: '#f0f0f0', color: '#555' }}>
                  <GroupIcon />
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {group.groupName}
                    {group.host._id === currentUser?.id && (
                      <Chip
                        icon={<HostIcon />}
                        label={t('hostChipLabel')}
                        size="small"
                        sx={{
                          ml: 1,
                          fontWeight: 'bold',
                          color: '#fd5959',
                          borderColor: '#fd5959',
                          backgroundColor: 'transparent'
                        }}
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={t('membersCountLabel', { count: group.members.length, max: group.maxMembers || '∞' })}
                primaryTypographyProps={{ fontWeight: activeItem === group._id ? 'bold' : 'normal' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Tooltip title={t('leaveGroupTooltip')}>
                  <IconButton
                    size="small"
                    sx={{ ml: 1, color: 'grey' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeaveGroup(group._id);
                    }}
                  >
                    <LeaveGroupIcon />
                  </IconButton>
                </Tooltip>
                {group.host._id === currentUser?.id && (
                  <Tooltip title={t('deleteGroupTooltip')}>
                    <IconButton
                      size="small"
                      sx={{ ml: 1, color: 'error' }} // Consider theme.palette.error.main
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroupClick(group._id);
                      }}
                      disabled={isGroupDeleting}
                    >
                      {isGroupDeleting ? (
                        <CircularProgress color="inherit" size="1.5rem" />
                      ) : (
                        <DeleteGroupIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default MyGroups;