import React, { useEffect, useState } from 'react';
import { Avatar, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../shared/context/AuthContext';
import { getUserData, logout } from '../api';

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
  backgroundColor: '#3f51b5', // Avatar arka plan rengi
  fontSize: '4rem', // Harfin boyutu
  fontWeight: 'bold', // Harfin kalınlığı
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
  const { logout: authLogout } = useAuthContext(); // AuthContext'ten logout fonksiyonunu al
  const [user, setUser] = useState({ email: '', name: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserData(); // api.js'den kullanıcı bilgilerini getir
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Oturum kapatma isteği gönder
      await logout(); // api.js'den oturumu kapat
    } catch (error) {
      console.error('Error logging out:', error);
      // Token geçersizse veya başka bir hata oluşursa, kullanıcıyı otomatik olarak çıkış yapmaya yönlendir
      if (error.response && error.response.status === 401) {
        console.log('Token geçersiz. Oturum sonlandırılıyor...');
      }
    } finally {
      // Her durumda localStorage'ı temizle ve kullanıcıyı giriş sayfasına yönlendir
      authLogout(); // AuthContext'teki logout fonksiyonunu çağır
      navigate('/login'); // Kullanıcıyı giriş sayfasına yönlendir
    }
  };

  // Kullanıcının adının ilk harfini al
  const initial = user.name ? user.name.charAt(0).toUpperCase() : '';

  return (
    <StyledHeader>
      <StyledAvatar>
        {initial}
      </StyledAvatar>
      <UserInfoContainer>
        <Typography variant="h6" fontWeight="bold">
          {user.name}
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