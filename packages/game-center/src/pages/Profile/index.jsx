import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Typography,
  Box,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  Button,
  useTheme,
} from "@mui/material";
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
  PersonRemove,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { useProfile } from "./useProfile";
import { StatCard, ProfileSection } from "./components/profileComponents";
import RemoveFriendConfirm from "./components/RemoveFriendConfirm";
import BingoOverallStats from "./components/BingoOverallStats";
import BingoGameHistory from "./components/BingoGameHistory";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useFriendsContext } from "../../shared/context/FriendsContext/context";
import apiClient from "./api";

const Profile = () => {
  const { userId } = useParams();
  const { t } = useTranslation(); // Initialize t function
  const [activeTab, setActiveTab] = useState(0);
  const { user, loading: userLoading, error: userError } = useProfile(userId);
  const { sendFriendRequest, removeFriend, isRequestSent, isFriend, friends } =
    useFriendsContext();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);
  const [bingoWinRate, setBingoWinRate] = useState(0);
  const [bingoLongestStreak, setBingoLongestStreak] = useState(0);
  const { currentUser } = useAuthContext();
  const theme = useTheme();

  const handleRemoveFriendClick = () => setConfirmDialogOpen(true);

  const handleRemoveFriendConfirm = () => {
    if (isFriend) {
      removeFriend(userId);
      setConfirmDialogOpen(false);
    }
  };

  const handleDialogClose = () => setConfirmDialogOpen(false);

  const handleAddFriend = () => {
    if (!isRequestSent && !isFriend) sendFriendRequest(userId);
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiClient.gameService.getBingoStats(userId);
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
    if (stats?.totalGames > 0) {
      setBingoWinRate(((stats.wins / stats.totalGames) * 100).toFixed(1));
      let currentStreak = 0,
        maxStreak = 0;
      stats.games.forEach((game) => {
        currentStreak = game.finalRank === 1 ? currentStreak + 1 : 0;
        maxStreak = Math.max(maxStreak, currentStreak);
      });
      setBingoLongestStreak(Math.max(maxStreak, currentStreak));
    }
  }, [stats]);

  if (userLoading || statsLoading)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: "primary.main" }}
        />
      </Box>
    );

  if (userError || statsError)
    return (
      <Box sx={{ p: 4, color: "error.main" }}>
        {t("profile.errorPrefix", "Error:")} {userError?.message || statsError}
      </Box>
    );

  if (!user)
    return <Box sx={{ p: 4 }}>{t("profile.noUserFound", "No user found")}</Box>;

  const getFriendButton = () => {
    if (currentUser?.id === userId) return null;

    return isFriend ? (
      <Button
        variant="contained"
        onClick={handleRemoveFriendClick}
        startIcon={<PersonRemove />}
        sx={{
          bgcolor: "secondary.main",
          "&:hover": { bgcolor: "secondary.dark" },
          color: "secondary.contrastText",
        }}
      >
        {t("profile.removeFriendButton", "Remove Friend")}
      </Button>
    ) : isRequestSent ? (
      <Button variant="contained" disabled startIcon={<Schedule />}>
        {t("profile.requestSentButton", "Request Sent")}
      </Button>
    ) : (
      <Button
        variant="contained"
        onClick={handleAddFriend}
        startIcon={<PersonAdd />}
        sx={{
          bgcolor: "primary.medium",
          "&:hover": { bgcolor: "primary.darker" },
          color: "text.contrast", // Assuming text.contrast is defined in your theme
        }}
      >
        {t("profile.addFriendButton", "Add Friend")}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "transparent", // Or theme.palette.background.default
        p: { xs: 2, sm: 3 },
        transition: "background 0.3s ease",
      }}
    >
      <RemoveFriendConfirm
        open={confirmDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleRemoveFriendConfirm}
        friendName={user.username}
        friendAvatar={user.avatar}
        theme={theme}
        t={t}
      />

      {/* Profile Header */}
      <Box
        sx={{
          p: 4,
          mb: 4,
          bgcolor: "background.offwhite", // Make sure this is defined in your theme
          borderRadius: 4,
          boxShadow: 3,
          backgroundImage:
            theme.palette.mode === "dark"
              ? theme.palette.background.gradientB // Ensure gradientB is defined
              : "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 4,
          }}
        >
          <Avatar
            src={user.avatar}
            alt={user.username}
            sx={{
              width: 150,
              height: 150,
              border: `4px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[6],
            }}
          />

          <Box sx={{ flexGrow: 1 }}>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: theme.palette.text.primary,
                fontWeight: 700,
              }}
            >
              {user.username}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
              {[
                { icon: <Person />, label: user.name, key: "name" },
                { icon: <LocationOn />, label: user.location, key: "location" },
                {
                  icon: <CalendarMonth />,
                  label: t("profile.joinedSince", "Joined: {{date}}", {
                    date: new Date(user.memberSince).toLocaleDateString(),
                  }),
                  key: "joined",
                },
              ].map((item) =>
                item.label ? ( // Only render chip if label exists
                  <Chip
                    key={item.key}
                    icon={item.icon}
                    label={item.label}
                    sx={{
                      bgcolor: "background.paper",
                      color: "text.secondary",
                      border: `1px solid ${theme.palette.background.dot}`, // Ensure background.dot is defined
                    }}
                  />
                ) : null
              )}
              {getFriendButton()}
            </Box>

            <Box
              sx={{
                bgcolor: "background.paper",
                p: 2,
                borderRadius: 2,
                boxShadow: `0 2px 8px ${theme.palette.background.dot}`, // Ensure background.dot is defined
              }}
            >
              <Typography
                variant="body2"
                sx={{ color: "secondary.main", mb: 1 }}
              >
                {t("profile.levelProgress", "Level Progress")}
              </Typography>
              <Typography variant="h6" sx={{ color: "secondary.main" }}>
                {user.xp} / {user.xpToNextLevel} XP
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 4,
        }}
      >
        {[
          {
            icon: SportsEsports,
            titleKey: "profile.stats.totalGames",
            fallbackTitle: "Total Games",
            value: stats?.totalGames || 0,
          },
          {
            icon: Timeline,
            titleKey: "profile.stats.winRate",
            fallbackTitle: "Win Rate",
            value: `${bingoWinRate}%`,
          },
          {
            icon: Psychology,
            titleKey: "profile.stats.longestStreak",
            fallbackTitle: "Longest Streak",
            value: bingoLongestStreak,
          },
          {
            icon: Group,
            titleKey: "profile.stats.friends",
            fallbackTitle: "Friends",
            value: friends.length,
          },
        ].map((stat, index) => (
          <StatCard
            key={stat.titleKey} // Use a more stable key
            icon={stat.icon}
            title={t(stat.titleKey, stat.fallbackTitle)}
            value={stat.value}
            sx={{
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.background.dot}`,
              "& .MuiSvgIcon-root": {
                color: index % 2 ? "secondary.main" : "primary.main",
              },
            }}
            theme={theme}
          />
        ))}
      </Box>

      {/* Tabs Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: 3,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              color: "text.secondary",
              "&.Mui-selected": {
                color: "text.contrast", // Ensure text.contrast is defined
                bgcolor:
                  theme.palette.mode === "light"
                    ? "primary.light"
                    : "secondary.main",
              },
            },
          }}
        >
          <Tab
            icon={<Stars />}
            label={t("profile.tabs.statistics", "Statistics")}
          />
          <Tab
            icon={<Schedule />}
            label={t("profile.tabs.history", "History")}
          />
          <Tab
            icon={<EmojiEvents />}
            label={t("profile.tabs.achievements", "Achievements")}
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box
        sx={{
          mt: 2,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: 3,
        }}
      >
        {activeTab === 0 && <BingoOverallStats stats={stats} theme={theme} />}
        {activeTab === 1 && <BingoGameHistory stats={stats} />}
        {activeTab === 2 && (
          <ProfileSection.Achievements
            achievements={user.achievements}
            theme={theme}
          />
        )}
      </Box>
    </Box>
  );
};

export default Profile;
