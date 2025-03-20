

// CommunityList.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Button,
  Tooltip,
  Badge,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Public as PublicIcon,
  Group as GroupIcon,
  Add as AddIcon,
  ExitToApp as LeaveGroupIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    backgroundColor: '#fd5959',
    color: 'white',
  },
}));

const CommunityList = ({
  onCommunitySelect,
  onGroupSelect,
  groups, 
  allGroups, 
  onCreateGroupDialogOpen,
  onJoinGroupDialogOpen,
  onLeaveGroup,
  isGroupListLoading
}) => {
  const [activeItem, setActiveItem] = useState('global');
  const [joinableGroups, setJoinableGroups] = useState([]); // State for groups user can join

  useEffect(() => {
    if (allGroups && groups) {
      // Grupları filtrele: Kullanıcının üye olmadığı ve şifresiz veya şifreli olup katılınabilir olan gruplar
      const filteredGroups = allGroups.filter(group => {
        const isMember = groups.some(userGroup => userGroup._id === group._id);
        return !isMember; // Kullanıcının üyesi olmadığı grupları filtrele
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

  const handleJoinGroupClick = (groupId) => {
    onJoinGroupDialogOpen(groupId); 
  };

  const handleLeaveGroupClick = (groupId) => {
    onLeaveGroup(groupId);
    setActiveItem('global');
    onCommunitySelect({ id: 'global', name: 'Global Community' }); 
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
        mt:1
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Communities
        </Typography>
      </Box>

      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        {/* Global Community */}
        <List disablePadding>
          <ListItem
            button
            onClick={() => handleSelectCommunity('global')}
            selected={activeItem === 'global'}
            sx={{
              py: 1.5,
              backgroundColor: activeItem === 'global' ? 'rgba(253, 89, 89, 0.1)' : 'transparent',
              '&:hover': { backgroundColor: 'rgba(253, 89, 89, 0.05)' }
            }}
          >
            <ListItemIcon>
              <Avatar sx={{ bgcolor: '#fd5959' }}>
                <PublicIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary="Global Community"
              secondary="All members"
              primaryTypographyProps={{ fontWeight: activeItem === 'global' ? 'bold' : 'normal' }}
            />
            <StyledBadge badgeContent={25} max={99} />
          </ListItem>
        </List>

        <Divider sx={{ my: 1.5 }} />

        {/* Group Title with Add Button */}
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            MY GROUPS
          </Typography>
          <Tooltip title="Create new group">
            <IconButton size="small" sx={{ color: '#fd5959' }} onClick={onCreateGroupDialogOpen}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Group List */}
        <List disablePadding>
          {isGroupListLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            groups && groups.map((group) => (
              <ListItem
                key={group._id}
                button
                onClick={() => handleSelectCommunity(group._id)}
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
                  primary={group.groupName}
                  secondary={`${group.members.length} members`}
                  primaryTypographyProps={{ fontWeight: activeItem === group._id ? 'bold' : 'normal' }}
                />
                <Tooltip title="Leave Group">
                  <IconButton
                    size="small"
                    sx={{ ml: 1, color: 'grey' }}
                    onClick={(e) => {
                      e.stopPropagation(); 
                      handleLeaveGroupClick(group._id);
                    }}
                  >
                    <LeaveGroupIcon />
                  </IconButton>
                </Tooltip>
              </ListItem>
            ))
          )}
        </List>

        <Divider sx={{ my: 1.5 }} />
         {/* Joinable Groups Title */}
         <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
            JOIN GROUPS
          </Typography>
        </Box>
        {/* Joinable Groups List */}
        <List disablePadding>
        {isGroupListLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
          joinableGroups.map((group) => (
            <ListItem
              key={group._id}
              button
            //onClick={() => handleSelectCommunity(group._id)} 
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
                primary={group.groupName}
                secondary={`${group.members.length} members`}
                primaryTypographyProps={{ fontWeight: activeItem === group._id ? 'bold' : 'normal' }}
              />
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); 
                  handleJoinGroupClick(group._id); 
                }}
              >
                Join
              </Button>
            </ListItem>
          ))
          )}
        </List>
      </Box>
    </Box>
  );
};

export default CommunityList;