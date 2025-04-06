import React, { useState } from 'react';
import { Box, Button, Typography, Tabs, Tab} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateLobbyModal from '../../../../../shared/components/CreateLobbyModal';

const CreateLobbyArea = ({ activeTab, setActiveTab,existingLobby }) => { 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue); 
  };

  return (
    <Box
      sx={{
        padding: 2,
        bgcolor: "background.paper",
        boxShadow: 2,
        display: "flex",
        flexDirection: 'column', 
        borderTopLeftRadius: "10px",
        borderTopRightRadius: "10px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          height: "5vh",
          mb: 2, 
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
            padding: "10px 18px", 
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
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        aria-label="lobby tabs"
      >
        <Tab label="All" value="all" />
        <Tab label="Normal" value="normal" />
        <Tab label="Event" value="event" />
        <Tab label="My Groups" value="myGroups" />
      </Tabs>

      {/* Create Lobby Dialog */}
      <CreateLobbyModal
        open={isModalOpen}
        onClose={handleCloseModal}
        existingLobby={existingLobby}
      />
    </Box>
  );
};

export default CreateLobbyArea;