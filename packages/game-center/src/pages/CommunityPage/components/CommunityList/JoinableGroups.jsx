import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import { Group as GroupIcon, Lock as LockIcon } from '@mui/icons-material';

const JoinableGroups = ({
  joinableGroups,
  joinableGroupSearch,
  setJoinableGroupSearch,
  activeItem,
  onJoinGroupDialogOpen,
  isGroupListLoading,
}) => {
  const filteredJoinableGroups = joinableGroups?.filter(group =>
    group.groupName.toLowerCase().includes(joinableGroupSearch.toLowerCase())
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
        <Box sx={{ fontWeight: 'bold', color: 'text.secondary' }}>JOIN GROUPS</Box>
        <TextField
          value={joinableGroupSearch}
          onChange={(e) => setJoinableGroupSearch(e.target.value)}
          placeholder="Search..."
          size="small"
          variant="outlined"
        />
      </Box>
      <List disablePadding>
        {isGroupListLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          filteredJoinableGroups.map((group) => (
            <ListItem
              key={group._id}
              button
              selected={activeItem === group._id}
              sx={{
                py: 1.5,
                backgroundColor: activeItem === group._id ? 'rgba(253, 89, 89, 0.1)' : 'transparent',
                '&:hover': { backgroundColor: 'rgba(253, 89, 89, 0.05)' },
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
                    {group.hasPassword && (
                      <LockIcon 
                        sx={{ 
                          ml: 1, 
                          fontSize: 16,
                          color: 'text.secondary'
                        }} 
                      />
                    )}
                  </Box>
                }
                secondary={`${group.members.length}/${group.maxMembers || '∞'} members`}
                primaryTypographyProps={{ fontWeight: activeItem === group._id ? 'bold' : 'normal' }}
              />
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoinGroupDialogOpen(group._id, group.hasPassword);
                }}
              >
                Join
              </Button>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default JoinableGroups;