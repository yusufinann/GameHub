import React, { useState, useEffect} from 'react';
import { Box, Typography, IconButton, Collapse, useTheme } from '@mui/material';
import {
  HourglassEmpty,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import TimerIcon from '@mui/icons-material/Timer';

const LobbyTimer = ({ lobbyInfo,t }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [eventStatus, setEventStatus] = useState('upcoming');
  const [isOpen, setIsOpen] = useState(true);
  const theme = useTheme();

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

        if (eventStatus === 'ended' && remaining.total <= 0) {
          clearInterval(timerInterval);
        }
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [lobbyInfo, eventStatus]);

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
        <IconButton
          onClick={toggleTimer}
          sx={{
            borderRadius: "50%",
            position: 'absolute',
            bottom: isOpen ? 'auto' : -20,
            top: isOpen ? -20 : 'auto',
            left: '50%',
            background: isOpen
              ? `linear-gradient(135deg, ${theme.palette.primary.darker}, ${theme.palette.success.main})`
              : `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
            color: theme.palette.text.contrast,
            boxShadow: `0 2px 5px ${theme.palette.background.elevation[1]}`,
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

        <Collapse in={isOpen} timeout={300} sx={{ width: '100%' }}>
          <Box
            sx={{
              background: `${theme.palette.primary.light}20`,
              borderRadius: '12px',
              border: `1px solid ${theme.palette.primary.light}30`,
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
                <Typography variant="body2" sx={{ mr: 1, fontWeight: 'medium', color: theme.palette.text.contrast }}>
                  {eventStatus === 'upcoming' ? t('Event starts in') : t('Event ends in')}
                </Typography>

                {timeRemaining.days > 0 && (
                  <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                    <Typography
                      variant="h6"
                      component="span"
                      sx={{
                        fontWeight: 'bold',
                        color: theme.palette.text.contrast
                      }}
                    >
                      {timeRemaining.days}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ color: `${theme.palette.text.contrast}D9` }}>Gün</Typography>
                  </Box>
                )}

                <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.text.contrast
                    }}
                  >
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: `${theme.palette.text.contrast}D9` }}>{t("Hours")}</Typography>
                </Box>

                <Typography variant="h6" sx={{ mx: -0.5, color: theme.palette.text.contrast }}>:</Typography>

                <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: theme.palette.text.contrast
                    }}
                  >
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: `${theme.palette.text.contrast}D9` }}>{t("Minute")}</Typography>
                </Box>

                <Typography variant="h6" sx={{ mx: -0.5, color: theme.palette.text.contrast }}>:</Typography>

                <Box sx={{ textAlign: 'center', px: { xs: 0.5, sm: 1 } }}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      fontWeight: 'bold',
                      color: timeRemaining.minutes < 5 && eventStatus === 'ongoing'
                        ? theme.palette.error.light
                        : theme.palette.text.contrast,
                      animation: timeRemaining.minutes < 5 && eventStatus === 'ongoing'
                        ? 'pulse 2s infinite'
                        : 'none'
                    }}
                  >
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ color: `${theme.palette.text.contrast}D9` }}>{t("Second")}</Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
                <HourglassEmpty sx={{ color: theme.palette.error.light }} />
                <Typography
                  variant="body1"
                  sx={{
                    color: theme.palette.error.light,
                    fontWeight: 'medium'
                  }}
                >
                  {t("This event is over")}
                </Typography>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </>
  );
};

export default LobbyTimer;