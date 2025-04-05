// GroupMemberList.jsx
import React from "react";
import { List, ListItem, Avatar, Typography, Box } from "@mui/material";

const GroupMemberList = ({ members }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <List sx={{ width: '100%', maxWidth: 360 }}> 
        {members && members.map((member) => (
          <ListItem key={member._id} alignItems="center"> 
            <Avatar alt={member.username} src={member.avatar} sx={{ mr: 2 }} />
            <Typography variant="body2">{member.username}</Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default GroupMemberList;