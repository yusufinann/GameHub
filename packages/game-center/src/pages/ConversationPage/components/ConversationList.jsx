import React, { useEffect, useState, useCallback } from "react";
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

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (tabValue === 2 && typeof fetchFriendGroups === 'function') {
      fetchFriendGroups();
    }
  }, [tabValue, fetchFriendGroups]);

  useEffect(() => {
    setTabValue(initialTabValue);
  }, [initialTabValue]);


  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
    let path = "/conversation/all";
    if (newValue === 1) {
      path += "/friend";
    } else if (newValue === 2) {
      path += "/friend-group";
    }
    navigate(path);
  }, [navigate, setTabValue]);

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

  const handleFriendSelect = useCallback((friend) => {
    if (typeof onFriendSelect === 'function') {
      onFriendSelect(friend);
    }
    navigate(`/conversation/all/friend/${friend.id}`);
  }, [onFriendSelect, navigate]);

  const handleFriendGroupSelect = useCallback((friendGroup) => {
    if (typeof onFriendSelect === 'function') {
      onFriendSelect({
        ...friendGroup,
        type: "friendGroup",
      });
    }
    navigate(`/conversation/all/friend-group/${friendGroup._id}`);
  }, [onFriendSelect, navigate]);

  const tabColors = {
    all: theme.palette.primary.main,
    friends: theme.palette.success.main,
    friendGroups: theme.palette.warning.main,
  };

  const renderFriendStatus = useCallback((friend) => {
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
  }, [theme.palette.success.main, theme.palette.grey, t]);

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
        sx={{
          p: 2,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.spacing(2),
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between", p: { xs: 1, sm: 2 } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: tabValue === 0 ? tabColors.all :
                     tabValue === 1 ? tabColors.friends :
                     tabColors.friendGroups,
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
              sx={{ borderRadius: "20px", textTransform: "none", px: 1.5, py: 0.5, fontSize: '0.875rem' }}
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

        <Box sx={{ flexGrow: 1, overflowY: "auto", mb: 2, pr:0.5 }}>
          {tabValue === 1 && (
            <List>
              {friends.map((friend) => (
                <ListItem
                  key={friend.id}
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemButton
                    selected={selectedConversation?.type === "private" && selectedConversation?.id === friend.id}
                    onClick={() => handleFriendSelect(friend)}
                    sx={{
                      borderRadius: theme.shape.borderRadius * 1.5,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[2],
                      },
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.success.lighter || theme.palette.action.selected,
                        borderLeft: `4px solid ${theme.palette.success.main}`,
                        pl: 1.5,
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
                        <Typography variant="body1" fontWeight="bold" sx={{ color: 'secondary.main', fontSize:"1.1rem"}}>
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
                    textAlign: 'center',
                  }}
                >
                  <PersonIcon
                    sx={{ fontSize: 48, color: theme.palette.grey[400], mb: 2 }}
                  />
                  <Typography variant="body1">
                    {t("noFriendsYetMessage")}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
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
                variant="subtitle1"
                sx={{
                  pl: 2,
                  mb: 1,
                  color: theme.palette.warning.dark,
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
                variant="subtitle1"
                sx={{
                  pl: 2,
                  mb: 1,
                  color: theme.palette.success.dark,
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
                    selected={selectedConversation?.type === "private" && selectedConversation?.id === friend.id}
                    onClick={() => handleFriendSelect(friend)}
                     sx={{
                      borderRadius: theme.shape.borderRadius * 1.5,
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        backgroundColor: `${theme.palette.action.hover}50`,
                        boxShadow: theme.shadows[2],
                      },
                      "&.Mui-selected": {
                        backgroundColor: theme.palette.primary.main,
                        borderLeft: `4px solid ${theme.palette.success.main}`,
                        pl: 1.5,
                        "&:hover": {
                          backgroundColor: theme.palette.success.light || theme.palette.action.selectedHover,
                        },
                         ".MuiListItemText-primary .MuiTypography-root": {
                           color: theme.palette.success.contrastText || theme.palette.common.white,
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
                            boxShadow: 1,
                          }}
                        >
                          {!friend.avatar && <PersonIcon />}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="bold" sx={{ color: 'secondary.main', fontSize:"1.1rem"}}>
                          {friend.username || friend.name || `User-${friend.id}`}
                        </Typography>
                      }
                      secondary={renderFriendStatus(friend)}
                      secondaryTypographyProps={{ component: 'div' }}
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

        <Box sx={{ mt: "auto", borderTop: `1px solid ${theme.palette.divider}`}}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="inherit"
            sx={{
              "& .MuiTab-root": {
                minHeight: 60,
                textTransform: 'none',
                fontWeight: 500,
                opacity: 0.7,
                transition: "all 0.3s",
                "&.Mui-selected": {
                  opacity: 1,
                  color: (tabValue === 0 && tabColors.all) ||
                         (tabValue === 1 && tabColors.friends) ||
                         (tabValue === 2 && tabColors.friendGroups),
                  fontWeight: 600,
                },
                "&:hover": {
                  opacity: 1,
                  backgroundColor: theme.palette.action.hover,
                }
              },
              "& .MuiTabs-indicator": {
                height: 3,
                backgroundColor: (tabValue === 0 && tabColors.all) ||
                                 (tabValue === 1 && tabColors.friends) ||
                                 (tabValue === 2 && tabColors.friendGroups),
              }
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              label={t("tabLabelAll")}
              sx={{ ...theme.typography.body2, color: tabValue === 0 ? tabColors.all : theme.palette.text.secondary }}
            />
            <Tab
              icon={
                <Badge badgeContent={incomingRequests.length} color="error"
                  sx={{ "& .MuiBadge-badge": { top: 2, right: -3 } }}
                >
                  <PersonIcon />
                </Badge>
              }
              label={t("tabLabelFriends")}
              sx={{ ...theme.typography.body2, color: tabValue === 1 ? tabColors.friends : theme.palette.text.secondary }}
            />
            <Tab
              icon={<PeopleIcon />}
              label={t("tabLabelFriendGroups")}
              sx={{ ...theme.typography.body2, color: tabValue === 2 ? tabColors.friendGroups : theme.palette.text.secondary }}
            />
          </Tabs>
        </Box>
      </Paper>
    </Box>
  );
};

export default ConversationList;