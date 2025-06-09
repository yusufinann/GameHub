import { useState, useCallback } from "react";
import { useSnackbar } from "../../../shared/context/SnackbarContext";
import { fetchMyFriendGroupsAPI, createFriendGroupAPI } from "../api"; 

export const useFriendGroupDialog = (setFriendGroupsExternally) => {
  const [createFriendGroupDialogOpen, setCreateFriendGroupDialogOpen] = useState(false);
  const [newFriendGroupName, setNewFriendGroupName] = useState("");
  const [newFriendGroupDescription, setNewFriendGroupDescription] = useState("");
  const [friendGroupPassword, setFriendGroupPassword] = useState("");
  const { showSnackbar } = useSnackbar();
  const [friendGroupsLoading, setFriendGroupsLoading] = useState(true);

  const handleCreateFriendGroupDialogOpen = useCallback(() => {
    setCreateFriendGroupDialogOpen(true);
  }, []);

  const handleCreateFriendGroupDialogClose = useCallback(() => {
    setCreateFriendGroupDialogOpen(false);
    setNewFriendGroupName("");
    setNewFriendGroupDescription("");
    setFriendGroupPassword("");
  }, []);

  const fetchFriendGroups = useCallback(async () => {
    
    setFriendGroupsLoading(true);
    const token = localStorage.getItem("token");
    if (!token) {
        showSnackbar({ message: "Authentication token not found. Please log in.", severity: "error" });
        setFriendGroupsLoading(false);
        setFriendGroupsExternally([]);
        return;
    }
    try {
      const response = await fetchMyFriendGroupsAPI(token);
      const fetchedGroups = response.data.groups.map((g) => ({
        _id: g._id,
        groupName: g.groupName,
        description: g.description,
        host: g.host?._id || g.host, 
        members: g.members,
        invitationLink: g.invitationLink,
        type: "friendGroup",
      }));
      setFriendGroupsExternally(fetchedGroups);
    } catch (error) {
      console.error("Friend Groups yüklenirken hata:", error.response?.data || error.message);
      showSnackbar({ message: "Failed to load friend groups.", severity: "error" });
      setFriendGroupsExternally([]); 
    } finally {
      setFriendGroupsLoading(false);
    }
  }, [setFriendGroupsExternally, showSnackbar]); 

  const handleCreateFriendGroup = useCallback(async ({ groupName, description, password, invitedFriends }) => {
    const token = localStorage.getItem("token");
    if (!token) {
        showSnackbar({ message: "Authentication token not found. Please log in.", severity: "error" });
        return;
    }
    try {
      const response = await createFriendGroupAPI(token, {
        groupName,
        description,
        password,
        maxMembers: 8, 
        invitedFriends,
      });
      if (response.status === 201) {
        handleCreateFriendGroupDialogClose();
        fetchFriendGroups();
      } else {
        
        showSnackbar({ message: response.data?.message || "Failed to create Friend Group.", severity: "error" });
      }
    } catch (error) {
      console.error("Friend Group creation error:", error.response?.data || error.message);
      showSnackbar({ message: error.response?.data?.message || "Error creating Friend Group.", severity: "error" });
    }
  }, [showSnackbar, fetchFriendGroups, handleCreateFriendGroupDialogClose]);

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
    fetchFriendGroups,
  };
};