import React from "react";
import {
MenuItem,
Button,
Avatar,
Stack,
Typography,
Box,
useMediaQuery,
useTheme,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";

const EventNotificationItem = ({ notification, handleJoinEvent, removeNotification,palette }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MenuItem key={notification.lobbyId} disableRipple sx={{ display: 'block', py: 2, px: 1,backgroundColor:palette.background.paper  }}>
      <Box sx={{ display: 'flex', mb: isMobile ? 2 : 0 }}>
        <Avatar sx={{ bgcolor: "primary.light", mr: 2 }}>
          <EventIcon />
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body1" noWrap>{notification.lobbyName}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {notification.message}
          </Typography>
        </Box>
      </Box>
      <Stack
        direction={isMobile ? "row" : "row"}
        spacing={1}
        sx={{
          mt: 1,
          justifyContent: 'flex-end',
          width: '100%'
        }}
      >
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            handleJoinEvent(notification.lobbyCode);
          }}
        >
          Join
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => removeNotification(notification.lobbyId)}
        >
          Dismiss
        </Button>
      </Stack>
    </MenuItem>
  );
};

export default EventNotificationItem;