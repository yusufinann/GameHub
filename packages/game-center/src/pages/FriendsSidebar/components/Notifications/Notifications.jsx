import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import notificationSound from "../../../../assets/notification-sound.mp3";
import joinLobby from "../../../../assets/joinLobby.ogg";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../../../shared/context/WebSocketContext/context";
import { useAuthContext } from "../../../../shared/context/AuthContext";
import { useFriendsContext } from "../../../../shared/context/FriendsContext/context";
import { useNotification } from "../../context";
import EventNotificationItem from "./EventNotificationItem";
import FriendRequestNotificationItem from "./FriendRequestNotificationItem";
import Divider from "@mui/material/Divider";
import LobbyInviteNotificationItem from "./LobbyInviteNotificationItem";
import FriendGroupInviteNotificationItem from "./FriendGroupInviteNotificationItem";
import UserJoinNotificationItem from "./UserJoinNotificationItem";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { socket } = useWebSocket();
  const { currentUser } = useAuthContext();
  const { incomingRequests, acceptFriendRequest, rejectFriendRequest } =
    useFriendsContext();
  const showNotification = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleMessage = useCallback(
    (event) => {
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
            if (
              prev.some(
                (notif) =>
                  notif.lobbyId === eventData.lobbyId && notif.type === "event"
              )
            ) {
              return prev;
            }

            if (document.hasFocus()) {
              showNotification(`${eventData.game} event has started!`);
            } else {
              const audio = new Audio(notificationSound);
              audio
                .play()
                .catch((error) => console.log("Audio play failed:", error));
            }

            return [
              ...prev,
              {
                type: "event",
                lobbyId: eventData.lobbyId,
                lobbyName: eventData.lobbyName,
                lobbyCode: eventData.lobbyCode,
                game: eventData.game,
                message:
                  eventData.message || `${eventData.game} event has started!`,
                timestamp: new Date().toISOString(),
              },
            ];
          });
          break;

        case "EVENT_STATUS":
          if (data.status === "ended") {
            setNotifications((prev) =>
              prev.filter(
                (notif) =>
                  notif.lobbyCode !== data.lobbyCode && notif.type === "event"
              )
            );
          }
          break;
        case "USER_JOINED":
          const userData = data.data;

          if (document.hasFocus()) {
            showNotification(
              `${userData.name} joined ${userData.lobbyName} lobby `,
              "info"
            );
          } else {
            const audio = new Audio(joinLobby);
            audio
              .play()
              .catch((error) => console.log("Audio play failed:", error));
            setNotifications((prev) => {
              const existingNotification = prev.find(
                (notif) =>
                  notif.type === "user-join" &&
                  notif.lobbyCode === userData.lobbyCode
              );
              if (existingNotification) {
                return prev;
              }
              return [
                ...prev,
                {
                  type: "user-join",
                  lobbyCode: userData.lobbyCode,
                  lobbyName: userData.lobbyName,
                  userName: userData.name,
                  message: `${userData.name} joined ${userData.lobbyName} lobby`,
                  timestamp: new Date().toISOString(),
                },
              ];
            });
          }
          break;

        case "HOST_RETURNED":
          const hostData = data.data;
          if (!document.hasFocus()) {
            new Audio(joinLobby).play().catch(() => {});
          } else {
            showNotification(
              `${hostData.name} returned as host to ${hostData.lobbyName}!`
            );
          }
          setNotifications((prev) => [
            ...prev,
            {
              type: "user-join",
              lobbyCode: hostData.lobbyCode,
              lobbyName: hostData.lobbyName,
              userName: hostData.name,
              message: `${hostData.name} returned as host`,
              timestamp: new Date().toISOString(),
            },
          ]);
          break;

        case "FRIEND_REQUEST_RECEIVED":
          if (document.hasFocus()) {
            showNotification(
              `Friend request received from ${data.sender.username}`
            );
          } else {
            const audio = new Audio(notificationSound);
            audio
              .play()
              .catch((error) => console.log("Audio play failed:", error));
            showNotification(
              `Friend request received from ${data.sender.username}`
            );
          }
          break;

        case "FRIEND_REQUEST_ACCEPTED":
          showNotification(
            `${data.acceptedBy.username} accepted your friend request`
          );
          break;
        case "LOBBY_INVITATION_RECEIVED":
          const invitationData = data;
          setNotifications((prev) => {
            if (
              prev.some(
                (notif) =>
                  notif.lobbyId === invitationData.lobby.lobbyId &&
                  notif.type === "lobby-invite"
              )
            ) {
              return prev;
            }

            if (document.hasFocus()) {
              showNotification(
                `Lobby invitation received from ${invitationData.sender.username} for lobby ${invitationData.lobby.lobbyName}`
              );
            } else {
              const audio = new Audio(notificationSound);
              audio
                .play()
                .catch((error) => console.log("Audio play failed:", error));
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

          // Show notification via snackbar regardless of focus state
          showNotification(
            `Friend group invitation received for ${friendGroupInvitationData.groupName}`
          );

          // Always add to notifications menu, regardless of document focus
          setNotifications((prev) => {
            if (
              prev.some(
                (notif) =>
                  notif.groupId === friendGroupInvitationData.groupId &&
                  notif.type === "friend-group-invite"
              )
            ) {
              return prev;
            }

            // Only play sound if document is not in focus
            if (!document.hasFocus()) {
              const audio = new Audio(notificationSound);
              audio
                .play()
                .catch((error) => console.log("Audio play failed:", error));
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
        default:
          break;
      }
    },
    [showNotification]
  );

  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.addEventListener("message", handleMessage);
    return () => socket.removeEventListener("message", handleMessage);
  }, [socket, currentUser, handleMessage]);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => setAnchorEl(null), []);

  const handleJoinEvent = useCallback(
    (lobbyCode) => {
      navigate(`/lobby/${lobbyCode}`);
      handleClose();
    },
    [navigate, handleClose]
  );

  const removeNotification = useCallback((notificationId, type) => {
    setNotifications((prev) =>
      prev.filter((notif) => {
        if (notif.type === "friend-group-invite") {
          return notif.groupId !== notificationId;
        } else if (notif.type === "user-join") {
          return !(notif.lobbyCode === notificationId && notif.type === type);
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

  const handleViewFriendGroup = useCallback(
    (groupId) => {
      navigate(`/conversation/all/friend-group/${groupId}`);
      removeNotification(groupId);
      handleClose();
    },
    [navigate, handleClose, removeNotification]
  );

  const totalNotifications = notifications.length + incomingRequests.length;

  const menuItems = useMemo(() => {
    const items = [];

    const eventNotifications = notifications.filter(
      (notif) => notif.type === "event"
    );
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
          <EventNotificationItem
            key={notification.lobbyId}
            notification={notification}
            handleJoinEvent={handleJoinEvent}
            removeNotification={removeNotification}
          />
        );
      });

      if (
        incomingRequests.length > 0 ||
        notifications.filter((notif) => notif.type === "lobby-invite").length >
          0
      ) {
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
          <FriendRequestNotificationItem
            key={request.id}
            request={request}
            handleAcceptFriendRequest={handleAcceptFriendRequest}
            handleRejectFriendRequest={handleRejectFriendRequest}
          />
        );
      });
      if (
        notifications.filter((notif) => notif.type === "lobby-invite").length >
        0
      ) {
        items.push(<Divider key="divider-friends" />);
      }
    }

    const lobbyInviteNotifications = notifications.filter(
      (notif) => notif.type === "lobby-invite"
    );
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
          <LobbyInviteNotificationItem
            key={`lobby-invite-${notification.lobbyId}`}
            notification={notification}
            handleJoinEvent={handleJoinEvent}
            removeNotification={removeNotification}
          />
        );
      });
      if (
        notifications.filter((notif) => notif.type === "user-join").length > 0
      ) {
        items.push(<Divider key="divider-lobby-invites" />);
      }
    }

    const userJoinNotifications = notifications.filter(
      (notif) => notif.type === "user-join"
    );

    if (userJoinNotifications.length > 0) {
      items.push(
        <MenuItem key="user-join-header" disabled>
          <Typography variant="subtitle2" color="primary">
            Lobby Joins
          </Typography>
        </MenuItem>
      );
      userJoinNotifications.forEach((notification) => {
        items.push(
          <UserJoinNotificationItem
            key={`user-join-${notification.lobbyCode}-${notification.userName}`}
            notification={notification}
            removeNotification={removeNotification}
          />
        );
      });
      if (
        notifications.filter((notif) => notif.type === "friend-group-invite")
          .length > 0
      ) {
        items.push(<Divider key="divider-user-joins" />);
      }
    }

    const friendGroupInviteNotifications = notifications.filter(
      (notif) => notif.type === "friend-group-invite"
    );
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
          <FriendGroupInviteNotificationItem
            key={`friend-group-invite-${notification.groupId}`}
            notification={notification}
            handleViewFriendGroup={handleViewFriendGroup}
            removeNotification={removeNotification}
          />
        );
      });
    }

    if (
      eventNotifications.length === 0 &&
      incomingRequests.length === 0 &&
      lobbyInviteNotifications.length === 0 &&
      friendGroupInviteNotifications.length === 0 &&
      userJoinNotifications.length === 0
    ) {
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
    handleViewFriendGroup,
  ]);

  return (
    <>
 <IconButton
  onClick={handleClick}
  size="medium"
  sx={{
    color: theme.palette.text.contrast,
    position: "relative",
    zIndex: 1900,
    padding: "8px",
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      boxShadow: `0 0 8px ${theme.palette.primary.light}`,
    },
    transition: "all 0.2s ease-in-out",
  }}
>
  <Badge 
    badgeContent={totalNotifications} 
    color="error"
    sx={{
      "& .MuiBadge-badge": {
        backgroundColor: theme.palette.error.main,
        color: theme.palette.error.contrastText,
        fontWeight: "bold",
        fontSize: "0.75rem",
      }
    }}
  >
    <NotificationsIcon 
      sx={{ 
        color: theme.palette.text.contrast,
        filter: `drop-shadow(0px 0px 2px ${theme.palette.secondary.main})`,
        fontSize: "28px", // Increased from default size
      }}
    />
  </Badge>
</IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: isMobile ? "95vw" : 340,
            maxHeight: isMobile ? "80vh" : 500,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            mt: 1,
            zIndex: 2000,
            overflowY: "auto",
            boxShadow: `0 4px 20px ${theme.palette.background.elevation[2]}`,
            border: `1px solid ${theme.palette.primary.light}`,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          root: {
            sx: {
              zIndex: 2000,
            },
          },
        }}
      >
        {menuItems}
      </Menu>
    </>
  );
};

export default Notifications;