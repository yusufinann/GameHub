import React from 'react';
import { Dialog, Slide, Snackbar, Alert, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import LobbyForm from './components/LobbyForm';
import { SuccessScreen } from './components/SuccessScreen';
import { useLobbyContext } from '../../LobbyContext';
import { useLobbyForm } from './useLobbyForm';

const CreateLobbyModal = ({ open, onClose }) => {
  const { existingLobby } = useLobbyContext();
  const {
    formData,
    showSuccess,
    lobbyCode,
    lobbyLink,
    snackbar,
    setSnackbar,
    handleChange,
    handleSubmit
  } = useLobbyForm();

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        maxWidth="sm"
        fullWidth
      >
        {!showSuccess && !existingLobby && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8, color: 'rgba(34,193,195,0.8)' }}
          >
            <CloseIcon />
          </IconButton>
        )}

        {existingLobby ? (
          <SuccessScreen
            lobbyCode={existingLobby.lobbyCode}
            lobbyLink={existingLobby.lobbyLink}
            setSnackbar={setSnackbar}
            onClose={onClose}
          />
        ) : !showSuccess ? (
          <LobbyForm
            formData={formData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            onClose={onClose}
          />
        ) : (
          <SuccessScreen
            lobbyCode={lobbyCode}
            lobbyLink={lobbyLink}
            setSnackbar={setSnackbar}
            onClose={onClose}
          />
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateLobbyModal;