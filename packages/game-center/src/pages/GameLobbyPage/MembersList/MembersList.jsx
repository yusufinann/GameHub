import React, { useState } from 'react';
import { Paper, List, Avatar, Tooltip, Stack } from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import Header from './Header';
import MemberItem from './MemberItem';

function MembersList({ members }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggle = () => setIsCollapsed(!isCollapsed);

  return (
    <Paper
      elevation={8}
      sx={{
        p: 1,
        width: isCollapsed ? '60px' : '250px',
        height: '100vh',
        background: 'rgba(202, 236, 213, 0.9)', // Updated background color to rgba of #caecd5
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
        <Stack spacing={1} alignItems="center" sx={{ mt: 2 }}>
          {members.map((member) => (
            <Tooltip title={member.name} key={member.id}>
              <Avatar
                src={member.avatar || undefined}
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: '1.1rem',
                  bgcolor: member.isHost ? '#328761' : '#caecd5', // Updated Avatar colors
                  color: member.isHost ? 'white' : 'rgba(0, 0, 0, 0.87)', // Ensuring good contrast for icons/text
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                {!member.avatar && <PersonIcon fontSize="medium" />}
              </Avatar>
            </Tooltip>
          ))}
        </Stack>
      ) : (
        <List sx={{ p: 0 }}>
          {members.map((member, index) => (
            <MemberItem key={member.id} member={member} index={index} />
          ))}
        </List>
      )}
    </Paper>
  );
}

export default MembersList;