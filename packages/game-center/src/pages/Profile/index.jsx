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
  Paper,
} from "@mui/material";
import {
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
  Assessment,
  HistoryEdu,
  Extension,
  SportsKabaddi,
  ViewList,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useProfile } from "./useProfile";
import { StatCard, ProfileSection } from "./components/profileComponents";
import RemoveFriendConfirm from "./components/RemoveFriendConfirm";
import BingoOverallStats from "./components/BingoOverallStats";
import BingoGameHistory from "./components/BingoGameHistory";
import HangmanOverallStats from "./components/HangmanOverallStats";
import HangmanGameHistory from "./components/HangmanGameHistory";
import { useAuthContext } from "../../shared/context/AuthContext";
import { useFriendsContext } from "../../shared/context/FriendsContext/context";
import apiClient from "./api";

const Profile = () => {
  const { userId } = useParams();
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  // Tab order: 0: Statistics, 1: Achievements, 2: History
  const [activeTab, setActiveTab] = useState(0);
  const [activeStatsSubTab, setActiveStatsSubTab] = useState(0);
  const [activeHistorySubTab, setActiveHistorySubTab] = useState(0);
  const [activeSummaryGameTab, setActiveSummaryGameTab] = useState(0);

  const { user, loading: userLoading, error: userError } = useProfile(userId);
  const { sendFriendRequest, removeFriend, isRequestSent, isFriend, friends } = useFriendsContext();
  const { currentUser } = useAuthContext();

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Bingo Stats
  const [bingoStats, setBingoStats] = useState(null);
  const [bingoStatsLoading, setBingoStatsLoading] = useState(true);
  const [bingoStatsError, setBingoStatsError] = useState(null);
  const [bingoWinRate, setBingoWinRate] = useState(0);
  const [bingoLongestStreak, setBingoLongestStreak] = useState(0);

  // Hangman Stats (Overall)
  const [hangmanOverallStats, setHangmanOverallStats] = useState(null);
  const [hangmanOverallStatsLoading, setHangmanOverallStatsLoading] = useState(true);
  const [hangmanOverallStatsError, setHangmanOverallStatsError] = useState(null);
  const [hangmanWinRate, setHangmanWinRate] = useState(0);
  const [hangmanAccuracyPercent, setHangmanAccuracyPercent] = useState(0);

  // Hangman Game History
  const [hangmanGameHistory, setHangmanGameHistory] = useState(null);
  const [hangmanGameHistoryLoading, setHangmanGameHistoryLoading] = useState(true);
  const [hangmanGameHistoryError, setHangmanGameHistoryError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const fetchBingoStats = async () => {
      setBingoStatsLoading(true);
      setBingoStatsError(null);
      try {
        const data = await apiClient.gameService.getBingoStats(userId);
        setBingoStats(data);
      } catch (err) {
        setBingoStatsError(err.message || "Failed to load Bingo stats");
      } finally {
        setBingoStatsLoading(false);
      }
    };

    const fetchHangmanStats = async () => {
      setHangmanOverallStatsLoading(true);
      setHangmanOverallStatsError(null);
      setHangmanGameHistoryLoading(true);
      setHangmanGameHistoryError(null);
      try {
        const data = await apiClient.gameService.getHangmanStats(userId);
        let avgCorrectGuesses = 0;
        if (data.totalGamesPlayed > 0 && data.totalCorrectGuesses !== undefined) {
          avgCorrectGuesses = parseFloat((data.totalCorrectGuesses / data.totalGamesPlayed).toFixed(1));
        }
        setHangmanOverallStats({
          totalGamesPlayed: data.totalGamesPlayed,
          totalWins: data.totalWins,
          averageCorrectGuesses: avgCorrectGuesses,
          accuracy: data.accuracy,
          totalCorrectGuesses: data.totalCorrectGuesses,
          totalIncorrectGuesses: data.totalIncorrectGuesses,
        });
        setHangmanGameHistory({ games: data.gameHistory || [] });
      } catch (err) {
        const errorMessage = err.message || "Failed to load Hangman stats";
        setHangmanOverallStatsError(errorMessage);
        setHangmanGameHistoryError(errorMessage);
      } finally {
        setHangmanOverallStatsLoading(false);
        setHangmanGameHistoryLoading(false);
      }
    };

    fetchBingoStats();
    fetchHangmanStats();
  }, [userId]);

  useEffect(() => {
    if (bingoStats?.totalGames > 0) {
      setBingoWinRate(
        parseFloat(((bingoStats.wins / bingoStats.totalGames) * 100).toFixed(1))
      );
      let currentStreak = 0;
      let maxStreak = 0;
      if (Array.isArray(bingoStats.games)) {
        bingoStats.games.forEach((game) => {
          if (game.finalRank === 1) currentStreak++;
          else {
            maxStreak = Math.max(maxStreak, currentStreak);
            currentStreak = 0;
          }
        });
        maxStreak = Math.max(maxStreak, currentStreak);
      }
      setBingoLongestStreak(maxStreak);
    } else {
      setBingoWinRate(0);
      setBingoLongestStreak(0);
    }
  }, [bingoStats]);

  useEffect(() => {
    if (hangmanOverallStats?.totalGamesPlayed > 0 && hangmanOverallStats?.totalWins !== undefined) {
      setHangmanWinRate(
        parseFloat(((hangmanOverallStats.totalWins / hangmanOverallStats.totalGamesPlayed) * 100).toFixed(1))
      );
    } else {
      setHangmanWinRate(0);
    }
    if (hangmanOverallStats && typeof hangmanOverallStats.accuracy === 'number') {
        setHangmanAccuracyPercent(
          parseFloat((hangmanOverallStats.accuracy * 100).toFixed(1))
        );
      } else {
        setHangmanAccuracyPercent(0);
      }
  }, [hangmanOverallStats]);

  const handleRemoveFriendClick = () => setConfirmDialogOpen(true);
  const handleRemoveFriendConfirm = () => {
    if (isFriend && userId) {
      removeFriend(userId);
      setConfirmDialogOpen(false);
    }
  };
  const handleDialogClose = () => setConfirmDialogOpen(false);
  const handleAddFriend = () => {
    if (!isRequestSent && !isFriend && userId) sendFriendRequest(userId);
  };

  if (userLoading) {
    return (
      <Box sx={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={60} thickness={4} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  if (userError) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
         <Typography color="error.main" variant="h6">{t("profile.errorPrefix", "Error:")} {userError?.message || t("profile.errorGenericUser", "Could not load user profile.")}</Typography>
      </Box>
    );
  }

  if (!user) {
    return <Box sx={{ p: 4, textAlign: 'center' }}><Typography variant="h6">{t("profile.noUserFound", "No user found.")}</Typography></Box>;
  }

  const getFriendButton = () => {
    if (currentUser?.id === userId) return null;
    return isFriend ? (
      <Button variant="contained" onClick={handleRemoveFriendClick} startIcon={<PersonRemove />} sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" }, color: "error.contrastText" }}>
        {t("profile.removeFriendButton", "Remove Friend")}
      </Button>
    ) : isRequestSent ? (
      <Button variant="outlined" disabled startIcon={<Schedule />}>
        {t("profile.requestSentButton", "Request Sent")}
      </Button>
    ) : (
      <Button variant="contained" onClick={handleAddFriend} startIcon={<PersonAdd />} sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}>
        {t("profile.addFriendButton", "Add Friend")}
      </Button>
    );
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "transparent", p: { xs: 2, sm: 3 }, transition: "background 0.3s ease" }}>
      <RemoveFriendConfirm
        open={confirmDialogOpen}
        onClose={handleDialogClose}
        onConfirm={handleRemoveFriendConfirm}
        friendName={user.username}
        friendAvatar={user.avatar}
        theme={theme}
        t={t}
      />

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3, md: 4 },
          mb: 4,
           bgcolor: "background.offwhite",
          borderRadius: 4,
          backgroundImage: theme.palette.mode === "dark" ? theme.palette.background.gradientB : "none",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", gap: { xs: 2, sm: 3, md: 4 } }}>
          <Avatar src={user.avatar} alt={user.username} sx={{ width: { xs: 100, sm: 120, md: 150 }, height: { xs: 100, sm: 120, md: 150 }, border: `4px solid ${theme.palette.background.paper}`, boxShadow: theme.shadows[6]}}/>
          <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left'} }}>
            <Typography variant="h2" component="h1" sx={{ mb: 1, fontWeight: 700, color: theme.palette.text.primary }}>
              {user.username}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2, justifyContent: { xs: 'center', sm: 'flex-start'} }}>
              {[
                { icon: <Person fontSize="small"/>, label: user.name, key: "name" },
                { icon: <LocationOn fontSize="small"/>, label: user.location, key: "location" },
                { icon: <CalendarMonth fontSize="small"/>, label: t("profile.joinedSince", "Joined: {{date}}", { date: new Date(user.memberSince).toLocaleDateString(i18n.language) }), key: "joined" },
              ].map((item) => item.label ? (<Chip key={item.key} icon={item.icon} label={item.label} size="small" sx={{ bgcolor: "action.hover", color: "text.secondary" }} />) : null)}
            </Box>
            {getFriendButton()}
            {user.xp !== undefined && user.xpToNextLevel !== undefined && (
                <Box sx={{ bgcolor: theme.palette.background.default, p: 2, borderRadius: 1, mt: 2, boxShadow: theme.shadows[1] }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", display: 'block', mb: 0.5 }}>{t("profile.levelProgress", "Level Progress")}</Typography>
                    <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>{user.xp} / {user.xpToNextLevel} XP</Typography>
                </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Tabs
        value={activeSummaryGameTab}
        onChange={(e, newValue) => setActiveSummaryGameTab(newValue)}
        indicatorColor="secondary"
        textColor="inherit"
        variant="standard"
        sx={{
          mb: 3,
          mt: { xs: 2, sm: 0 },
          minHeight: 'auto',
          '& .MuiTab-root': {
            minWidth: { xs: 120, sm: 140 },
            minHeight: 'auto',
            py: 1,
            fontSize: { xs: '0.8rem', sm: '0.9rem'},
            color: theme.palette.text.secondary,
            '& .MuiSvgIcon-root': {
              mr: 1,
              fontSize: '1.25rem',
            },
            "&.Mui-selected": {
              color: theme.palette.secondary.main,
              fontWeight: 600,
            },
          },
        }}
        aria-label={t("profile.summaryGameTabs.ariaLabel", "Özet istatistikler için oyun seçin")}
      >
        <Tab
          icon={<ViewList />}
          iconPosition="start"
          label={t("profile.summaryGameTabs.bingo", "Bingo")}
          id="summary-game-tab-0"
          aria-controls="summary-game-panel-0"
        />
        <Tab
          icon={<SportsKabaddi />}
          iconPosition="start"
          label={t("profile.summaryGameTabs.hangman", "Hangman")}
          id="summary-game-tab-1"
          aria-controls="summary-game-panel-1"
        />
      </Tabs>


      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 2, mb: 4 }}>
        {(() => {
          const friendStatCard = {
            icon: Group,
            titleKey: "profile.stats.friends",
            fallbackTitle: "Friends",
            value: friends.length.toLocaleString(i18n.language)
          };

          let gameSpecificStats;
          if (activeSummaryGameTab === 0) { // Bingo
            gameSpecificStats = [
              { icon: SportsEsports, titleKey: "profile.stats.bingo.totalGames", fallbackTitle: "Bingo Toplam Oyun", value: bingoStatsLoading ? "..." : (bingoStats?.totalGames?.toLocaleString(i18n.language) || "0") },
              { icon: Timeline, titleKey: "profile.stats.bingo.winRate", fallbackTitle: "Bingo Kazanma Oranı", value: bingoStatsLoading ? "..." : `${bingoWinRate}%` },
              { icon: Psychology, titleKey: "profile.stats.bingo.longestStreak", fallbackTitle: "Bingo En Uzun Seri", value: bingoStatsLoading ? "..." : bingoLongestStreak.toLocaleString(i18n.language) },
            ];
          } else { // Hangman
            gameSpecificStats = [
              { icon: SportsKabaddi, titleKey: "profile.stats.hangman.totalGames", fallbackTitle: "Toplam Oyun", value: hangmanOverallStatsLoading ? "..." : (hangmanOverallStats?.totalGamesPlayed?.toLocaleString(i18n.language) || "0") },
              { icon: Timeline, titleKey: "profile.stats.hangman.winRate", fallbackTitle: "Kazanma Oranı", value: hangmanOverallStatsLoading ? "..." : `${hangmanWinRate}%` },
              {
                icon: Assessment,
                titleKey: "profile.stats.hangman.accuracy",
                fallbackTitle: "Tahmin Başarı Oranı",
                value: hangmanOverallStatsLoading
                  ? "..."
                  : (hangmanOverallStats?.accuracy !== undefined
                      ? `${(hangmanOverallStats.accuracy * 100).toFixed(1)}%`
                      : "0.0%"
                    )
              },
            ];
          }

          const allStats = [...gameSpecificStats, friendStatCard];

          return allStats.map((stat, index) => (
            <StatCard
              key={stat.titleKey}
              icon={stat.icon}
              title={t(stat.titleKey, stat.fallbackTitle)}
              value={stat.value}
              sx={{ "& .MuiSvgIcon-root": { color: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main } }}
              theme={theme}
            />
          ));
        })()}
      </Box>


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
                color: theme.palette.text.contrast || theme.palette.primary.contrastText,
                bgcolor:
                  theme.palette.mode === "light"
                    ? "primary.light"
                    : "secondary.main",
              },
            },
          }}
        >
          {/* Tab order: 0: Statistics, 1: Achievements, 2: History */}
          <Tab icon={<Assessment />} label={t("profile.tabs.statistics", "Statistics")} id="profile-tab-0" aria-controls="profile-tabpanel-0"/>
          <Tab icon={<Extension />} label={t("profile.tabs.achievements", "Achievements")} id="profile-tab-1" aria-controls="profile-tabpanel-1"/>
          <Tab icon={<HistoryEdu />} label={t("profile.tabs.history", "History")} id="profile-tab-2" aria-controls="profile-tabpanel-2"/>
        </Tabs>
      </Box>

      <Box
        sx={{
          mt: 2,
          p: 3,
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: 3,
        }}
      >
        {/* Statistics Tab Content (activeTab === 0) */}
        {activeTab === 0 && (
          <Box role="tabpanel" hidden={activeTab !== 0} id="profile-tabpanel-0" aria-labelledby="profile-tab-0">
            <Tabs
              value={activeStatsSubTab}
              onChange={(e, newValue) => setActiveStatsSubTab(newValue)}
              variant="fullWidth"
              indicatorColor="secondary"
              textColor="secondary"
              sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', "& .MuiTab-root": { fontSize: '0.875rem', minHeight: 48, "&.Mui-selected": { fontWeight: '600' }, "& .MuiSvgIcon-root": {mr:0.5, fontSize:'1.25rem'} } }}
              aria-label={t("profile.subTabs.statsAriaLabel", "Game Statistics Tabs")}
            >
              <Tab icon={<ViewList />} label={t("profile.subTabs.bingo", "Bingo")} id="stats-subtab-0" aria-controls="stats-subtabpanel-0" />
              <Tab icon={<SportsKabaddi />} label={t("profile.subTabs.hangman", "Hangman")} id="stats-subtab-1" aria-controls="stats-subtabpanel-1"/>
            </Tabs>
            <Box role="tabpanel" hidden={activeStatsSubTab !== 0} id="stats-subtabpanel-0" aria-labelledby="stats-subtab-0">
              {activeStatsSubTab === 0 && (<BingoOverallStats stats={bingoStats} loading={bingoStatsLoading} error={bingoStatsError} theme={theme} />)}
            </Box>
            <Box role="tabpanel" hidden={activeStatsSubTab !== 1} id="stats-subtabpanel-1" aria-labelledby="stats-subtab-1">
              {activeStatsSubTab === 1 && (<HangmanOverallStats stats={hangmanOverallStats} loading={hangmanOverallStatsLoading} error={hangmanOverallStatsError} theme={theme} />)}
            </Box>
          </Box>
        )}

        {/* Achievements Tab Content (activeTab === 1) */}
        {activeTab === 1 && (
          <Box role="tabpanel" hidden={activeTab !== 1} id="profile-tabpanel-1" aria-labelledby="profile-tab-1">
            <ProfileSection.Achievements
              bingoLongestStreak={bingoLongestStreak}
              bingoWinRate={bingoWinRate}
              bingoLoading={bingoStatsLoading}
              bingoTotalGames={bingoStats?.totalGames}
              hangmanWinRate={hangmanWinRate}
              hangmanAccuracy={hangmanAccuracyPercent}
              hangmanLoading={hangmanOverallStatsLoading}
              hangmanTotalGames={hangmanOverallStats?.totalGamesPlayed}
              theme={theme}
              t={t}
            />
          </Box>
        )}

        {/* History Tab Content (activeTab === 2) */}
        {activeTab === 2 && (
           <Box role="tabpanel" hidden={activeTab !== 2} id="profile-tabpanel-2" aria-labelledby="profile-tab-2">
            <Tabs
              value={activeHistorySubTab}
              onChange={(e, newValue) => setActiveHistorySubTab(newValue)}
              variant="fullWidth"
              indicatorColor="secondary"
              textColor="secondary"
               sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', "& .MuiTab-root": { fontSize: '0.875rem', minHeight: 48, "&.Mui-selected": { fontWeight: '600' }, "& .MuiSvgIcon-root": {mr:0.5, fontSize:'1.25rem'} } }}
              aria-label={t("profile.subTabs.historyAriaLabel", "Game History Tabs")}
            >
              <Tab icon={<ViewList />} label={t("profile.subTabs.bingo", "Bingo")} id="history-subtab-0" aria-controls="history-subtabpanel-0"/>
              <Tab icon={<SportsKabaddi />} label={t("profile.subTabs.hangman", "Hangman")} id="history-subtab-1" aria-controls="history-subtabpanel-1"/>
            </Tabs>
            <Box role="tabpanel" hidden={activeHistorySubTab !== 0} id="history-subtabpanel-0" aria-labelledby="history-subtab-0">
              {activeHistorySubTab === 0 && (<BingoGameHistory stats={bingoStats} loading={bingoStatsLoading} error={bingoStatsError} />)}
            </Box>
            <Box role="tabpanel" hidden={activeHistorySubTab !== 1} id="history-subtabpanel-1" aria-labelledby="history-subtab-1">
             {activeHistorySubTab === 1 && (<HangmanGameHistory stats={hangmanGameHistory} loading={hangmanGameHistoryLoading} error={hangmanGameHistoryError} />)}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Profile;