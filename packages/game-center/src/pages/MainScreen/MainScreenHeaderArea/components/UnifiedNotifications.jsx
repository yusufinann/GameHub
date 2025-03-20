import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Button,
  Avatar,
  Stack,
  Snackbar,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import EventIcon from "@mui/icons-material/Event";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupsIcon from '@mui/icons-material/Groups'; // Lobby Name Icon for lobby invitations
import { useNavigate } from "react-router-dom";
import notificationSound from "../../../../assets/notification-sound.mp3";
import { useWebSocket } from "../../../../shared/context/WebSocketContext/context";
import { useAuthContext } from "../../../../shared/context/AuthContext";
import { useFriendsContext } from "../../../Profile/context";
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'; 

const UnifiedNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const navigate = useNavigate();
  const { socket } = useWebSocket();
  const { currentUser } = useAuthContext();
  const {
    incomingRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    requestFriendList,
  } = useFriendsContext();

  const handleSnackbarClose = useCallback(() => setSnackbarOpen(false), []);

  const handleMessage = useCallback((event) => {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (err) {
      console.error("Error parsing WebSocket message:", err);
      return;
    }

    switch (data.type) {
      case "EVENT_START_NOTIFICATION":
        const eventData = data.data;
        setNotifications((prev) => {
          if (prev.some((notif) => notif.lobbyId === eventData.lobbyId && notif.type === 'event')) {
            return prev;
          }

          if (document.hasFocus()) {
            setSnackbarMessage(`${eventData.game} event has started!`);
            setSnackbarOpen(true);
          } else {
            const audio = new Audio(notificationSound);
            audio.play().catch((error) => console.log("Audio play failed:", error));
          }

          return [
            ...prev,
            {
              type: "event",
              lobbyId: eventData.lobbyId,
              lobbyName: eventData.lobbyName,
              lobbyCode: eventData.lobbyCode,
              game: eventData.game,
              message: eventData.message || `${eventData.game} event has started!`,
              timestamp: new Date().toISOString(),
            },
          ];
        });
        break;

      case "EVENT_STATUS":
        if (data.status === "ended") {
          setNotifications((prev) =>
            prev.filter((notif) => notif.lobbyCode !== data.lobbyCode && notif.type === 'event')
          );
        }
        break;

      case "FRIEND_REQUEST_RECEIVED":
          setSnackbarMessage(`Friend request received from ${data.sender.username}`);
          setSnackbarOpen(true);
        break;

      case "FRIEND_REQUEST_ACCEPTED":
        setSnackbarMessage(`${data.acceptedBy.username} accepted your friend request`);
        setSnackbarOpen(true);
        requestFriendList();
        break;
      case "LOBBY_INVITATION_RECEIVED":
        const invitationData = data;
        setNotifications((prev) => {
          if (prev.some((notif) => notif.lobbyId === invitationData.lobby.lobbyId && notif.type === 'lobby-invite')) {
            return prev;
          }

          if (document.hasFocus()) {
            setSnackbarMessage(`Lobby invitation received from ${invitationData.sender.username} for lobby ${invitationData.lobby.lobbyName}`);
            setSnackbarOpen(true);
          } else {
            const audio = new Audio(notificationSound);
            audio.play().catch((error) => console.log("Audio play failed:", error));
          }

          return [
            ...prev,
            {
              type: "lobby-invite",
              lobbyId: invitationData.lobby.lobbyId,
              lobbyName: invitationData.lobby.lobbyName,
              lobbyCode: invitationData.lobby.lobbyCode,
              senderUsername: invitationData.sender.username,
              senderAvatar: invitationData.sender.avatar,
              message: `Lobby invitation from ${invitationData.sender.username} for lobby ${invitationData.lobby.lobbyName}`,
              timestamp: new Date().toISOString(),
            },
          ];
        });
        break;

        case "FRIEND_GROUP_INVITATION_RECEIVED":
          const friendGroupInvitationData = data;
          setNotifications((prev) => {
            if (prev.some((notif) => notif.groupId === friendGroupInvitationData.groupId && notif.type === 'friend-group-invite')) {
              return prev;
            }

            if (document.hasFocus()) {
              setSnackbarMessage(`Friend group invitation received for ${friendGroupInvitationData.groupName}`);
              setSnackbarOpen(true);
            } else {
              const audio = new Audio(notificationSound);
              audio.play().catch((error) => console.log("Audio play failed:", error));
            }

            return [
              ...prev,
              {
                type: "friend-group-invite",
                groupId: friendGroupInvitationData.groupId,
                groupName: friendGroupInvitationData.groupName,
                inviterUsername: friendGroupInvitationData.inviterUsername,
                inviterAvatar: null,
                message: `Friend group invitation from ${friendGroupInvitationData.inviterUsername} for group ${friendGroupInvitationData.groupName}`,
                timestamp: new Date().toISOString(),
              },
            ];
          });
          break;
          case "FRIEND_GROUP_UPDATED":
    console.log("FRIEND_GROUP_UPDATED event received in notifications :", data);
    break;
      default:
        break;
    }
  }, [requestFriendList]);

  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, currentUser, handleMessage]);

  useEffect(() => {
    requestFriendList();
  }, [requestFriendList]);

  const handleClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleJoinEvent = useCallback(
    (lobbyCode) => {
      navigate(`/lobby/${lobbyCode}`);
      handleClose();
    },
    [navigate, handleClose]
  );

  const removeNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => {
        if (notif.type === 'friend-group-invite') {
          return notif.groupId !== notificationId;
        } else {
          return notif.lobbyId !== notificationId;
        }
      })
    );
  }, []);

  const handleAcceptFriendRequest = useCallback(
    async (requesterId) => {
      await acceptFriendRequest(requesterId);
    },
    [acceptFriendRequest]
  );

  const handleRejectFriendRequest = useCallback(
    async (requesterId) => {
      await rejectFriendRequest(requesterId);
    },
    [rejectFriendRequest]
  );


