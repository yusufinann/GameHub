import React, { useState } from 'react';
import { Paper, List, Avatar, Tooltip,Stack } from '@mui/material';
import {Person as PersonIcon } from '@mui/icons-material';
import Header from './Header';
import MemberItem from './MemberItem';

function MembersList({ members }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  return (
    <Paper
      elevation={8}
      sx={{
        p: 1.5,
        width: isCollapsed ? '60px' : '200px',
        height: '100vh',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <Header
        count={members.length}
        isCollapsed={isCollapsed}
        onToggle={handleToggle}
      />
      {isCollapsed ? (
        <Stack
          spacing={1}
          alignItems="center"
          sx={{ mt: 2 }}
        >
          {members.map((member) => (
            <Tooltip title={member.name} key={member.id}>
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: '0.9rem',
                  bgcolor: member.isHost ? '#1a237e' : '#2196f3',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <List sx={{ p: 0 }}>
          {members.map((member,index) => (
            <MemberItem key={member.id} member={member} index={index}/>
          ))}
        </List>
      )}
    </Paper>
  );
}

export default MembersList;