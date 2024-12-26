import React from 'react';
import { Avatar, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const StyledHeader = styled(Box)(({ theme }) => ({
  height: '25vh',
  backgroundColor: '#caecd5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '10px',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: '8vw',
  height: '16vh',
  marginBottom: '5px',
  marginTop: '2rem',
  border: '2px solid #d5fdcd',
}));

const UserInfoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: '1rem',
}));

const StyledLogoutButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'isExpanded',
})(({ theme, isExpanded }) => ({
  marginLeft: isExpanded ? '0.5rem': '0',
  backgroundColor: '#ff726f',
  color: '#fff',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#ff4d4a',
    transform: 'scale(1.1)',
  },
}));

function SidebarHeader({ isExpanded }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // localStorage'dan belirli öğeleri kaldır
    localStorage.removeItem('token');

    // Kullanıcıyı giriş sayfasına yönlendir
    navigate('/login');
  };

  return (
    <StyledHeader>
      <StyledAvatar
        src="/path/to/avatar.jpg"
        alt="User"
      />
      <UserInfoContainer>
        <Typography variant="h6" fontWeight="bold">
          X User
        </Typography>
        <Tooltip title="Logout" placement="top">
          <StyledLogoutButton isExpanded={isExpanded} onClick={handleLogout}>
            <LogoutIcon />
          </StyledLogoutButton>
        </Tooltip>
      </UserInfoContainer>
    </StyledHeader>
  );
}

export default SidebarHeader;
