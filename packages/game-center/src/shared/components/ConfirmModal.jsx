import React from 'react';
import { Box, Modal, Typography, Button, IconButton, CircularProgress, useTheme } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const ConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  confirmButtonColor = 'primary', 
  isLoading = false,
  IconComponent = WarningAmberIcon,
  iconColor, 
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const finalIconColor = iconColor || theme.palette.warning.main;
  const finalConfirmText = confirmText || t('common.confirm', 'Confirm');
  const finalCancelText = cancelText || t('common.cancel', 'Cancel');

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: { xs: '90%', sm: 400, md: 450 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: { xs: 2.5, sm: 3.5, md: 4 },
          borderRadius: '16px',
          textAlign: 'center',
          outline: 'none',
          borderTop: `5px solid ${finalIconColor}`,
        }}
      >
        <IconButton
          aria-label={t('common.close', 'Close')}
          onClick={onClose}
          disabled={isLoading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <IconComponent sx={{ fontSize: 60, color: finalIconColor, mb: 2, mt: 2 }} />

        <Typography id="confirm-modal-title" variant="h5" component="h2" fontWeight="bold" mb={1.5}>
          {title}
        </Typography>

        <Typography id="confirm-modal-description" variant="body1" color="text.secondary" mb={3.5} sx={{ whiteSpace: 'pre-line' }}>
          {message}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            color="inherit"
            size="large"
            disabled={isLoading}
            sx={{
              borderRadius: '12px',
              px: 4,
              minWidth: '120px',
            }}
          >
            {finalCancelText}
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color={confirmButtonColor}
            size="large"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              borderRadius: '12px',
              px: 4,
              minWidth: '120px',
            }}
          >
            {finalConfirmText}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;