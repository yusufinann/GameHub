import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Button,
  Badge,
} from '@mui/material';
import {
  EmojiEvents,
  Stars,
  Schedule,
  Email,
  LocationOn,
  CalendarMonth,
  SportsEsports,
  Timeline,
  Psychology,
  Group,
  PersonAdd,
  PersonRemove // Import for remove friend icon
} from '@mui/icons-material';
import { useProfile } from './useProfile';
import { useFriendsContext } from './context';
import { StatCard, ProfileSection } from './components/profileComponents';
import { profileTheme, colorScheme } from './profileTheme';
import RemoveFriendConfirm from './components/RemoveFriendConfirm';
import BingoPlayerStats from './components/BingoPlayerStats';

const Profile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const { user, loading, error } = useProfile(userId);
  const {
    sendFriendRequest,
    removeFriend,
    isRequestSent,
    isFriend,
  } = useFriendsContext();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  const handleRemoveFriendClick = () => {
    // Open the confirmation dialog instead of removing right away
    setConfirmDialogOpen(true);
  };
  
  const handleRemoveFriendConfirm = () => {
    // This will be called when user confirms in the dialog
    if (isFriend) {
      removeFriend(userId);
      // Close the dialog after removing
      setConfirmDialogOpen(false);
    }
  };
  const handleDialogClose = () => {
    // Close the dialog without taking action
    setConfirmDialogOpen(false);
  };

  const handleAddFriend = () => {
    if (!isRequestSent && !isFriend) {
      sendFriendRequest(userId);
    }
  };



  useEffect(() => {
    if (user) {
      setShowContent(true);
    }
  }, [user]);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) return <div>Error loading profile: {error.message}</div>;
  if (!user) return <div>No user found</div>;

  const getFriendButtonState = () => {
    if (isFriend) {
      return (
        <Button
        variant="contained"
        onClick={handleRemoveFriendClick} // Changed to open dialog
        startIcon={<PersonRemove />}
        sx={{
          background: colorScheme.buttonGradient,
          '&:hover': {
            background: colorScheme.buttonGradientHover,
          },
        }}
      >
        Remove Friend
      </Button>
      );
    }

    if (isRequestSent) {
      return (
        <Button
          variant="contained"
          disabled
          startIcon={<Schedule />}
        >
          Request Sent
        </Button>
      );
    }

    return (
      <Button
        variant="contained"
        onClick={handleAddFriend}
        startIcon={<PersonAdd />}
        sx={{
          background: colorScheme.buttonGradient,
          '&:hover': {
            background: colorScheme.buttonGradientHover,
          },
        }}
      >
        Add Friend
      </Button>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        borderRadius: 10,
        background: 'transparent',
        p: { xs: 2, sm: 3, md: 2 },
      }}
    > {/* Confirmation Dialog */}
      <RemoveFriendConfirm
        open={confirmDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleRemoveFriendConfirm}
        friendName={user?.username}
        friendAvatar={user?.avatar}
      />
      <Box
        sx={{
          p: 4,
          mb: 4,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 4,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Box>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <Chip
                  label={`Lvl ${user.level}`}
                  sx={{
                    background: colorScheme.accentGradient,
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                />
              }
            >
              <Avatar
                src={user.avatar}
                alt={user.username}
                sx={{
                  width: 150,
                  height: 150,
                  border: '4px solid #fff',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                }}
              />
            </Badge>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h3"
              sx={{
                mb: 2,
                background: colorScheme.accentGradient,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                fontWeight: 'bold',
              }}
            >
              {user.username}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
              {[
                { icon: <Email />, label: user.email },
                { icon: <LocationOn />, label: user.location },
                {
                  icon: <CalendarMonth />,
                  label: `Member since: ${new Date(user.memberSince).toLocaleDateString()}`,
                },
              ].map((item, index) => (
                <Chip
                  key={index}
                  icon={item.icon}
                  label={item.label}
                  sx={{
                    background: 'rgba(255,255,255,0.9)',
                  }}
                />
              ))}

              {getFriendButtonState()}
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Level Progress
              </Typography>
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                {user.xp} / {user.xpToNextLevel} XP
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 4,
        }}
      >
        {[
          { icon: SportsEsports, title: 'Toplam Oyun', value: user.totalGames },
          {
            icon: Timeline,
            title: 'Kazanma Oranı',
            value: `${user.winRate}%`,
          },
          {
            icon: Psychology,
            title: 'En Uzun Seri',
            value: user.stats.longestStreak,
          },
          { icon: Group, title: 'Arkadaşlar', value: user.friendsCount || '124' },
        ].map((stat, index) => (
          <Box
            key={index}
            sx={{
              flex: {
                xs: '0 0 100%',
                sm: '0 0 calc(50% - 12px)',
                md: '0 0 calc(25% - 12px)',
              },
            }}
          >
            <StatCard {...stat} delay={index * 200} />
          </Box>
        ))}
      </Box>
      <Box
        sx={{
          background: 'rgba(255,255,255,0.9)',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              '&:hover': {
                background: 'rgba(81, 229, 121, 0.74)',
              },
            },
            '& .Mui-selected': {
              background: colorScheme.buttonGradient,
              color: '#fff !important',
            },
          }}
        >
          <Tab icon={<Stars />} label="İSTATİSTİKLER" />
          <Tab icon={<Schedule />} label="OYUN GEÇMİŞİ" />
          <Tab icon={<EmojiEvents />} label="BAŞARIMLAR" />
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
      {activeTab === 0 && (
    <>
      <ProfileSection.Achievements
        achievements={user.achievements}
        theme={profileTheme}
      />
      <BingoPlayerStats />
    </>
  )}

        {activeTab === 1 && (
          <ProfileSection.RecentGames recentGames={user.recentGames} />
        )}

        {activeTab === 2 && (
          <ProfileSection.GameStats stats={user.stats} />
        )}
      </Box>
    </Box>
  );
};

export default Profile;
