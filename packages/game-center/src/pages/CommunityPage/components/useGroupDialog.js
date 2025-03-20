// hooks/useGroupDialog.js
import { useState, useCallback } from 'react';
import { useWebSocket } from '../../../shared/context/WebSocketContext/context';

export const useGroupDialog = (showSnackbar) => {
  const { socket } = useWebSocket();
  
  // Group dialog states
  const [createGroupDialogOpen, setCreateGroupDialogOpen] = useState(false);
  const [joinGroupDialogOpen, setJoinGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [selectedJoinGroupId, setSelectedJoinGroupId] = useState(null);

  // Group dialog handlers
  const handleCreateGroupDialogOpen = () => setCreateGroupDialogOpen(true);
  const handleCreateGroupDialogClose = () => setCreateGroupDialogOpen(false);
  
  const handleJoinGroupDialogOpen = useCallback((groupId) => {
    setSelectedJoinGroupId(groupId);
    setJoinGroupDialogOpen(true);
  }, []);
  
  const handleJoinGroupDialogClose = () => setJoinGroupDialogOpen(false);

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) {
      showSnackbar("Grup adı boş olamaz.", 'warning');
      return;
    }
    
    const groupData = {
      type: "CREATE_GROUP",
      groupName: newGroupName,
      description: newGroupDescription,
      password: isPasswordProtected ? newGroupPassword : null,
    };
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(groupData));
      handleCreateGroupDialogClose();
      setNewGroupName('');
      setNewGroupDescription('');
      setIsPasswordProtected(false);
      setNewGroupPassword('');
    } else {
      console.error("WebSocket bağlantısı açık değil, grup oluşturulamıyor.");
      showSnackbar("Grup oluşturulamadı, WebSocket bağlantısı kapalı.", 'error');
    }
  };

  const handleJoinGroup = () => {
    if (!selectedJoinGroupId) {
      console.error("Grup ID'si seçilmedi.");
      return;
    }
    
    const joinData = {
      type: "JOIN_GROUP",
      groupId: selectedJoinGroupId,
      password: joinPassword || null,
    };
    
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(joinData));
      handleJoinGroupDialogClose();
      setJoinPassword('');
      setSelectedJoinGroupId(null);
    } else {
      console.error("WebSocket bağlantısı açık değil, gruba katılım başarısız.");
      showSnackbar("Gruba katılım başarısız, WebSocket bağlantısı kapalı.", 'error');
    }
  };

  return {
    createGroupDialogOpen,
    joinGroupDialogOpen,
    newGroupName,
    newGroupDescription,
    isPasswordProtected,
    newGroupPassword,
    joinPassword,
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
    setJoinPassword
  };
};