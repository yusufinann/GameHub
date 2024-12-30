import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLobbyContext } from '../../../../LobbyContext';

export const useLobbyNavigation = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { existingLobby } = useLobbyContext();
  const navigate = useNavigate();

  const handleOpenModal = () => {
    if (existingLobby?.lobbyLink) {
      try {
        const url = new URL(existingLobby.lobbyLink);
        navigate(url.pathname);
      } catch (error) {
        console.error('Invalid lobby link:', error);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return {
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    existingLobby,
  };
};
