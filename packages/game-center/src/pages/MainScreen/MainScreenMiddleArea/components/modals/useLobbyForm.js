import { useState } from 'react';
import { useLobbyContext } from '../../LobbyContext';

export const useLobbyForm = () => {
  const { setExistingLobby,createLobby } = useLobbyContext();
  const [formData, setFormData] = useState({
    lobbyName: '',
    eventType: 'normal',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    password: '',
    gameId: '',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [lobbyCode, setLobbyCode] = useState('');
  const [lobbyLink, setLobbyLink] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
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
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const generatedLink = `${window.location.origin}/lobby/${generatedCode}`;

      const lobbyData = {
        lobbyName: formData.lobbyName,
        eventType: formData.eventType,
        startDate: formData.startDate,
        startTime: formData.startTime,
        endDate: formData.endDate,
        endTime: formData.endTime,
        password: formData.password,
        gameId: formData.gameId,
        lobbyCode: generatedCode,
        lobbyLink: generatedLink,
      };

      // Save to localStorage and context
      localStorage.setItem('userLobby', JSON.stringify(lobbyData));
      setExistingLobby(lobbyData);

      setLobbyCode(generatedCode);
      setLobbyLink(generatedLink);
      setShowSuccess(true);
      createLobby(lobbyData);
      console.log(lobbyData);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Lobi oluşturulurken bir hata oluştu',
        severity: 'error',
      });
    }
  };

  return {
    formData,
    showSuccess,
    lobbyCode,
    lobbyLink,
    snackbar,
    setSnackbar,
    handleChange,
    handleSubmit,
    setShowSuccess
  };
};