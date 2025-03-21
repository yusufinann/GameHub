// ConversationList.jsx
import React, { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Button,
  Box,
  ListItemText,
  Tabs,
  Tab,
  Divider,
  useTheme,
  Badge,
  IconButton,
  Toolbar
} from "@mui/material";
import {
  Add as AddIcon,
  Person as PersonIcon,
  Dashboard as DashboardIcon,
  Mail as MailIcon,
  FiberManualRecord as StatusIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import FriendGroupList from "./FriendGroupList";
import { useLocation, useNavigate } from "react-router-dom";

const ConversationList = ({
  onFriendSelect,
  onCreateFriendGroupDialogOpen, fetchFriendGroups, selectedConversation, onDeleteFriendGroup, handleLeaveFriendGroup, friends, incomingRequests, friendGroupsLoading, friendGroups
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(2);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (tabValue === 2) {
      fetchFriendGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabValue]);

  const handleTabChange = (event, newValue) => {
    console.log('Tab Value Changed:', newValue);
    setTabValue(newValue);

    let path = '/conversation/all';
    if (newValue === 1) {
      path += '/friend';
    } else if (newValue === 2) {
      path += '/friend-group';
    }

    navigate(path);


    setSelectedFriend(null);
    onFriendSelect(null);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/conversation/all')) {
      setTabValue(0);
    } else if (path.endsWith('/conversation/friend')) {
      setTabValue(1);
    } else if (path.endsWith('/conversation/friend-group')) {
      setTabValue(2);
    } else if (path.endsWith('/conversation')) {
      setTabValue(2);
    }
  }, [location.pathname]);
  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
    onFriendSelect(friend);
    navigate(`/conversation/all/friend/${friend.id}`);
  };

  const handleFriendGroupSelect = (friendGroup) => {
    onFriendSelect({
      ...friendGroup,
      type: 'friendGroup',
    });
    console.log("selected friend-group : ", friendGroup)
    navigate(`/conversation/all/friend-group/${friendGroup._id}`);
  };

  const tabColors = {
    all: theme.palette.primary.main,
    friends: theme.palette.success.main,
    friendGroups: theme.palette.warning.main,
  };

  const renderFriendStatus = (friend) => {
    const isOnline = friend.isOnline;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <StatusIcon
          sx={{
            fontSize: 12,
            mr: 0.5,
            color: isOnline ? theme.palette.success.main : theme.palette.grey
          }}
        />
        <Typography variant="body2">
          {isOnline ? 'Online' : 'Offline'}
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: { xs: "100%", md: "30%" },
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        mt: 1,
      }}
    >
      <Paper elevation={3} sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
        <Toolbar sx={{ justifyContent: "space-between", p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme.palette.primary.main
            }}
          >
            {tabValue === 0 && "All"}
            {tabValue === 1 && "Friends"}
            {tabValue === 2 && "Friend Groups"}
          </Typography>

          {tabValue === 2 ? (
            <Button
              variant="contained"
              color="warning"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 20 }}
              onClick={onCreateFriendGroupDialogOpen}
            >
              Create Group
            </Button>
          ) : (
            <Badge
              badgeContent={incomingRequests.length}
              color="error"
              sx={{ mr: 1 }}
            >
              <IconButton
                color="primary"
                aria-label="friend requests"
              >
                <MailIcon />
              </IconButton>
            </Badge>
          )}
        </Toolbar>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>


          {/* Friends Tab Content */}
          {tabValue === 1 && (
            <List>
              {friends.map((friend) => (
                <ListItem
                  button
                  key={friend.id}
                  selected={selectedFriend && selectedFriend.id === friend.id}
                  onClick={() => handleFriendSelect(friend)}
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
                      backgroundColor: theme.palette.success.lighter,
                      "&:hover": {
                        backgroundColor: theme.palette.success.light,
                      },
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: friend.isOnline ? theme.palette.success.main : theme.palette.grey[500],
                          boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                        },
                      }}
                    >
                      <Avatar
                        src={friend.profilePicture}
                        sx={{
                          bgcolor: friend.isOnline ? theme.palette.success.main : theme.palette.grey[400],
                          boxShadow: 2,
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle1" fontWeight="medium">
                        {friend.username || friend.name || `User-${friend.id}`}
                      </Typography>
                    }
                    secondary={renderFriendStatus(friend)}
                  />
                </ListItem>
              ))}

              {friends.length === 0 && tabValue === 1 && (
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
                  <PersonIcon sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }} />
                  <Typography variant="body1" align="center">
                    No friends yet.
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    Add friends to start chatting with them.
                  </Typography>
                </Box>
              )}
            </List>
          )}

          {/* Friend Groups Tab Content */}
          {tabValue === 2 && (
            <FriendGroupList
              friendGroups={friendGroups}
              friendGroupsLoading={friendGroupsLoading}
              selectedConversation={selectedConversation}
              onFriendGroupSelect={handleFriendGroupSelect}
              onDeleteFriendGroup={onDeleteFriendGroup}
              onLeaveFriendGroup={handleLeaveFriendGroup}
            />
          )}


          {/* All Tab Content (Friends + Friend Groups) */}
          {tabValue === 0 && (
            <List>

              {/* Friend Groups Section in All Tab */}
              <Typography
                variant="subtitle2"
                sx={{
                  pl: 2,
                  mb: 1,
                  color: theme.palette.warning.main,
                  fontWeight: "bold"
                }}
              >
                Friend Groups
              </Typography>
              <FriendGroupList
                friendGroups={friendGroups}
                friendGroupsLoading={friendGroupsLoading}
                selectedConversation={selectedConversation}
                onFriendGroupSelect={handleFriendGroupSelect}
                onDeleteFriendGroup={onDeleteFriendGroup}
                onLeaveFriendGroup={handleLeaveFriendGroup}
              />
              <Divider sx={{ my: 2 }} />


              {/* Friends Section in All Tab */}
              <Typography
                variant="subtitle2"
                sx={{
                  pl: 2,
                  mb: 1,
                  color: theme.palette.success.main,
                  fontWeight: "bold"
                }}
              >
                Friends
              </Typography>

              {friends.map((friend) => (
                <ListItem
                  button
                  key={`all-friend-${friend.id}`}
                  selected={selectedFriend && selectedFriend.id === friend.id}
                  onClick={() => handleFriendSelect(friend)}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                      transform: "translateY(-2px)",
                      boxShadow: 1,
                    },
                    "&.Mui-selected": {
                      backgroundColor: theme.palette.success.lighter,
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: friend.isOnline ? theme.palette.success.main : theme.palette.grey[500],
                          boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                        },
                      }}
                    >
                      <Avatar
                        src={friend.profilePicture}
                        sx={{
                          bgcolor: friend.isOnline ? theme.palette.success.main : theme.palette.grey[400],
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friend.username || friend.name || `User-${friend.id}`}
                    secondary={renderFriendStatus(friend)}
                  />
                </ListItem>
              ))}
              {friends.length === 0 && (
                <Box sx={{ pl: 3, pb: 2, color: theme.palette.text.secondary }}>
                  <Typography variant="body2" align="left">
                    No friends yet.
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Box>

        <Divider />

        {/* Bottom Tabs */}
        <Box sx={{ mt: "auto" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{
              "& .MuiTab-root": {
                minHeight: 64,
              },
            }}
          >
            <Tab
              icon={<DashboardIcon sx={{ color: tabColors.all }} />}
              label="All"
              sx={{
                fontWeight: tabValue === 0 ? "bold" : "normal",
                transition: "all 0.3s",
              }}
            />
            <Tab
              icon={
                <Badge badgeContent={incomingRequests.length} color="error">
                  <PersonIcon sx={{ color: tabColors.friends }} />
                </Badge>
              }
              label="Friends"
              sx={{
                fontWeight: tabValue === 1 ? "bold" : "normal",
                transition: "all 0.3s",
              }}
            />
            <Tab
              icon={<PeopleIcon sx={{ color: tabColors.friendGroups }} />}
              label="Friend Groups"
              sx={{
                fontWeight: tabValue === 2 ? "bold" : "normal",
                transition: "all 0.3s",
              }}
            />
          </Tabs>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConversationList;