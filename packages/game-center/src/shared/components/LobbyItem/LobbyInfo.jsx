import { useEffect, useState } from 'react';
import { Chip } from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { useTranslation } from 'react-i18next'; // Import useTranslation

// Updated getTimeInfo utility function
const getTimeInfo = (t, currentLanguage, startDate, startTime, endDate, endTime) => {
  const now = new Date();
  const eventStart = new Date(`${startDate}T${startTime}`);
  const eventEnd = new Date(`${endDate}T${endTime}`);

  if (now > eventEnd) return { status: "ended", text: t('eventEnded') };
  if (now > eventStart) return { status: "ongoing", text: t('eventContinues') };

  const diff = eventStart - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (days > 0) {
    const eventStartDate = new Date(startDate);
    const formattedDate = eventStartDate.toLocaleDateString(currentLanguage, { // Use currentLanguage
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    return { status: "upcomingFuture", text: t('startsOnDate', { date: formattedDate }) };
  } else {
    const timeParts = [];
    if (hours > 0) timeParts.push(`${hours}${t('hoursUnit')}`);
    timeParts.push(`${minutes}${t('minutesUnit')}`);
    timeParts.push(`${seconds}${t('secondsUnit')}`);
    return { status: "upcomingSoon", text: t('startsInTime', { time: timeParts.join(' ') }) };
  }
};

export const LobbyInfo = ({ startDate, startTime, endDate, endTime, isMobile }) => {
  const { t, i18n } = useTranslation(); // Get t function and i18n instance
  const currentLanguage = i18n.language;

  const [timeInfo, setTimeInfo] = useState(() =>
    getTimeInfo(t, currentLanguage, startDate, startTime, endDate, endTime)
  );

  useEffect(() => {
    const updateTimer = () => {
      const newTimeInfo = getTimeInfo(t, currentLanguage, startDate, startTime, endDate, endTime);
      setTimeInfo(newTimeInfo);
    };

    // Update immediately if language changes
    updateTimer(); 

    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [t, currentLanguage, startDate, startTime, endDate, endTime]); // Add t and currentLanguage to dependencies

  const getIcon = () => {
    if (timeInfo.status === "upcomingFuture" || timeInfo.status === "upcomingSoon") return <ScheduleIcon />;
    if (timeInfo.status === "ongoing") return <PlayCircleFilledIcon />;
    return <CheckCircleIcon />; // For "ended"
  };

  const getColor = () => {
    if (timeInfo.status === "ended") return "#ff6b6b";
    if (timeInfo.status === "ongoing") return "#51cf66";
    return "#fda085"; // For "upcomingFuture" and "upcomingSoon"
  };

  return (
    <Chip
      icon={getIcon()}
      label={timeInfo.text} // Use the translated text
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