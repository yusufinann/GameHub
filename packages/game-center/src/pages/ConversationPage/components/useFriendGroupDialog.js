import { useState } from "react";
import axios from "axios";
import { useFriendsContext } from "../../Profile/context";
import { useSnackbar } from "../../../shared/context/SnackbarContext";

export const useFriendGroupDialog = (friendGroups, setFriendGroups) => {
  const { friends: contextFriends, incomingRequests } = useFriendsContext();
  const [createFriendGroupDialogOpen, setCreateFriendGroupDialogOpen] = useState(false);
  const [newFriendGroupName, setNewFriendGroupName] = useState("");
  const [newFriendGroupDescription, setNewFriendGroupDescription] = useState("");
  const [friendGroupPassword, setFriendGroupPassword] = useState("");
  const {showSnackbar}=useSnackbar();
 
  const [friends, setFriends] = useState(contextFriends);
  const [friendGroupsLoading, setFriendGroupsLoading] = useState(true);

  const handleCreateFriendGroupDialogOpen = () => {
    setCreateFriendGroupDialogOpen(true);
  };

  const handleCreateFriendGroupDialogClose = () => {
    setCreateFriendGroupDialogOpen(false);
    setNewFriendGroupName("");
    setNewFriendGroupDescription("");
    setFriendGroupPassword("");
  };

  const fetchFriendGroups = async () => {
    setFriendGroupsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/friend/friendgroups/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedGroups = response.data.groups.map((g) => ({
        _id: g._id,
        groupName: g.groupName,
        description: g.description,
        host: g.host._id,
        members: g.members,
        invitationLink: g.invitationLink,
        type: "friendGroup",
      }));
      setFriendGroups(fetchedGroups);
    } catch (error) {
      console.error("Friend Groups yüklenirken hata:", error);
      setFriendGroups([]);
    }
    setFriendGroupsLoading(false);
  };

  const handleCreateFriendGroup = async ({ groupName, description, password, invitedFriends }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:3001/api/friend/friendgroup",
        {
          groupName,
          description,
          password,
          maxMembers: 50,
          invitedFriends,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 201) {
        showSnackbar({message:"Friend Group created successfully!", severity:"success"});
        handleCreateFriendGroupDialogClose();
        fetchFriendGroups();
      } else {
        showSnackbar("Failed to create Friend Group.", "error");
      }
    } catch (error) {
      console.error("Friend Group creation error:", error);
      showSnackbar({message:"Error creating Friend Group.",severity: "error"});
    }
  };

  return {
    createFriendGroupDialogOpen,
    newFriendGroupName,
    newFriendGroupDescription,
    friendGroupPassword,
    handleCreateFriendGroupDialogOpen,
    handleCreateFriendGroupDialogClose,
    handleCreateFriendGroup,
    setNewFriendGroupName,
    setNewFriendGroupDescription,
    setFriendGroupPassword,
    friendGroupsLoading,
    friendGroups,
    setFriends,
    friends,
    incomingRequests,
    setFriendGroupsLoading,
    fetchFriendGroups,
  };
};
