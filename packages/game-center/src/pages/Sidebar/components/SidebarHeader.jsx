import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledHeader = styled(Box)(({ theme }) => ({
  height: '25vh',
  backgroundColor: '#caecd5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '10px',
  [theme.breakpoints.down('md')]: {
    height: '20vh',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: '8vw',
  height: '16vh',
  marginBottom: '5px',
  border: '2px solid #d5fdcd',
  [theme.breakpoints.down('md')]: {
    width: '10vw',
    height: '10vh',
  },
}));

function SidebarHeader() {
  return (
    <StyledHeader>
      <StyledAvatar
        src="/path/to/avatar.jpg"
        alt="User"
      />
      <Typography variant="h6" fontWeight="bold">
        X User
      </Typography>
      <Typography variant="subtitle2">
        Personel
      </Typography>
    </StyledHeader>
  );
}

export default SidebarHeader;
