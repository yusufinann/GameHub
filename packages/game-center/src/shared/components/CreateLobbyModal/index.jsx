import React from 'react';
import { Dialog, Slide, Snackbar, Alert, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useLobbyForm } from './useLobbyForm';
import LobbyForm from './LobbyForm';
import { SuccessScreen } from './SuccessScreen';
import { useLobbyContext } from '../../context/LobbyContext/context';


const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateLobbyModal = ({ open, onClose }) => {
  const { existingLobby } = useLobbyContext();
  const {
    formData,
    snackbar,
    setSnackbar,
    handleChange,
    handleSubmit,
    setFormData, 
    isCreatingLobby
  } = useLobbyForm();

  const handleSnackbarClose = (event, reason) => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        aria-labelledby={existingLobby ? "success-dialog-title" : "create-lobby-dialog-title"}
        aria-describedby={existingLobby ? "success-dialog-description" : "create-lobby-dialog-description"}
      >
        {!existingLobby && (
          <IconButton
            aria-label="close"
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
        ) : (
          <LobbyForm
            formData={formData}
            setFormData={setFormData}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            onClose={onClose} 
            isCreatingLobby={isCreatingLobby}
          />
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled" 
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateLobbyModal;