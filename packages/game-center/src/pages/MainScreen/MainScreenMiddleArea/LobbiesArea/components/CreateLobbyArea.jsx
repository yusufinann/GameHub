import React, {useState} from 'react';
import { Box, Button, Typography, Tabs, Tab, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CreateLobbyModal from '../../../../../shared/components/CreateLobbyModal';

const CreateLobbyArea = ({ activeTab, setActiveTab, existingLobby }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleTabChange = (e, newVal) => setActiveTab(newVal);

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: theme.palette.background.paper,
        boxShadow: 2,
        display: 'flex',
        flexDirection: 'column',
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '5vh',
          mb: 2,
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          color={theme.palette.primary.text}       
        >
          Lobby Creator
        </Typography>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 2,
            fontWeight: 'bold',
            boxShadow: 3,
            background: (theme) =>
              `linear-gradient(45deg, 
                ${theme.palette.primary.main} 30%,  
                ${theme.palette.primary.light} 90%)`,
            '&:hover': {
              background: (theme) =>
                `linear-gradient(45deg, 
                  ${theme.palette.primary.dark} 30%, 
                  ${theme.palette.primary.main} 90%)`,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s',
            },
          }}
        >
          {existingLobby ? 'Go to your Lobby' : 'Create A Lobby'}
        </Button>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="secondary"
        sx={{
          '& .MuiTab-root': {
            color: theme.palette.mode === 'light' ? theme.palette.text.secondary : theme.palette.text.primary,
            '&.Mui-selected': {
              color: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main,
              fontWeight: 'bold'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.main : theme.palette.secondary.main
          }
        }}
        variant="fullWidth"
        aria-label="lobby tabs"
      >
        <Tab label="All" value="all" />
        <Tab label="Normal" value="normal" />
        <Tab label="Event" value="event" />
        <Tab label="My Groups" value="myGroups" />
      </Tabs>

      <CreateLobbyModal
        open={isModalOpen}
        onClose={handleCloseModal}
        existingLobby={existingLobby}
      />
    </Box>
  );
};

export default CreateLobbyArea;