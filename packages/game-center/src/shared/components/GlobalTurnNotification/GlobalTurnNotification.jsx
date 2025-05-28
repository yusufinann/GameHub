import React, { useCallback } from 'react';
import { Snackbar, Alert, Button, Box, Typography, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HangmanNotificationIcon from './HangmanNotificationIcon';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useTurnNotification } from './context';

const swing = keyframes`
  0% { transform: rotate(0deg); }
  15% { transform: rotate(5deg); }
  30% { transform: rotate(-5deg); }
  45% { transform: rotate(3deg); }
  60% { transform: rotate(-3deg); }
  75% { transform: rotate(1deg); }
  85% { transform: rotate(-1deg); }
  100% { transform: rotate(0deg); }
`;

const GlobalTurnNotification = () => {
  const { turnNotification, hideTurnNotification } = useTurnNotification(); 
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoToLobby = useCallback(() => {
    if (turnNotification.lobbyCode) {
      navigate(`/lobby/${turnNotification.lobbyCode}`);
    }
    hideTurnNotification();
  }, [turnNotification.lobbyCode, navigate, hideTurnNotification]);

  const handleClose = useCallback(
    (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
      hideTurnNotification();
    },
    [hideTurnNotification]
  );

  if (!turnNotification.show) {
    return null;
  }

  const lobbyNameDisplay = turnNotification.lobbyName || t('notifications.aGame', 'a game');
  const message = turnNotification.message || t('notifications.yourTurnInLobby', { lobbyName: lobbyNameDisplay });

  return (
    <Snackbar
      open={turnNotification.show}
      autoHideDuration={12000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 10,
        mt: { xs: 1, sm: 2 },
        width: { xs: '95%', sm: 'auto' },
        maxWidth: { sm: '500px' },
      }}
    >
      <Alert
        onClose={handleClose}
        severity="info"
        variant="filled"
        icon={false}
        sx={{
          width: '100%',
          boxShadow: (theme) => theme.shadows[12],
          borderRadius: '12px',
          padding: '16px 24px',
          background: (theme) =>
            `linear-gradient(145deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
          color: 'common.white',
          '.MuiAlert-message': {
            padding: '0px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
          },
          '.MuiAlert-action': {
            alignSelf: 'flex-start',
            paddingTop: '4px',
            marginRight: '-8px',
            '& .MuiSvgIcon-root': {
              color: 'common.white',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box
            sx={{
              marginRight: 2,
              animation: `${swing} 2.5s ease-in-out infinite`,
              animationDelay: '0.5s',
              transformOrigin: 'top center',
              fontSize: '3rem',
              lineHeight: 1,
            }}
          >
            <HangmanNotificationIcon sx={{ fontSize: 'inherit' }} />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h6"
              component="div"
              sx={{ fontWeight: 'bold', lineHeight: 1.3 }}
            >
              {t('notifications.yourTurn')}
            </Typography>
            <Typography variant="body1" component="div" sx={{ opacity: 0.9, mt: 0.5 }}>
              {message}
            </Typography>
            {turnNotification.lobbyName && !turnNotification.message && (
              <Typography variant="caption" component="div" sx={{ opacity: 0.7, mt: 0.2 }}>
                {t('notifications.lobbyLabel', 'Lobby')}: {turnNotification.lobbyName}
              </Typography>
            )}
          </Box>
          <Button
            size="medium"
            onClick={handleGoToLobby}
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            sx={{
              fontWeight: 'bold',
              marginLeft: 2,
              alignSelf: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
              },
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              textTransform: 'none',
              padding: '8px 16px',
            }}
          >
            {t('notifications.goToLobby', 'Go to Lobby')}
          </Button>
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default GlobalTurnNotification;