import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useWebSocket } from "../../shared/context/WebSocketContext/context";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useSnackbar } from "../../shared/context/SnackbarContext";
import { useFriendsContext } from "../../shared/context/FriendsContext/context";
import { fetchFriendGroupDetailsAPI } from "./api";

export function useConversationSocket({
  setFriendGroups,
  selectedConversation,
  setSelectedConversation,
  friendGroups,
}) {
  const { socket } = useWebSocket();
  const { currentUser } = useAuthContext();
  const { showSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { friends, fetchFriends } = useFriendsContext();

  useEffect(() => {
    if (!socket || !currentUser) return;

    const handleWebSocketMessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch (err) {
        return;
      }

      switch (data.type) {
        case "USER_JOINED_FRIEND_GROUP":
          if (data.data && data.data.group && data.data.groupId) {
            const {
              group: joinedGroupData,
              groupId: joinedGroupId,
            } = data.data;
            setFriendGroups((prevGroups) => {
              const currentGroups = prevGroups || [];
              const groupExists = currentGroups.some(
                (g) => g._id === joinedGroupId
              );
              return groupExists
                ? currentGroups.map((g) =>
                    g._id === joinedGroupId ? { ...joinedGroupData, type: "friendGroup" } : g
                  )
                : [...currentGroups, { ...joinedGroupData, type: "friendGroup" }];
            });
            if (
              selectedConversation &&
              selectedConversation._id === joinedGroupId
            ) {
              setSelectedConversation((prev) => ({
                ...prev,
                ...joinedGroupData,
                type: "friendGroup"
              }));
            }
          }
          break;
        case "FRIEND_GROUP_UPDATED":
          let updatedGroupData;
          let eventGroupId;
          let eventUserIdLeft;

          if (data.group && data.groupId) {
            updatedGroupData = data.group;
            eventGroupId = data.groupId;
            eventUserIdLeft = data.userIdLeft;
          } else if (data.data && data.data.group && data.data.groupId) {
            updatedGroupData = data.data.group;
            eventGroupId = data.data.groupId;
            eventUserIdLeft = data.data.userIdLeft || data.userIdLeft;
          }


          if (updatedGroupData && eventGroupId) {
            if (eventUserIdLeft && eventUserIdLeft === currentUser.id) {
              setFriendGroups((prevGroups) => {
                const currentGroups = prevGroups || [];
                return currentGroups.filter((g) => g._id !== eventGroupId);
              });
              if (selectedConversation && selectedConversation._id === eventGroupId) {
                setSelectedConversation(null);
                navigate("/conversation/all/friend-group");
              }
            } else {
              setFriendGroups((prevGroups) => {
                const currentGroups = prevGroups || [];
                return currentGroups.map((g) =>
                  g._id === eventGroupId
                    ? { ...updatedGroupData, type: "friendGroup" }
                    : g
                );
              });

              if (selectedConversation && selectedConversation._id === eventGroupId) {
                setSelectedConversation((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    ...updatedGroupData,
                    type: "friendGroup",
                  };
                });
              }
            }
          }
          break;

        case "USER_LEFT_FRIEND_GROUP":
          if (data.data && data.data.groupId && data.data.userId) {
            const { groupId: leftGroupId, userId: leftUserId } = data.data;
            const leftGroup = (friendGroups && Array.isArray(friendGroups))
              ? friendGroups.find((g) => g._id === leftGroupId)
              : null;
            const groupNameForNotification = leftGroup
              ? leftGroup.groupName
              : leftGroupId;

            if (leftUserId === currentUser.id) {
              showSnackbar({
                message: t("notifications.youLeftGroup", {
                  groupName: groupNameForNotification,
                }),
                severity: "warning",
              });
              setFriendGroups((prevGroups) => {
                const currentGroups = prevGroups || [];
                return currentGroups.filter((g) => g._id !== leftGroupId);
              });
              if (selectedConversation && selectedConversation._id === leftGroupId) {
                setSelectedConversation(null);
                navigate("/conversation/all/friend-group");
              }
            } else {
              setFriendGroups((prevGroups) => {
                const currentGroups = prevGroups || [];
                return currentGroups.map((g) =>
                  g._id === leftGroupId
                    ? {
                        ...g,
                        members: g.members.filter((m) => m._id !== leftUserId),
                      }
                    : g
                );
              });
              if (selectedConversation && selectedConversation._id === leftGroupId) {
                setSelectedConversation((prev) => ({
                  ...prev,
                  members: prev.members.filter((m) => m._id !== leftUserId),
                }));
              }
            }
          }
          break;

        case "FRIEND_GROUP_DELETED": 
          if (data.data && data.data.groupId) {
            const deletedGroupId = data.data.groupId;
            const deletedGroup = (friendGroups && Array.isArray(friendGroups))
              ? friendGroups.find((g) => g._id === deletedGroupId)
              : null;

            setFriendGroups((prevGroups) => {
              const currentGroups = prevGroups || [];
              return currentGroups.filter((g) => g._id !== deletedGroupId);
            });

            if (deletedGroup && data.data.deletedBy !== currentUser.id) {
                 showSnackbar({
                    message: t("notifications.groupDeletedByHost", { 
                    groupName: deletedGroup.groupName,
                    }),
                    severity: "error",
                });
            } else if (deletedGroup && data.data.reason === "Üye kalmadı") {
                 showSnackbar({
                    message: t("notifications.groupDeletedNoMembers", { 
                    groupName: deletedGroup.groupName,
                    }),
                    severity: "warning",
                });
            }


            if (
              selectedConversation &&
              selectedConversation._id === deletedGroupId
            ) {
              setSelectedConversation(null);
              navigate("/conversation/all/friend-group");
            }
          }
          break;

        case "FRIEND_GROUP_DELETED_SUCCESS":
          if (data.groupId) {
            const deletedGroupId = data.groupId;

           
            if (data.message) {
              showSnackbar({
                message: data.message, 
                severity: "success",
              });
            }
            
            setFriendGroups((prevGroups) => {
              const currentGroups = prevGroups || [];
              return currentGroups.filter((g) => g._id !== deletedGroupId);
            });
            
            if (
              selectedConversation &&
              selectedConversation._id === deletedGroupId
            ) {
              setSelectedConversation(null);
              navigate("/conversation/all/friend-group");
            }
          }
          break;

        case "LEAVE_FRIEND_GROUP_SUCCESS": 
          if (data.groupId) {
            const leftGroupId = data.groupId;
             if (data.message) { 
                showSnackbar({
                    message: data.message,
                    severity: "success",
                });
            }
            setFriendGroups((prevGroups) => {
              const currentGroups = prevGroups || [];
              return currentGroups.filter((g) => g._id !== leftGroupId);
            });
            if (
              selectedConversation &&
              selectedConversation._id === leftGroupId
            ) {
              setSelectedConversation(null);
              navigate("/conversation/all/friend-group");
            }
          }
          break;

        case "FRIEND_REQUEST_RECEIVED":
          showSnackbar({
            message: t("notifications.newFriendRequest", {
              senderName: data.sender?.name || "Biri",
            }),
            severity: "info",
          });
          fetchFriends();
          break;
        case "FRIEND_REQUEST_ACCEPTED_EVENT":
          fetchFriends();
          showSnackbar({
            message: t("notifications.friendRequestAccepted", {
              userName: data.user?.name || "Biri",
            }),
            severity: "success",
          });
          break;
        case "FRIEND_REMOVED_EVENT":
          fetchFriends();
          if (
            selectedConversation?.type === "private" &&
            selectedConversation.id === data.removedFriendId
          ) {
            setSelectedConversation(null);
            navigate("/conversation/all/friend");
          }
          showSnackbar({
            message: t("notifications.friendRemoved", {
              userName: data.removedFriendName || "Biri",
            }),
            severity: "warning",
          });
          break;
        
        case "ACKNOWLEDGEMENT": 
            break;

        default:
          break;
      }
    };
    socket.addEventListener("message", handleWebSocketMessage);
    return () => socket.removeEventListener("message", handleWebSocketMessage);
  }, [
    socket,
    currentUser,
    setFriendGroups,
    showSnackbar,
    t,
    selectedConversation,
    setSelectedConversation,
    navigate,
    friendGroups, 
    friends,
    fetchFriends,
  ]);
}

