import React, { useState } from 'react';
import { Avatar, Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../shared/context/AuthContext';
import { logout } from '../api'; 

const StyledHeader = styled(Box)(({ theme }) => ({
  height: '25vh',
  minHeight: '180px',
  backgroundColor: theme.palette.background.default,
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
  marginTop: '1rem',
  border: '2px solid #d5fdcd',
  backgroundColor: '#3f51b5',
  fontSize: '1.5rem',
  fontWeight: 'bold',
}));

const StyledLogoutButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: '#ff726f',
  color: '#fff',
  marginTop: '1rem',
  transition: 'background-color 0.3s ease, transform 0.3s ease',
  width: '40px',
  height: '40px',
  '&:hover': {
    backgroundColor: '#ff4d4a',
    transform: 'scale(1.1)',
  },
  '&.Mui-disabled': {
    backgroundColor: '#ffa8a6',
    cursor: 'not-allowed',
    pointerEvents: 'auto',
    transform: 'none',
    color: '#fff',
  },
}));

function SidebarHeader() {
  const navigate = useNavigate();
  const { logout: authLogout, currentUser } = useAuthContext();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
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
  const tooltipTitle = isLoggingOut ? "Logging out..." : "Logout";

  return (
    <StyledHeader>
      <StyledAvatar src={currentUser?.avatar || undefined}>
        {!currentUser?.avatar && initial}
      </StyledAvatar>

      <Tooltip title={tooltipTitle} placement="right">
        <span>
          <StyledLogoutButton
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label={tooltipTitle}
          >
            {isLoggingOut ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <LogoutIcon />
            )}
          </StyledLogoutButton>
        </span>
      </Tooltip>
    </StyledHeader>
  );
}

export default SidebarHeader;