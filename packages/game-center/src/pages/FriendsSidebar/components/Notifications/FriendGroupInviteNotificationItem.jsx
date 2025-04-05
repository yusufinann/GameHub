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
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

const FriendGroupInviteNotificationItem = ({ notification, handleViewFriendGroup, removeNotification }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MenuItem key={`friend-group-invite-${notification.groupId}`} disableRipple sx={{ display: 'block', py: 2, px: 1 }}>
      <Box sx={{ display: 'flex', mb: isMobile ? 2 : 0 }}>
        <Avatar sx={{ bgcolor: "secondary.light", mr: 2 }}>
          <GroupsRoundedIcon />
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body1" noWrap>{notification.groupName}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Invitation from {notification.inviterUsername}
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
            handleViewFriendGroup(notification.groupId);
          }}
        >
          View
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => removeNotification(notification.groupId)}
        >
          Dismiss
        </Button>
      </Stack>
    </MenuItem>
  );
};

export default FriendGroupInviteNotificationItem;