import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress
} from '@mui/material';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isGroupDeleting,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {"Delete Group?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete this group? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isGroupDeleting}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" autoFocus disabled={isGroupDeleting}>
          Delete
          {isGroupDeleting && <CircularProgress size={20} sx={{ ml: 1, color: 'error' }} />}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
