import React from 'react';
import { Box, Container } from '@mui/material';
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

  return (
    <Box sx={mainScreenStyles.container}>     
      <Box sx={mainScreenStyles.overlay} />
      <Container maxWidth="md">
        <HeroContent 
          onCreateLobby={handleOpenModal}
          existingLobby={existingLobby}
        />
      </Container>
      <Box sx={mainScreenStyles.bottomBar} />
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