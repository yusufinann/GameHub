import { useState } from 'react';
import { useLobbyContext } from '../../LobbyContext'; 
import { useAuthContext } from '../../../../../shared/context/AuthContext';

export const useLobbyForm = () => {
  const { createLobby } = useLobbyContext();
  const { currentUser } = useAuthContext(); // Mevcut kullanıcı bilgilerini al

  const [formData, setFormData] = useState({
    lobbyName: '',
    eventType: 'normal',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    password: '',
    gameId: '',
    maxMembers: 4, // Varsayılan değer olarak 4 kişi
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    try {
      // Lobi verilerini hazırla
      const lobbyData = {
        lobbyName: formData.lobbyName,
        lobbyType: formData.eventType,
        startTime: formData.eventType === 'event' ? `${formData.startDate}T${formData.startTime}` : null,
        endTime: formData.eventType === 'event' ? `${formData.endDate}T${formData.endTime}` : null,
        password: formData.password,
        game: formData.gameId,
        maxMembers: formData.maxMembers,
        createdBy: currentUser.id, // Mevcut kullanıcının kimliği (ID)
      };
  
      // Lobi oluştur
      await createLobby(lobbyData);
  
      // Başarılı mesajı göster
      setSnackbar({
        open: true,
        message: 'Lobi başarıyla oluşturuldu!',
        severity: 'success',
      });
    } catch (error) {
      // Hata mesajı göster
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Lobi oluşturulurken bir hata oluştu.',
        severity: 'error',
      });
    }
  };

  return {
    formData,
    snackbar,
    setSnackbar,
    handleChange,
    handleSubmit,
  };
};