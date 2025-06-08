import React, { useState, useCallback } from 'react';
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



  const handleCreateGroupDialogOpen = () => {
    setCreateGroupDialogOpen(true);
  }

  const handleCreateGroupDialogClose = useCallback(() => {
    setCreateGroupDialogOpen(false);
    setNewGroupName('');
    setNewGroupDescription('');
    setIsPasswordProtected(false);
    setNewGroupPassword('');
    setMaxMembers(8);
  }, []);

  const handleJoinGroupDialogOpen = useCallback((groupId, requiresPassword) => {
    setSelectedJoinGroupId(groupId); 
    setJoinGroupRequiresPassword(requiresPassword === true);
    setJoinGroupDialogOpen(true);
  }, []); 

  const handleJoinGroupDialogClose = useCallback(() => {
    setJoinGroupDialogOpen(false);
    setJoinPassword('');
    setSelectedJoinGroupId(null);
    setJoinGroupRequiresPassword(false);
  }, []); 

  const handleCreateGroup = useCallback(() => {
    if (!newGroupName.trim()) {
      showSnackbar("Grup adı boş olamaz.", 'warning');
      return;
    }
    const membersCount = Number(maxMembers);
    if (isNaN(membersCount) || membersCount < 2) {
      showSnackbar("Maksimum üye sayısı en az 2 olmalıdır.", 'warning');
      return;
    }

    const groupData = {
      type: "CREATE_GROUP",
      groupName: newGroupName,
      description: newGroupDescription,
      password: isPasswordProtected ? newGroupPassword : null,
      maxMembers: membersCount,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(groupData));
      handleCreateGroupDialogClose();
    } else {
      console.error("WebSocket bağlantısı açık değil, grup oluşturulamıyor.");
      showSnackbar("Grup oluşturulamadı, WebSocket bağlantısı kapalı.", 'error');
    }
  }, [
    newGroupName,
    newGroupDescription,
    isPasswordProtected,
    newGroupPassword,
    maxMembers,
    socket,
    showSnackbar,
    handleCreateGroupDialogClose
  ]);

  const handleJoinGroup = useCallback(() => {
    if (selectedJoinGroupId === null || selectedJoinGroupId === undefined) {
      console.error("HATA: Grup ID'si seçilmedi. Current selectedJoinGroupId:", selectedJoinGroupId);
      showSnackbar("Katılınacak grup seçilmedi.", 'error');
      return;
    }

    if (joinGroupRequiresPassword && !joinPassword.trim()) {
      showSnackbar("Bu grup için şifre girmelisiniz.", 'warning');
      return;
    }

    const joinData = {
      type: "JOIN_GROUP",
      groupId: selectedJoinGroupId,
      password: joinGroupRequiresPassword ? joinPassword : null,
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(joinData));
      handleJoinGroupDialogClose(); // ID burada (başarılı işlem sonrası) null yapılacak
    } else {
      console.error("WebSocket bağlantısı açık değil, gruba katılım başarısız.");
      showSnackbar("Gruba katılım başarısız, WebSocket bağlantısı kapalı.", 'error');
    }
  }, [
    selectedJoinGroupId, 
    joinGroupRequiresPassword,
    joinPassword,
    socket,
    showSnackbar,
    handleJoinGroupDialogClose
  ]);

  return {
    createGroupDialogOpen,
    joinGroupDialogOpen,
    newGroupName,
    newGroupDescription,
    isPasswordProtected,
    newGroupPassword,
    maxMembers,
    joinPassword,
    joinGroupRequiresPassword,
    selectedJoinGroupId,
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
    setMaxMembers,
    setJoinPassword
  };
};