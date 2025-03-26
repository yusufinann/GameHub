import React, { useState } from 'react';
import { Box, Button, Typography} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useLobbyContext } from '../context';
import CreateLobbyModal from '../../../../shared/CreateLobbyModal';

const CreateLobbyArea = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { existingLobby } = useLobbyContext();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <Box
      sx={{
        padding: 2,
        bgcolor: "background.paper",
        boxShadow: 2,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "5vh",
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
      }}
    >
      <Typography variant="h6" fontWeight="bold" color="primary">
        Lobby Creator
      </Typography>
      
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenModal}
        sx={{
          borderRadius: "20px",
          padding: "18px 24px",
          fontWeight: "bold",
          boxShadow: 3,
          background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
          '&:hover': {
            background: "linear-gradient(45deg, #1565C0 30%, #0288D1 90%)",
            transform: "translateY(-2px)",
            transition: "all 0.3s"
          }
        }}
      >
       {existingLobby ? 'Go your Lobby' : 'Create A Lobby'}
      </Button>

      {/* Create Lobby Dialog */}
      <CreateLobbyModal
        open={isModalOpen} 
        onClose={handleCloseModal}
        existingLobby={existingLobby}
      />

      {/* Success Screen Dialog */}
   
    </Box>
  );
};

export default CreateLobbyArea;