const handleViewFriendGroup = useCallback((groupId) => {
  navigate(`/conversation/all/friend-group/${groupId}`);
  removeNotification(groupId);
  handleClose();
}, [navigate, handleClose]);
  const totalNotifications = notifications.length + incomingRequests.length;

  const menuItems = useMemo(() => {
    const items = [];

    const eventNotifications = notifications.filter(notif => notif.type === 'event');
    if (eventNotifications.length > 0) {
      items.push(
        <MenuItem key="events-header" disabled>
          <Typography variant="subtitle2" color="primary">
            Events
          </Typography>
        </MenuItem>
      );

      eventNotifications.forEach((notification) => {
        items.push(
          <MenuItem key={notification.lobbyId} sx={{ py: 2 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: "primary.light" }}>
                <EventIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={notification.lobbyName}
              secondary={notification.message}
              sx={{ mr: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  handleJoinEvent(notification.lobbyCode);
                }}
              >
                Join
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => removeNotification(notification.lobbyId)}
              >
                Dismiss
              </Button>
            </Stack>
          </MenuItem>
        );
      });

      if (incomingRequests.length > 0 || notifications.filter(notif => notif.type === 'lobby-invite').length > 0) {
        items.push(<Divider key="divider" />);
      }
    }

    if (incomingRequests.length > 0) {
      items.push(
        <MenuItem key="friends-header" disabled>
          <Typography variant="subtitle2" color="primary">
            Friend Requests
          </Typography>
        </MenuItem>
      );

      incomingRequests.forEach((request) => {
        items.push(
          <MenuItem key={request.id} sx={{ py: 2 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: "secondary.light" }}>
                <PersonAddIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={request.username}
              secondary="Wants to be your friend"
              sx={{ mr: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => handleAcceptFriendRequest(request.id)}
              >
                Accept
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => handleRejectFriendRequest(request.id)}
              >
                Reject
              </Button>
            </Stack>
          </MenuItem>
        );
      });
       if (notifications.filter(notif => notif.type === 'lobby-invite').length > 0) {
          items.push(<Divider key="divider-friends" />);
        }
    }

     const lobbyInviteNotifications = notifications.filter(notif => notif.type === 'lobby-invite');
    if (lobbyInviteNotifications.length > 0) {
      items.push(
        <MenuItem key="lobby-invites-header" disabled>
          <Typography variant="subtitle2" color="primary">
            Lobby Invitations
          </Typography>
        </MenuItem>
      );
      lobbyInviteNotifications.forEach((notification) => {
        items.push(
          <MenuItem key={`lobby-invite-${notification.lobbyId}`} sx={{ py: 2 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: "secondary.light" }}>
                <GroupsIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={notification.lobbyName}
              secondary={`Invitation from ${notification.senderUsername}`}
              sx={{ mr: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  handleJoinEvent(notification.lobbyCode);
                  removeNotification(notification.lobbyId); 
                }}
              >
                Join
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => removeNotification(notification.lobbyId)}
              >
                Dismiss
              </Button>
            </Stack>
          </MenuItem>
        );
      });
    }

    const friendGroupInviteNotifications = notifications.filter(notif => notif.type === 'friend-group-invite');
    if (friendGroupInviteNotifications.length > 0) {
      items.push(
        <MenuItem key="friend-group-invites-header" disabled>
          <Typography variant="subtitle2" color="primary">
            Friend Group Invitations
          </Typography>
        </MenuItem>
      );
      friendGroupInviteNotifications.forEach((notification) => {
        items.push(
          <MenuItem key={`friend-group-invite-${notification.groupId}`} sx={{ py: 2 }}>
            <ListItemIcon>
              <Avatar sx={{ bgcolor: "secondary.light" }}>
              <GroupsRoundedIcon />
              </Avatar>
            </ListItemIcon>
            <ListItemText
              primary={notification.groupName}
              secondary={`Invitation from ${notification.inviterUsername}`}
              sx={{ mr: 2 }}
            />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  handleViewFriendGroup(notification.groupId);
                }}
              >
                View
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => removeNotification(notification.groupId)}
              >
                Dismiss
              </Button>
            </Stack>
          </MenuItem>
        );
      });
    }

    if (eventNotifications.length === 0 && incomingRequests.length === 0 && lobbyInviteNotifications.length === 0 && friendGroupInviteNotifications.length === 0) {
      items.push(
        <MenuItem key="no-notifications" disabled>
          <Typography variant="body2" color="text.secondary" align="center">
            No notifications
          </Typography>
        </MenuItem>
      );
    }

    return items;
  }, [
    notifications,
    incomingRequests,
    handleJoinEvent,
    removeNotification,
    handleAcceptFriendRequest,
    handleRejectFriendRequest,
    handleViewFriendGroup
  ]);

  return (
    <>
      <IconButton onClick={handleClick} size="small" sx={{ color: "white" }}>
        <Badge badgeContent={totalNotifications} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 320,
            maxHeight: 500,
            backgroundColor: "white",
            color: "black",
            mt: 1
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {menuItems}
      </Menu>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      />
    </>
  );
};

export default UnifiedNotifications;