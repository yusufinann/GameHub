// UserJoinNotificationItem.jsx
import React from "react";
import {
MenuItem,
Button,
Avatar,
Stack,
Typography,
Box,
} from "@mui/material";
import GroupsIcon from '@mui/icons-material/Groups';

const UserJoinNotificationItem = ({ notification, removeNotification }) => {

  return (
    <MenuItem key={`user-join-${notification.lobbyCode}-${notification.userName}`} disableRipple sx={{ display: 'block', py: 2, px: 1 }}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <Avatar sx={{ bgcolor: "secondary.light", mr: 2 }}>
          <GroupsIcon />
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body1" noWrap>{notification.lobbyName}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {notification.userName} joined
          </Typography>
        </Box>
      </Box>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          mt: 1,
          justifyContent: 'flex-end',
          width: '100%'
        }}
      >
        <Button
          size="small"
          color="error"
          onClick={() => removeNotification(notification.lobbyCode, 'user-join')}
        >
          Dismiss
        </Button>
      </Stack>
    </MenuItem>
  );
};

export default UserJoinNotificationItem;