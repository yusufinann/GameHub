import { useState, useCallback } from 'react';
import { useWebSocket } from '../../../shared/context/WebSocketContext/context';
import { useSnackbar } from '../../../shared/context/SnackbarContext';

export const useGroupDialog = () => {
  const { socket } = useWebSocket();
  const { showSnackbar } = useSnackbar();
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [joinGroupDialogOpen, setJoinGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [maxMembers, setMaxMembers] = useState(8);
  const [joinPassword, setJoinPassword] = useState('');
  const [selectedJoinGroupId, setSelectedJoinGroupId] = useState(null);
  const [joinGroupRequiresPassword, setJoinGroupRequiresPassword] = useState(false);


  const handleCreateGroupDialogOpen = () => setCreateGroupDialogOpen(true);
  const handleCreateGroupDialogClose = () => {
      setCreateGroupDialogOpen(false);
      setNewGroupName('');
      setNewGroupDescription('');
      setIsPasswordProtected(false);
      setNewGroupPassword('');
      setMaxMembers(8); 
  }

  const handleJoinGroupDialogOpen = useCallback((groupId, requiresPassword) => {
    setSelectedJoinGroupId(groupId);
    const passwordRequired = requiresPassword === true;
    setJoinGroupRequiresPassword(passwordRequired);
    setJoinGroupDialogOpen(true);
  }, []);

  const handleJoinGroupDialogClose = () => {
      setJoinGroupDialogOpen(false);
      setJoinPassword('');
      setSelectedJoinGroupId(null);
      setJoinGroupRequiresPassword(false);
  }

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      showSnackbar("Grup adı boş olamaz.", 'warning'); // "Group name cannot be empty."
      return;
    }
    // Ensure maxMembers is a valid number >= 2
    const membersCount = Number(maxMembers);
    if (isNaN(membersCount) || membersCount < 2) {
        showSnackbar("Maksimum üye sayısı en az 2 olmalıdır.", 'warning'); // "Maximum members must be at least 2."
        return;
    }

    const groupData = {
      type: "CREATE_GROUP",
      groupName: newGroupName,
      description: newGroupDescription,
      password: isPasswordProtected ? newGroupPassword : null,
      maxMembers: membersCount, // <-- Send validated maxMembers
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(groupData));
      handleCreateGroupDialogClose(); // Close and reset fields
    } else {
      console.error("WebSocket bağlantısı açık değil, grup oluşturulamıyor."); // "WebSocket connection is not open, group cannot be created."
      showSnackbar("Grup oluşturulamadı, WebSocket bağlantısı kapalı.", 'error'); // "Failed to create group, WebSocket connection is closed."
    }
  };

  const handleJoinGroup = () => {
    if (!selectedJoinGroupId) {
      console.error("Grup ID'si seçilmedi."); // "Group ID not selected."
      showSnackbar("Katılınacak grup seçilmedi.", 'error'); // "No group selected to join."
      return;
    }

    // If the group requires a password, ensure one is provided
    if (joinGroupRequiresPassword && !joinPassword.trim()) {
        showSnackbar("Bu grup için şifre girmelisiniz.", 'warning'); // "You must enter a password for this group."
        return;
    }

    const joinData = {
      type: "JOIN_GROUP",
      groupId: selectedJoinGroupId,
      // Send password only if required, otherwise send null or omit
      password: joinGroupRequiresPassword ? joinPassword : null,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(joinData));
      handleJoinGroupDialogClose(); // Close and reset fields
    } else {
      console.error("WebSocket bağlantısı açık değil, gruba katılım başarısız."); // "WebSocket connection is not open, failed to join group."
      showSnackbar("Gruba katılım başarısız, WebSocket bağlantısı kapalı.", 'error'); // "Failed to join group, WebSocket connection is closed."
    }
  };

  return {
    createGroupDialogOpen,
    joinGroupDialogOpen,
    newGroupName,
    newGroupDescription,
    isPasswordProtected,
    newGroupPassword,
    maxMembers, // <-- Expose state
    joinPassword,
    joinGroupRequiresPassword, // <-- Expose state
    handleCreateGroupDialogOpen,
    handleCreateGroupDialogClose,
    handleJoinGroupDialogOpen,
    handleJoinGroupDialogClose,
    handleCreateGroup,
    handleJoinGroup,
    setNewGroupName,
    setNewGroupDescription,
    setIsPasswordProtected,
    setNewGroupPassword,
    setMaxMembers, // <-- Expose setter
    setJoinPassword
  };
};