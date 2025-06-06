import React, { useState, useCallback } from "react";
import {
  List,
  ListItem,
  ListItemButton, 
  ListItemAvatar,
  Avatar,
  Box,
  ListItemText,
  Typography,
  useTheme,
  ListItemIcon,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
  Paper,
  Fade,
  Divider,
  Badge,
} from "@mui/material";
import {
  People as PeopleIcon,
  Star as StarIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  ExitToApp as ExitToAppIcon,
  Edit as EditIcon,
  Groups as GroupsIcon,
} from "@mui/icons-material";
import { useAuthContext } from "../../../shared/context/AuthContext";

const FriendGroupListComponent = ({
  friendGroups,
  friendGroupsLoading,
  selectedConversation,
  onFriendGroupSelect,
  onDeleteFriendGroup,
  onLeaveFriendGroup,
  onEditFriendGroup,
  t,
}) => {
  const theme = useTheme();
  const { currentUser } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroupForMenu, setSelectedGroupForMenu] = useState(null);

  const handleMenuOpen = useCallback((event, group) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedGroupForMenu(group);
  }, []);

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null);
    setSelectedGroupForMenu(null);
  }, []);

  const handleDeleteClick = useCallback(() => {
    if (selectedGroupForMenu) {
      onDeleteFriendGroup(selectedGroupForMenu._id);
    }
    handleMenuClose();
  }, [selectedGroupForMenu, onDeleteFriendGroup, handleMenuClose]);

  const handleLeaveGroupClick = useCallback(() => {
    if (selectedGroupForMenu) {
      onLeaveFriendGroup(selectedGroupForMenu._id);
    }
    handleMenuClose();
  }, [selectedGroupForMenu, onLeaveFriendGroup, handleMenuClose]);

  const handleEditClick = useCallback(() => {
    if (selectedGroupForMenu) {
      onEditFriendGroup(selectedGroupForMenu);
    }
    handleMenuClose();
  }, [selectedGroupForMenu, onEditFriendGroup, handleMenuClose]);

  const isHost = useCallback(
      (group) => group && group.host === currentUser?.id,
      [currentUser?.id]
  );

  const getGroupColor = (name) => {
    if (!name) return theme.palette.warning.main;
    const colorOptions = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.error.main,
    ];
    const index = name.charCodeAt(0) % colorOptions.length;
    return colorOptions[index];
  };

  const getGroupInitials = (name) => {
    if (!name) return "GR";
    const words = name.split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
  };

  return (
    <Paper
      elevation={0}
      sx={{ bgcolor: "background.paper", borderRadius: 2, overflow: "hidden" }}
    >
      <List sx={{ p: 1 }}>
        {friendGroupsLoading && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
              minHeight: "150px",
            }}
          >
            <CircularProgress color="warning" />
          </Box>
        )}

        {!friendGroupsLoading &&
          friendGroups.map((friendGroup, index) => (
            <Fade in={true} timeout={300 + index * 100} key={friendGroup._id}>
              <ListItem
                disablePadding // ListItemButton iç padding'i yönetecek
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label={t("optionsAriaLabel")}
                    onClick={(event) => handleMenuOpen(event, friendGroup)}
                    sx={{
                      opacity: 0.6,
                      "&:hover": { opacity: 1 },
                      mr: 0.5, // Sağdan biraz boşluk ayarlandı
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                }
                sx={{
                  mb: 0.75,
                  borderRadius: 2, // Dış ListItem için genel border radius
                  position: 'relative', // &:before için
                  "&:before": isHost(friendGroup)
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "20%",
                        height: "60%",
                        width: 3,
                        borderRadius: 4,
                        bgcolor: theme.palette.warning.main,
                      }
                    : {},
                }}
              >
                <ListItemButton
                  selected={
                    selectedConversation?._id === friendGroup._id &&
                    selectedConversation?.type === "friendGroup"
                  }
                  onClick={() => onFriendGroupSelect(friendGroup)}
                  sx={{
                    borderRadius: 2, // İç tıklanabilir alan için border radius
                    transition: "all 0.25s ease",
                    px: 2,
                    py: 1,
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? "rgba(255,255,255,0.05)"
                          : "rgba(0,0,0,0.04)",
                      transform: "translateY(-1px)",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    },
                    "&.Mui-selected": {
                      backgroundColor:
                        theme.palette.mode === "dark"
                          ? `${theme.palette.warning.dark}30`
                          : `${theme.palette.warning.light}30`,
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark"
                            ? `${theme.palette.warning.dark}40`
                            : `${theme.palette.warning.light}40`,
                      },
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: "auto", mr: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        isHost(friendGroup) ? (
                          <Tooltip title={t("groupAdminTooltip")} placement="top">
                            <StarIcon
                              sx={{
                                color: theme.palette.warning.main,
                                bgcolor: theme.palette.background.paper,
                                borderRadius: "50%",
                                fontSize: "14px",
                                padding: "2px",
                                boxShadow: 1,
                              }}
                            />
                          </Tooltip>
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{
                          bgcolor: getGroupColor(friendGroup.groupName),
                          width: 44,
                          height: 44,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                          transition: "transform 0.2s",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        {getGroupInitials(friendGroup.groupName)}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        noWrap
                        sx={{
                          color: theme.palette.text.primary,
                          fontSize: "0.95rem",
                        }}
                      >
                        {friendGroup.groupName}
                      </Typography>
                    }
                    secondary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                      >
                        <GroupsIcon
                          sx={{
                            fontSize: "0.85rem",
                            mr: 0.5,
                            color: theme.palette.text.secondary,
                          }}
                        />
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          noWrap
                          sx={{ fontSize: "0.8rem" }}
                        >
                          {friendGroup.description ||
                            t("membersCountFallback", {
                              count: friendGroup.members?.length || 1,
                            })}
                        </Typography>
                      </Box>
                    }
                    secondaryTypographyProps={{ component: 'div' }}
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          ))}

        {!friendGroupsLoading && friendGroups.length === 0 && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              p: 5,
              textAlign: "center",
              color: theme.palette.text.secondary,
              minHeight: "180px",
              bgcolor:
                theme.palette.mode === "dark"
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(0,0,0,0.01)",
              borderRadius: 2,
              border: `1px dashed ${theme.palette.divider}`,
            }}
          >
            <PeopleIcon
              sx={{
                fontSize: 48,
                color: theme.palette.grey[400],
                mb: 2,
                opacity: 0.7,
              }}
            />
            <Typography variant="body1" fontWeight={500}>
              {t("noFriendGroupsMessage")}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                maxWidth: "80%",
                color: theme.palette.text.secondary,
              }}
            >
              {t("createOrJoinGroupPrompt")}
            </Typography>
          </Box>
        )}
      </List>

      <Menu
        id="friend-group-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 0.5,
            minWidth: 180,
            borderRadius: 2,
            overflow: "visible",
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
      >
        {isHost(selectedGroupForMenu) && (
          <MenuItem onClick={handleEditClick} sx={{ py: 1.2 }}>
            <ListItemIcon
              sx={{ minWidth: "34px", color: theme.palette.primary.main }}
            >
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{t("editGroupMenuItem")}</Typography>
          </MenuItem>
        )}

        {isHost(selectedGroupForMenu) && selectedGroupForMenu && (
           <Divider sx={{ my: 0.5 }} />
        )}


        {!isHost(selectedGroupForMenu) && selectedGroupForMenu && (
          <MenuItem onClick={handleLeaveGroupClick} sx={{ py: 1.2 }}>
            <ListItemIcon
              sx={{ minWidth: "34px", color: theme.palette.secondary.main }}
            >
              <ExitToAppIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2">{t("leaveGroupMenuItem")}</Typography>
          </MenuItem>
        )}

        {isHost(selectedGroupForMenu) && (
          <MenuItem
            onClick={handleDeleteClick}
            sx={{ py: 1.2, color: theme.palette.error.main }}
          >
            <ListItemIcon sx={{ minWidth: "34px", color: "inherit" }}>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <Typography variant="body2" color="inherit">
              {t("deleteGroupMenuItem")}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

FriendGroupListComponent.displayName = "FriendGroupListCore";

const FriendGroupList = React.memo(FriendGroupListComponent);

FriendGroupList.displayName = "FriendGroupList";

export default FriendGroupList;