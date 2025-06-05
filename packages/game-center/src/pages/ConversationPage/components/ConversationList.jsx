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
  Toolbar,
  ListItemButton, 
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
  friendGroups,
  onEditFriendGroup,
  onCreateFriendGroupDialogOpen,
  fetchFriendGroups,
  selectedConversation,
  onDeleteFriendGroup,
  handleLeaveFriendGroup,
  friends,
  incomingRequests,
  friendGroupsLoading,
  initialTabValue = 2,
  t,
}) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(initialTabValue);
  const [selectedFriend, setSelectedFriend] = useState(null); 

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (tabValue === 2) {
      fetchFriendGroups();
    }
  }, [tabValue]);

  useEffect(() => {
    setTabValue(initialTabValue);
  }, [initialTabValue]);

  useEffect(() => {
    if (selectedConversation && selectedConversation.type === "private") {
      const friend = friends.find(f => f.id === selectedConversation.id);
      if (friend) {
        setSelectedFriend(friend); 
      }
    }
  }, [selectedConversation, friends]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    let path = "/conversation/all";
    if (newValue === 1) {
      path += "/friend";
    } else if (newValue === 2) {
      path += "/friend-group";
    }

    navigate(path);
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith("/conversation/all")) {
      setTabValue(0);
    } else if (path.includes("/conversation/all/friend/")) {
      setTabValue(1);
    } else if (path.includes("/conversation/all/friend-group/")) {
      setTabValue(2);
    } else if (path.endsWith("/conversation/all/friend")) {
      setTabValue(1);
    } else if (path.endsWith("/conversation/all/friend-group")) {
      setTabValue(2);
    } else if (path.endsWith("/conversation")) {
      setTabValue(initialTabValue); 
    }
  }, [location.pathname, initialTabValue]);

  const handleFriendSelect = (friend) => {
    onFriendSelect(friend); 
    navigate(`/conversation/all/friend/${friend.id}`);
  };

  const handleFriendGroupSelect = (friendGroup) => {
    onFriendSelect({
      ...friendGroup,
      type: "friendGroup",
    });
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
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <StatusIcon
          sx={{
            fontSize: 12,
            mr: 0.5,
            color: isOnline
              ? theme.palette.success.main
              : theme.palette.grey[500],
          }}
        />
        <Typography variant="body2" component="span"> 
          {isOnline ? t("statusOnline") : t("statusOffline")}
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
      <Paper
        elevation={3}
        sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Toolbar sx={{ justifyContent: "space-between", p: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: theme.palette.text.primary,
            }}
          >
            {tabValue === 0 && t("toolbarTitleAll")}
            {tabValue === 1 && t("toolbarTitleFriends")}
            {tabValue === 2 && t("toolbarTitleFriendGroups")}
          </Typography>

          {tabValue === 2 ? (
            <Button
              variant="contained"
              color="warning"
              startIcon={<AddIcon />}
              sx={{ borderRadius: 20 }}
              onClick={onCreateFriendGroupDialogOpen}
            >
              {t("createGroupButton")}
            </Button>
          ) : (
            <Badge
              badgeContent={incomingRequests.length}
              color="error"
              sx={{ mr: 1 }}
            >
              <IconButton
                sx={{ color: theme.palette.text.primary }} 
                aria-label={t("friendRequestsAriaLabel")}
              >
                <MailIcon />
              </IconButton>
            </Badge>
          )}
        </Toolbar>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2 }}>
          {tabValue === 1 && (
            <List>
              {friends.map((friend) => (
                <ListItem
                  key={friend.id}
                  disablePadding 
                  sx={{ mb: 1 }} 
                >
                  <ListItemButton
                    selected={selectedConversation && selectedConversation.type === "private" && selectedConversation.id === friend.id}
                    onClick={() => handleFriendSelect(friend)}
                    sx={{
                      borderRadius: 2,
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                        transform: "translateY(-2px)",
                        boxShadow: 1,
                      },
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.success.lighter || theme.palette.success.light, 
                        "&:hover": {
                          backgroundColor: theme.palette.success.light || theme.palette.success.main, 
                        },
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        variant="dot"
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: friend.isOnline
                              ? theme.palette.success.main
                              : theme.palette.grey[500],
                            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                          },
                        }}
                      >
                        <Avatar
                          src={friend.avatar || undefined}
                          sx={{
                            bgcolor: friend.isOnline
                              ? theme.palette.success.main
                              : theme.palette.grey[400],
                            boxShadow: 2,
                          }}
                        >
                          {!friend.avatar && <PersonIcon />}
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
                      secondaryTypographyProps={{ component: 'div' }} 
                    />
                  </ListItemButton>
                </ListItem>
              ))}

              {friends.length === 0 && tabValue === 1 && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                    color: theme.palette.text.secondary,
                  }}
                >
                  <PersonIcon
                    sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }}
                  />
                  <Typography variant="body1" align="center">
                    {t("noFriendsYetMessage")}
                  </Typography>
                  <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                    {t("addFriendsPromptMessage")}
                  </Typography>
                </Box>
              )}
            </List>
          )}

          {tabValue === 2 && (
            <FriendGroupList
              friendGroups={friendGroups}
              friendGroupsLoading={friendGroupsLoading}
              selectedConversation={selectedConversation}
              onFriendGroupSelect={handleFriendGroupSelect}
              onDeleteFriendGroup={onDeleteFriendGroup}
              onLeaveFriendGroup={handleLeaveFriendGroup}
              onEditFriendGroup={onEditFriendGroup}
              t={t}
            />
          )}

          {tabValue === 0 && (
            <List>
              <Typography
                variant="subtitle2"
                sx={{
                  pl: 2,
                  mb: 1,
                  color: theme.palette.warning.main,
                  fontWeight: "bold",
                }}
              >
                {t("sectionTitleFriendGroups")}
              </Typography>
              <FriendGroupList
                friendGroups={friendGroups}
                friendGroupsLoading={friendGroupsLoading}
                selectedConversation={selectedConversation}
                onFriendGroupSelect={handleFriendGroupSelect}
                onDeleteFriendGroup={onDeleteFriendGroup}
                onLeaveFriendGroup={handleLeaveFriendGroup}
                onEditFriendGroup={onEditFriendGroup}
                t={t}
              />
              <Divider sx={{ my: 2 }} />

              <Typography
                variant="subtitle2"
                sx={{
                  pl: 2,
                  mb: 1,
                  color: theme.palette.success.main,
                  fontWeight: "bold",
                }}
              >
                {t("sectionTitleFriends")}
              </Typography>

              {friends.map((friend) => (
                <ListItem
                  key={`all-friend-${friend.id}`}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemButton
                    selected={selectedConversation && selectedConversation.type === "private" && selectedConversation.id === friend.id}
                    onClick={() => handleFriendSelect(friend)}
                    sx={{
                      borderRadius: 2,
                      transition: "all 0.2s", 
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                        transform: "translateY(-2px)",
                        boxShadow: 1,
                      },
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.success.lighter || theme.palette.success.light, 
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        variant="dot"
                        sx={{
                          "& .MuiBadge-badge": {
                            backgroundColor: friend.isOnline
                              ? theme.palette.success.main
                              : theme.palette.grey[500],
                            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                          },
                        }}
                      >
                        <Avatar
                          src={friend.avatar || undefined}
                          sx={{
                            bgcolor: friend.isOnline
                              ? theme.palette.success.main
                              : theme.palette.grey[400],
                          }}
                        >
                          {!friend.avatar && <PersonIcon />}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        friend.username || friend.name || `User-${friend.id}`
                      }
                      secondary={renderFriendStatus(friend)}
                      secondaryTypographyProps={{ component: 'div' }} // FIX: Prevent p > div
                    />
                  </ListItemButton>
                </ListItem>
              ))}
              {friends.length === 0 && (
                <Box sx={{ pl: 3, pb: 2, color: theme.palette.text.secondary }}>
                  <Typography variant="body2" align="left">
                    {t("noFriendsYetMessage")}
                  </Typography>
                </Box>
              )}
            </List>
          )}
        </Box>

        <Divider />

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
              label={t("tabLabelAll")}
              sx={{
                ...theme.typography.tabSubtitle,
                transition: "all 0.3s",
              }}
            />
            <Tab
              icon={
                <Badge badgeContent={incomingRequests.length} color="error">
                  <PersonIcon sx={{ color: tabColors.friends }} />
                </Badge>
              }
              label={t("tabLabelFriends")}
              sx={{
                ...theme.typography.tabSubtitle,
                transition: "all 0.3s",
              }}
            />
            <Tab
              icon={<PeopleIcon sx={{ color: tabColors.friendGroups }} />}
              label={t("tabLabelFriendGroups")}
              sx={{
                ...theme.typography.tabSubtitle,
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