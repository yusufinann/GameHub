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
  Person,
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
import { StatCard, ProfileSection } from './components/profileComponents';
import { profileTheme, colorScheme } from './profileTheme';
import RemoveFriendConfirm from './components/RemoveFriendConfirm';
import BingoOverallStats from './components/BingoOverallStats'; // Import new components
import BingoGameHistory from './components/BingoGameHistory'; // Import new components
import { useAuthContext } from '../../shared/context/AuthContext';
import { useFriendsContext } from '../../shared/context/FriendsContext/context';

const Profile = () => {
  const { userId } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const { user, loading: userLoading, error: userError } = useProfile(userId);
  const {
    sendFriendRequest,
    removeFriend,
    isRequestSent,
    isFriend,
    friends
  } = useFriendsContext();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [bingoWinRate, setBingoWinRate] = useState(0);
  const [bingoLongestStreak, setBingoLongestStreak] = useState(0);
  const { currentUser } = useAuthContext(); 


  const handleRemoveFriendClick = () => {
    setConfirmDialogOpen(true);
  };

  const handleRemoveFriendConfirm = () => {
    if (isFriend) {
      removeFriend(userId);
      setConfirmDialogOpen(false);
    }
  };
  const handleDialogClose = () => {
    setConfirmDialogOpen(false);
  };

  const handleAddFriend = () => {
    if (!isRequestSent && !isFriend) {
      sendFriendRequest(userId);
    }
  };


  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);   
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3001/api/bingo/stats/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch bingo stats');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setStatsError(err.message);
      } finally {
        setStatsLoading(false); 
      }
    };

    fetchStats();
  }, [userId]);

  useEffect(() => {
    if (stats && stats.totalGames > 0 && stats.games) {
      setBingoWinRate(((stats.wins / stats.totalGames) * 100).toFixed(1));

      let currentStreak = 0;
      let maxStreak = 0;
      for (const game of stats.games) {
        if (game.finalRank === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 0;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      setBingoLongestStreak(maxStreak);


    } else {
      setBingoWinRate(0);
      setBingoLongestStreak(0); 
    }
  }, [stats]);


  useEffect(() => {
    if (user) {
      setShowContent(true);
    }
  }, [user]);

  if (userLoading || statsLoading) { 
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

  if (userError) return <div>Error loading profile: {userError.message}</div>;
  if (statsError) return <div>Error loading bingo statistics: {statsError.message}</div>; 
  if (!user) return <div>No user found</div>;

  const getFriendButtonState = () => {
    if (isFriend) {
      return (
        <Button
        variant="contained"
        onClick={handleRemoveFriendClick} 
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
                { icon: <Person />, label: user.name },
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

              {/* Conditionally render getFriendButtonState */}
              {currentUser && currentUser.id !== userId && getFriendButtonState()}
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
          { icon: SportsEsports, title: 'Toplam Oyun', value: stats?.totalGames || 0 },
          {
            icon: Timeline,
            title: 'Kazanma Oranı',
            value: `${bingoWinRate}%`,
          },
          {
            icon: Psychology,
            title: 'En Uzun Seri',
            value: bingoLongestStreak || 0, 
          },
          { icon: Group, title: 'Arkadaşlar', value: friends.length || 0 },
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
        <BingoOverallStats stats={stats} loading={statsLoading} error={statsError} />
      )}

        {activeTab === 1 && (
          <BingoGameHistory stats={stats} loading={statsLoading} error={statsError} />
        )}

        {activeTab === 2 && (

          <ProfileSection.Achievements
    achievements={user.achievements}
    theme={profileTheme}
  />
        )}
      </Box>
    </Box>
  );
};

export default Profile;