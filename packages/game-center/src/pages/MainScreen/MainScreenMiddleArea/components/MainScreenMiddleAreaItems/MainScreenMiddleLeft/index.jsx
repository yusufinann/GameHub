import React from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { useLobbyNavigation } from './components/useLobbyNavigation';
import { mainScreenStyles } from './styles';
import ImageSlider from './components/ImageSlider';
import HeroContent from './components/HeroContent';
import CreateLobbyModal from '../../modals';


const MainScreenMiddleLeft = () => {
  const {
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
    existingLobby
  } = useLobbyNavigation();
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

export default MainScreenMiddleLeft;