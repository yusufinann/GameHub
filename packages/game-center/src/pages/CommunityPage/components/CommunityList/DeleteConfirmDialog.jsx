import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
} from "@mui/material";

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isGroupDeleting,
  t, 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {t("deleteGroupDialogTitle")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {t("deleteGroupDialogMessage")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" disabled={isGroupDeleting}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          autoFocus
          disabled={isGroupDeleting}
        >
          {t("deleteButtonLabel")}
          {isGroupDeleting && (
            <CircularProgress size={20} sx={{ ml: 1, color: "error.main" }} />
          )}{" "}
          {/* Changed color to 'error.main' for consistency */}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
