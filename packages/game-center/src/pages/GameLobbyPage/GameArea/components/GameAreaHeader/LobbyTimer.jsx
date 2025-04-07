import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Snackbar, Alert, IconButton, Collapse } from '@mui/material';
import {
  HourglassEmpty,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import TimerIcon from '@mui/icons-material/Timer';
const LobbyTimer = ({ lobbyInfo }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showEndingSoon, setShowEndingSoon] = useState(false);
  const [eventStatus, setEventStatus] = useState('upcoming');
  const [isOpen, setIsOpen] = useState(true);

  const alertDismissedRef = useRef(false);

  useEffect(() => {
    if (lobbyInfo.lobbyType === 'event' && lobbyInfo.endTime) {
      const calculateTimeRemaining = () => {
        const now = new Date();
        const startTime = lobbyInfo.startTime ? new Date(lobbyInfo.startTime) : null;
        const endTime = new Date(lobbyInfo.endTime);

        if (startTime) {
          if (now < startTime) {
            setEventStatus('upcoming');
          } else if (now >= startTime && now < endTime) {
            setEventStatus('ongoing');
          } else {
            setEventStatus('ended');
          }
        } else {
          setEventStatus(now >= endTime ? 'ended' : 'ongoing');
        }

        let targetTime = eventStatus === 'upcoming' ? startTime : endTime;
        const timeDiff = targetTime - now;
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (eventStatus === 'ongoing' &&
            (endTime - now) <= fiveMinutesInMs &&
            (endTime - now) > 0 &&
            !alertDismissedRef.current) {
          setShowEndingSoon(true);
        }

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

          return { days, hours, minutes, seconds, total: timeDiff };
        }

        return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      };

      setTimeRemaining(calculateTimeRemaining());

      const timerInterval = setInterval(() => {
        const remaining = calculateTimeRemaining();
        setTimeRemaining(remaining);

        if (eventStatus === 'ended') {
          clearInterval(timerInterval);
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [lobbyInfo, eventStatus]);

  const handleCloseAlert = () => {
    setShowEndingSoon(false);
    alertDismissedRef.current = true;
  };

  const toggleTimer = () => {
    setIsOpen(!isOpen);
  };


  if (lobbyInfo.lobbyType !== 'event') {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Toggle button centered at the bottom edge */}
        <IconButton
          onClick={toggleTimer}
          sx={{
            borderRadius: "50%",
            position: 'absolute',
            bottom: isOpen ? 'auto' : -20,
            top: isOpen ? -20 : 'auto',
            left: '50%',

            background: isOpen
            ? "linear-gradient(135deg, #328761, #4CAF50)"
            : "linear-gradient(135deg, #b2ebf2, #80deea)",
            color: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            width: 40,
            height: 40,
            '&:hover': {
              opacity: 0.9,
            },
            zIndex: 2,
            transform: 'translateX(-50%)',
          }}
        >
          {isOpen ? <ExpandLessIcon /> : <TimerIcon />}
        </IconButton>

        {/* Collapsible timer content */}
        <Collapse in={isOpen} timeout={300} sx={{ width: '100%' }}>
          <Box
            sx={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
              p: 1,
              display: 'flex',
              justifyContent: 'center',
              maxWidth: '600px',
              width: '100%',
              mx: 'auto',
              position: 'relative',
              mt: 2
            }}
          >

            {/* Display countdown if time remaining */}
            {eventStatus !== 'ended' && timeRemaining?.total > 0 ? (
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 0.5, sm: 1.5 },
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  pt: 2,
                  pb: 1
                }}
              >
                <Typography variant="body2" sx={{ mr: 1, fontWeight: 'medium', color: 'white' }}>
                  {eventStatus === 'upcoming' ? 'Event starts in:' : 'Event ends in:'}
                </Typography>

                {timeRemaining.days > 0 && (
                  <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{
                        fontWeight: 'bold',
                        color: 'white'
                      }}
                    >
                      {timeRemaining.days}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.85)' }}>Gün</Typography>
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.85)' }}>Saat</Typography>
                </Box>

                <Typography variant="h6" sx={{ mx: -0.5, color: 'white' }}>:</Typography>

                <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.85)' }}>Dakika</Typography>
                </Box>

                <Typography variant="h6" sx={{ mx: -0.5, color: 'white' }}>:</Typography>

                <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: timeRemaining.minutes < 5 && eventStatus === 'ongoing'
                        ? '#ffcdd2'
                        : 'white',
                      animation: timeRemaining.minutes < 5 && eventStatus === 'ongoing'
                        ? 'pulse 2s infinite'
                        : 'none'
                    }}
                  >
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: 'rgba(255,255,255,0.85)' }}>Saniye</Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                <HourglassEmpty sx={{ color: '#ffcdd2' }} />
                <Typography
                  variant="body1"
                  sx={{
                    color: '#ffcdd2',
                    fontWeight: 'medium'
                  }}
                >
                  Bu etkinlik sona erdi
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>

      {/* Alert when 5 minutes remaining */}
      <Snackbar
        open={showEndingSoon}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={handleCloseAlert}
      >
        <Alert
          severity="warning"
          onClose={handleCloseAlert}
          variant="filled"
          elevation={6}
          sx={{
            width: '100%',
            fontSize: '0.875rem',
            '& .MuiAlert-icon': {
              fontSize: '1.25rem'
            }
          }}
        >
          Etkinlik 5 dakika içinde sona erecek!
        </Alert>
      </Snackbar>
    </>
  );
};

export default LobbyTimer;