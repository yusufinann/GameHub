import LockIcon from "@mui/icons-material/Lock";
import EventIcon from "@mui/icons-material/Event";
import GroupIcon from "@mui/icons-material/Group";
export const getEventTimeInfo = (startDate, startTime, endDate, endTime, eventStatus) => {
  if (!startDate || !startTime) return null;
  
  // WebSocket durumuna öncelik ver
  if (eventStatus === 'started') return "The event continues";
  if (eventStatus === 'ended') return "Event has ended";

  const eventDateTime = new Date(`${startDate}T${startTime}`);
  const endDateTime = new Date(`${endDate}T${endTime}`);
  const now = new Date();

  if (isNaN(eventDateTime.getTime())) return null;

  // Fallback kontrol
  if (now > endDateTime) return "Event has ended";
  if (now > eventDateTime) return "The event continues";

  const difference = eventDateTime - now;
  
  // Kalan süre hesaplama
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `Starts in ${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
  return `Starts in ${minutes}m`;
};
  
  export const getIcon = (lobbyType) => {
    switch (lobbyType) {
      case "private":
        return <LockIcon />;
      case "event":
        return <EventIcon />;
      default:
        return <GroupIcon />;
    }
  };