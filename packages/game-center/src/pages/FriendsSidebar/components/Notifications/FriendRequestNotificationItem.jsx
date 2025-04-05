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
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const FriendRequestNotificationItem = ({ request, handleAcceptFriendRequest, handleRejectFriendRequest }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <MenuItem key={request.id} disableRipple sx={{ display: 'block', py: 2, px: 1 }}>
      <Box sx={{ display: 'flex', mb: isMobile ? 2 : 0 }}>
        <Avatar sx={{ bgcolor: "secondary.light", mr: 2 }}>
          <PersonAddIcon />
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body1" noWrap>{request.username}</Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            Wants to be your friend
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
          color="success"
          onClick={() => handleAcceptFriendRequest(request.id)}
        >
          Accept
        </Button>
        <Button
          size="small"
          color="error"
          onClick={() => handleRejectFriendRequest(request.id)}
        >
          Reject
        </Button>
      </Stack>
    </MenuItem>
  );
};

export default FriendRequestNotificationItem;