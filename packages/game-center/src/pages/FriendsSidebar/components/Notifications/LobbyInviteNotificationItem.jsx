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
import GroupsIcon from '@mui/icons-material/Groups';

const LobbyInviteNotificationItem = ({ notification, handleJoinEvent, removeNotification }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MenuItem key={`lobby-invite-${notification.lobbyId}`} disableRipple sx={{ display: 'block', py: 2, px: 1,backgroundColor: theme.palette.background.paper }}>
      <Box sx={{ display: 'flex', mb: isMobile ? 2 : 0 }}>
        <Avatar sx={{ bgcolor: "secondary.light", mr: 2 }}>
          <GroupsIcon />
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body1" noWrap>{notification.lobbyName}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Invitation from {notification.senderUsername}
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
            removeNotification(notification.lobbyId);
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

export default LobbyInviteNotificationItem;