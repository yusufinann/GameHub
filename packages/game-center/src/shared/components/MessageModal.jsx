// MessageModal.js
import React from 'react';
import { Box, Modal, Typography, Button, IconButton } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';

const severities = {
  error: {
    icon: ErrorOutlineIcon,
    color: 'error.main',
    defaultTitleKey: 'error', // i18n 
  },
  warning: {
    icon: WarningAmberIcon,
    color: 'warning.main',
    defaultTitleKey: 'common.warningTitle',
  },
  info: {
    icon: InfoOutlinedIcon,
    color: 'info.main',
    defaultTitleKey: 'common.infoTitle',
  },
  success: {
    icon: CheckCircleOutlineIcon,
    color: 'success.main',
    defaultTitleKey: 'common.successTitle',
  },
};

const MessageModal = ({
  open,
  onClose,
  message,
  severity = 'error', // 'error', 'warning', 'info', 'success'
  title, 
}) => {
  const { t } = useTranslation();
  const config = severities[severity] || severities.error;
  const IconComponent = config.icon;
  const modalTitle = title || t(config.defaultTitleKey);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="message-modal-title"
      aria-describedby="message-modal-description"
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
          borderTop: `5px solid ${config.color}`, 
        }}
      >
        <IconButton
          aria-label={t('common.close')}
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>

        <IconComponent sx={{ fontSize: 60, color: config.color, mb: 2, mt: 2 }} />

        <Typography id="message-modal-title" variant="h5" component="h2" fontWeight="bold" mb={1.5}>
          {modalTitle}
        </Typography>

        <Typography id="message-modal-description" variant="body1" color="text.secondary" mb={3.5} sx={{ whiteSpace: 'pre-line' }}>
          {message}
        </Typography>

        <Button
          onClick={onClose}
          variant="contained"
       
          color={severity === 'error' ? 'error' : severity === 'warning' ? 'warning' : 'primary'}
          size="large"
          sx={{
            borderRadius: '12px',
            px: 4,
            minWidth: '120px',
          }}
        >
          {t('common.close')}
        </Button>
      </Box>
    </Modal>
  );
};

export default MessageModal;