export function useConversationUrlHandler({
  friends,
  friendGroups,
  setSelectedConversation,
  setSelectedFriend,
  setFriendGroups,
}) {
  const { friendId, groupId: groupIdFromParams } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    if (friendId) setActiveTab(1);
    else if (groupIdFromParams) setActiveTab(2);
    else if (
      path.endsWith("/conversation/all") ||
      path.endsWith("/conversation")
    )
      setActiveTab(0);
    else setActiveTab(0);
  }, [location.pathname, friendId, groupIdFromParams]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchGroupDetailsAndSelect = async (currentGroupId) => {
      try {
        const response = await fetchFriendGroupDetailsAPI(
          token,
          currentGroupId
        );
        const groupData = response.data.group;
        if (groupData) {
          const conversationToSelect = { ...groupData, type: "friendGroup" };
          setSelectedConversation(conversationToSelect);
          setFriendGroups((prevGroups) => {
            const currentGroups = prevGroups || [];
            const existingGroupIndex = currentGroups.findIndex(
              (g) => g._id === groupData._id
            );
            if (existingGroupIndex > -1) {
              return currentGroups.map((g, i) =>
                i === existingGroupIndex ? conversationToSelect : g
              );
            } else {
              return [...currentGroups, conversationToSelect];
            }
          });
        } else {
          navigate("/conversation/all/friend-group");
        }
      } catch (error) {
        navigate("/conversation/all/friend-group");
      }
    };

    if (friendId) {
      let friendToSelect = null;
      if (friends && Array.isArray(friends)) {
        friendToSelect = friends.find((f) => f.id === friendId);
      }

      if (friendToSelect) {
        setSelectedConversation({ ...friendToSelect, type: "private" });
        setSelectedFriend(friendToSelect);
      } else if (location.state?.friend) {
        const friendFromState = location.state.friend;
        if (friendFromState && friendFromState.id === friendId) {
          setSelectedConversation({ ...friendFromState, type: "private" });
          setSelectedFriend(friendFromState);
        }
      }
    } else if (groupIdFromParams) {
      let groupConversation = null;
      if (friendGroups && Array.isArray(friendGroups)) {
        groupConversation = friendGroups.find(
          (g) => g._id === groupIdFromParams
        );
      }

      if (groupConversation) {
        setSelectedConversation({ ...groupConversation, type: "friendGroup" });
        setSelectedFriend(null);
      } else {
        if (friendGroups) { 
             fetchGroupDetailsAndSelect(groupIdFromParams);
        }
      }
    } 
  }, [
    friendId,
    groupIdFromParams,
    friends,
    friendGroups,
    navigate,
    setSelectedConversation,
    setSelectedFriend,
    location.state,
    location.pathname,
    setFriendGroups,
  ]);

  return { activeTab };
}