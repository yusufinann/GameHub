// FriendGroupList.jsx
import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Box,
  ListItemText,
  Typography,
  useTheme,
  ListItemIcon,
  IconButton,
  Menu, MenuItem,
} from "@mui/material";
import {
  People as PeopleIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ExitToApp as ExitToAppIcon, 
} from "@mui/icons-material";
import { useAuthContext } from "../../../shared/context/AuthContext";

const FriendGroupList = ({
  friendGroups,
  friendGroupsLoading,
  selectedConversation,
  onFriendGroupSelect,
  onDeleteFriendGroup,
  onLeaveFriendGroup 
}) => {
  const theme = useTheme();
  const { currentUser } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroupIdForMenu, setSelectedGroupIdForMenu] = useState(null);

  const handleMenuOpen = (event, groupId) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroupIdForMenu(groupId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedGroupIdForMenu(null);
  };

  const handleDeleteClick = () => {
    if (selectedGroupIdForMenu) {
      onDeleteFriendGroup(selectedGroupIdForMenu);
    }
    handleMenuClose();
  };

  const handleLeaveGroupClick = () => { 
    if (selectedGroupIdForMenu) {
      onLeaveFriendGroup(selectedGroupIdForMenu);
    }
    handleMenuClose();
  };

  return (
    <List>
      {friendGroupsLoading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 3,
          }}
        >
          <Typography variant="body1" align="center" color="textSecondary">
            Loading Friend Groups...
          </Typography>
        </Box>
      )}
      {!friendGroupsLoading && friendGroups.map((friendGroup) => (
        <ListItem
          button
          key={friendGroup._id}
          selected={selectedConversation?._id === friendGroup._id}
          onClick={() => onFriendGroupSelect(friendGroup)}
          secondaryAction={
            <IconButton edge="end" aria-label="options" onClick={(event) => handleMenuOpen(event, friendGroup._id)}>
              <MoreVertIcon />
            </IconButton>
          }
          sx={{
            mb: 1,
            borderRadius: 2,
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
              transform: "translateY(-2px)",
              boxShadow: 1,
            },
            "&.Mui-selected": {
              backgroundColor: theme.palette.warning.lighter,
              "&:hover": {
                backgroundColor: theme.palette.warning.light,
              },
            },
          }}
        >
          <ListItemAvatar>
            <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
              <PeopleIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center">
                <Typography variant="subtitle1" fontWeight="medium">
                  {friendGroup.groupName}
                </Typography>
                {friendGroup.host === currentUser.id && (
                  <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                    <StarIcon color="warning" fontSize="small" />
                  </ListItemIcon>
                )}
              </Box>
            }
            secondary={
              <Typography variant="body2">
                {friendGroup.description || "Friend Group Chat"}
              </Typography>
            }
          />
        </ListItem>
      ))}
      {!friendGroupsLoading && friendGroups.length === 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 3,
            color: theme.palette.text.secondary
          }}
        >
          <PeopleIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
          <Typography variant="body1" align="center">
            No friend groups yet.
          </Typography>
          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Create a friend group to chat with your friends.
          </Typography>
        </Box>
      )}
      <Menu
        id="friend-group-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {/* Delete Menu Item - Only for Host */}
        <MenuItem onClick={handleDeleteClick} disabled={!selectedGroupIdForMenu || friendGroups.find(group => group._id === selectedGroupIdForMenu)?.host !== currentUser.id}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Delete Group</Typography>
        </MenuItem>
        {/* Leave Group Menu Item - For Members (not host) */}
        <MenuItem onClick={handleLeaveGroupClick} >
          <ListItemIcon>
            <ExitToAppIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Leave Group</Typography>
        </MenuItem>
      </Menu>
    </List>
  );
};

export default FriendGroupList;