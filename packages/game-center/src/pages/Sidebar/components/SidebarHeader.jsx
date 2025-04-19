import React from 'react';
import { Avatar, Box, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../shared/context/AuthContext';
import { logout } from '../api';

const StyledHeader = styled(Box)(({ theme }) => ({
  height: '25vh',
  backgroundColor: 'background.default',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '10px',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: '60px',
  height: '60px',
  marginBottom: '5px',
  marginTop: '2rem',
  border: '2px solid #d5fdcd',
  backgroundColor: '#3f51b5',
  fontSize: '1.5rem',
  fontWeight: 'bold',
}));

const StyledLogoutButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#ff726f',
  color: '#fff',
  marginTop: '1rem',
  '&:hover': {
    backgroundColor: '#ff4d4a',
    transform: 'scale(1.1)',
  },
}));

function SidebarHeader() {
  const navigate = useNavigate();
  const { logout: authLogout, currentUser } = useAuthContext();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      authLogout();
      navigate('/login');
    }
  };

  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : '';

  return (
    <StyledHeader>
      <StyledAvatar src={currentUser?.avatar || undefined}>
        {!currentUser?.avatar && initial}
      </StyledAvatar>
      <Tooltip title="Logout" placement="right">
        <StyledLogoutButton onClick={handleLogout}>
          <LogoutIcon />
        </StyledLogoutButton>
      </Tooltip>
    </StyledHeader>
  );
}

export default SidebarHeader;
