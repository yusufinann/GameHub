import React, { useState } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { mainScreenStyles } from './styles';
import ImageSlider from './components/ImageSlider';
import HeroContent from './components/HeroContent';
import CreateLobbyModal from './components/CreateLobbyModal'
import { useLobbyContext } from '../context';

const CreateLobbyArea = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { existingLobby } = useLobbyContext();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);
  const theme = useTheme();
  const styles = mainScreenStyles(theme);

  return (
    <Box sx={styles.container}>     
      <Box sx={styles.overlay} />
      <Container maxWidth="md">
        <HeroContent 
          onCreateLobby={handleOpenModal}
          existingLobby={existingLobby}
        />
      </Container>
      <Box sx={styles.bottomBar} />
      <CreateLobbyModal 
        open={isModalOpen} 
        onClose={handleCloseModal}
        existingLobby={existingLobby}
      />
       <ImageSlider />
    </Box>
  );
};

export default CreateLobbyArea;