import React, { useState } from 'react';
import { Box, Button, TextField, Tabs, Tab, useTheme, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search'; 
import CreateLobbyModal from '../../../../../shared/components/CreateLobbyModal';
import { useTranslation } from 'react-i18next';


const CreateLobbyArea = ({ activeTab, setActiveTab, existingLobby, searchTerm, onSearchTermChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();
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
        borderTopLeftRadius: theme.shape.borderRadius,
        borderTopRightRadius: theme.shape.borderRadius,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '5vh', 
          mb: 2,
          gap: 2, 
        }}
      >
        <TextField
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          placeholder={t("Search Lobbies by Name...")}
          variant="outlined"
          size="small"
          sx={{
            flexGrow: 1, 
            maxWidth: '60%', 
            '& .MuiOutlinedInput-root': {
              borderRadius: theme.shape.borderRadius,
              backgroundColor: theme.palette.background.default, 
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
          sx={{
            borderRadius: theme.shape.borderRadius,
            py: 1,
            px: 2,
            fontWeight: 'bold',
            boxShadow: 3,
            flexShrink: 0, 
            background: (thm) => 
              `linear-gradient(45deg, 
                ${thm.palette.primary.main} 30%,  
                ${thm.palette.primary.light} 90%)`,
            '&:hover': {
              background: (thm) =>
                `linear-gradient(45deg, 
                  ${thm.palette.primary.dark} 30%, 
                  ${thm.palette.primary.main} 90%)`,
              transform: 'translateY(-2px)',
              transition: 'all 0.3s',
            },
          }}
        >
          {existingLobby ? t('Go to your Lobby') : t('Create A Lobby')}
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
        <Tab label={t("All")} value="all" />
        <Tab label={t("Normal")} value="normal" />
        <Tab label={t("Event")} value="event" />
        <Tab label={t("My Groups")} value="myGroups" />
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