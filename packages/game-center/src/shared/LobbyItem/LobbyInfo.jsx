// LobbyInfo.js
import { useEffect, useState } from 'react';
import { Chip } from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

const getTimeInfo = (startDate, startTime, endDate, endTime, eventStatus) => {
  const now = new Date();
  const eventStart = new Date(`${startDate}T${startTime}`);
  const eventEnd = new Date(`${endDate}T${endTime}`);

  // WebSocket durumuna öncelik ver
  if (eventStatus === 'started') return "The event continues";
  if (eventStatus === 'ended') return "Event has ended";

  if (now > eventEnd) return "Event has ended";
  if (now > eventStart) return "The event continues";

  const diff = eventStart - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    // Etkinlik 24 saatten fazla bir süre sonra ise sadece başlangıç tarihini göster
    const eventStartDate = new Date(startDate);
    const formattedDate = eventStartDate.toLocaleDateString('en-US', { // You can adjust locale and options
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return `Starts on ${formattedDate}`;
  } else {
    // 24 saatten az kaldıysa saniyeyi ekle
    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}h`);
    timeParts.push(`${minutes}m`);
    timeParts.push(`${seconds}s`);
    return `Starts in ${timeParts.join(' ')}`;
  }
};

export const LobbyInfo = ({ startDate, startTime, endDate, endTime, eventStatus,isMobile  }) => {
  const [timeInfo, setTimeInfo] = useState(() =>
    getTimeInfo(startDate, startTime, endDate, endTime, eventStatus)
  );

  useEffect(() => {
    const updateTimer = () => {
      const newTimeInfo = getTimeInfo(startDate, startTime, endDate, endTime, eventStatus);
      setTimeInfo(newTimeInfo);
    };

    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [startDate, startTime, endDate, endTime, eventStatus]);

  const getIcon = () => {
    if (timeInfo.startsWith("Starts in") || timeInfo.startsWith("Starts on")) return <ScheduleIcon />; // "Starts on" da eklendi
    if (timeInfo === "The event continues") return <PlayCircleFilledIcon />;
    return <CheckCircleIcon />;
  };

  const getColor = () => {
    if (timeInfo === "Event has ended") return "#ff6b6b";
    if (timeInfo === "The event continues") return "#51cf66";
    return "#fda085";
  };

  return (
    <Chip
      icon={getIcon()}
      label={timeInfo}
      size={isMobile ? 'small' : 'medium'}
      sx={{
        minWidth: {
          xs: '280px',
          sm: '320px',
          md: '80px'
        },
        backgroundColor: getColor(),
        color: 'common.white',
        fontWeight: 'bold',
        fontSize: isMobile ? '0.7rem' : '0.75rem',
        '& .MuiChip-icon': {
          fontSize: isMobile ? '14px' : '16px',
          color: 'common.white'
        },
        flexGrow: isMobile ? 1 : 0,
      }}
    />
  );
};