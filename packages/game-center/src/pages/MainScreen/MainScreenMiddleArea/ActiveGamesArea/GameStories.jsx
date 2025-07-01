import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
  IconButton,
  Stack,
  Grow,
  Paper,
  useTheme,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import InfoIcon from "@mui/icons-material/Info";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ExtensionIcon from '@mui/icons-material/Extension';
import { useTranslation } from "react-i18next";

const SectionHeader = ({ title, icon }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3, mt: 1, px: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: theme.palette.secondary.gold, color: theme.palette.secondary.contrastText, borderRadius: "50%", p: 1, boxShadow: `0 2px 8px ${theme.palette.background.elevation[1]}` }}>
        {icon}
      </Box>
      <Typography variant="h2" sx={{ fontWeight: 600, background: theme.palette.text.title, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        {title}
      </Typography>
    </Box>
  );
};

const GameCard = ({ game, index, isLastItem, hoverIndex, handleMouseEnter, handleMouseLeave }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const showInfo = hoverIndex === index;

  return (
    <Box sx={{ width: 240, flex: '0 0 auto', position: "relative" }}>
      <Box
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        sx={{
          width: "100%",
          position: "relative",
          borderRadius: 3,
          overflow: "visible",
          zIndex: showInfo ? 50 : 1,
          transition: "all 0.3s ease",
          transform: showInfo ? "scale(1.05)" : "scale(1)",
          boxShadow: showInfo ? `0 12px 24px ${theme.palette.background.elevation[3]}` : `0 4px 12px ${theme.palette.background.elevation[1]}`,
          "&:hover": { cursor: "pointer", "& .overlay-indicator": { opacity: 1 } },
        }}
      >
        <Card sx={{ width: "100%", borderRadius: 3, overflow: "hidden", backgroundColor: theme.palette.background.card, position: "relative" }}>
          <CardMedia
            component="img"
            image={game.image}
            alt={t(game.titleKey)}
            loading="lazy"
            decoding="async"
            width="240"
            height="180"
            sx={{
              height: 180,
              transition: "all 0.3s ease",
              filter: showInfo ? "brightness(0.7)" : "brightness(1)",
            }}
          />

          <Box
            className="overlay-indicator"
            sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.3)", opacity: 0, transition: "opacity 0.3s ease" }}
          >
            <Box sx={{ display: "flex", gap: 1, p: 1, borderRadius: 8, backgroundColor: "rgba(0,0,0,0.6)" }}>
              <InfoIcon sx={{ color: "white" }} />
            </Box>
          </Box>

          {game.isLive && (
            <Box sx={{ position: "absolute", right: 16, top: 16, backgroundColor: theme.palette.error.main, color: theme.palette.error.contrastText, px: 1.5, py: 0.5, borderRadius: 5, display: "flex", alignItems: "center", gap: 0.7, zIndex: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "white", animation: "pulse 1.5s infinite", "@keyframes pulse": { "0%": { opacity: 1 }, "50%": { opacity: 0.5 }, "100%": { opacity: 1 } } }} />
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {t('game.live')}
              </Typography>
            </Box>
          )}

          <CardContent sx={{ backgroundColor: theme.palette.background.card, color: theme.palette.text.primary, p: 2, "&:last-child": { pb: 2 } }}>
            <Typography variant="h6" sx={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} noWrap>
              {t(game.titleKey)}
            </Typography>
          </CardContent>
        </Card>

        {showInfo && (
          <Grow in={showInfo} timeout={300}>
            <Box sx={{ position: "absolute", top: 30, ...(isLastItem ? { right: "100%" } : { left: "100%" }), width: 350, zIndex: 999 }}>
              <Box sx={{ position: "relative", ...(isLastItem ? { mr: 2 } : { ml: 2 }) }}>
                <Box
                  sx={{
                    position: "absolute",
                    ...(isLastItem
                      ? { right: -12, top: 25, width: 0, height: 0, borderTop: "12px solid transparent", borderLeft: `12px solid ${theme.palette.background.card}`, borderBottom: "12px solid transparent" }
                      : { left: -12, top: 25, width: 0, height: 0, borderTop: "12px solid transparent", borderRight: `12px solid ${theme.palette.background.card}`, borderBottom: "12px solid transparent" }),
                    filter: "drop-shadow(-3px 0px 3px rgba(0,0,0,0.1))",
                  }}
                />
                <Paper
                  elevation={6}
                  sx={{ backgroundColor: theme.palette.background.card, p: 3, color: theme.palette.text.primary, borderRadius: 4, boxShadow: `0 10px 30px ${theme.palette.background.elevation[3]}`, border: `1px solid ${theme.palette.background.elevation[1]}`, overflow: "hidden", position: "relative" }}
                >
                  <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: theme.palette.background.stripe, zIndex: 0 }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, position: "relative", zIndex: 1 }}>
                    <Typography variant="h5" gutterBottom sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}>
                      {t(game.titleKey)}
                    </Typography>
                    <Typography variant="body2" display="block" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                      {t('game.released')}: {game.releaseDate}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {t(game.descriptionKey)}
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        size="medium"
                        sx={{ bgcolor: theme.palette.secondary.main, color: theme.palette.secondary.contrastText, borderRadius: 3, px: 2, py: 1, fontWeight: 600, boxShadow: `0 4px 12px ${theme.palette.background.elevation[1]}`, "&:hover": { bgcolor: theme.palette.secondary.dark, transform: "translateY(-2px)", boxShadow: `0 6px 16px ${theme.palette.background.elevation[2]}` }, transition: "all 0.3s ease" }}
                      >
                        {t('game.play')}
                      </Button>
                      <IconButton
                        size="medium"
                        sx={{ bgcolor: theme.palette.background.offwhite, borderRadius: "50%", width: 42, height: 42, boxShadow: `0 4px 12px ${theme.palette.background.elevation[1]}`, "&:hover": { bgcolor: theme.palette.background.elevation[1], transform: "translateY(-2px)", boxShadow: `0 6px 16px ${theme.palette.background.elevation[2]}` }, transition: "all 0.3s ease" }}
                      >
                        <FavoriteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Grow>
        )}
      </Box>
    </Box>
  );
};

const GameStories = () => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const theme = useTheme();
  const { t } = useTranslation();

  const games = [
    { id: 1, titleKey: "game.valheim.title", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg", releaseDate: "2 Feb 2021", descriptionKey: "game.valheim.description" },
    { id: 2, titleKey: "game.halflife.title", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/546560/header.jpg", releaseDate: "23 Mar 2020", descriptionKey: "game.halflife.description" },
    { id: 3, titleKey: "game.traffic.title", image: "https://wallpapercave.com/wp/wp8747352.jpg", releaseDate: "15 May 2023", descriptionKey: "game.traffic.description", isLive: true },
    { id: 4, titleKey: "game.reddead.title", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg", releaseDate: "1 Jan 2023", descriptionKey: "game.reddead.description" },
    { id: 5, titleKey: "game.hogwarts.title", image: "https://cdn.cloudflare.steamstatic.com/steam/apps/990080/header.jpg", releaseDate: "10 Feb 2023", descriptionKey: "game.hogwarts.description" },
  ];

  const displayedGames = games.slice(currentIndex, currentIndex + 3);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(games.length - 3, prev + 1));
  };

  const handleMouseEnter = (index) => {
    setHoverIndex(index);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <Box sx={{ position: "relative", minHeight: "50vh", width: "100%", overflow: "visible", background: theme.palette.background.gradient, display: "flex", flexDirection: "column", borderRadius: 4, p: 2, boxShadow: `0 8px 24px ${theme.palette.background.elevation[2]}` }}>
      <SectionHeader title={t("section.gameStories")} icon={<ExtensionIcon />} />
      <Box sx={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "center", my: 4 }}>
        <IconButton
          sx={{ position: "absolute", left: { xs: 0, sm: 5, md: 0 }, zIndex: 10, color: theme.palette.text.contrast, backgroundColor: theme.palette.background.elevation[2], width: { xs: 40, md: 50 }, height: { xs: 40, md: 50 }, "&:hover": { backgroundColor: theme.palette.primary.light, transform: "scale(1.1)" }, transition: "all 0.3s ease", boxShadow: `0 4px 12px ${theme.palette.background.elevation[2]}` }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <NavigateBeforeIcon fontSize="large" />
        </IconButton>
        <Stack direction="row" spacing={4} sx={{ width: "80%", justifyContent: "center", px: { xs: 6, md: 8 } }}>
          {displayedGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              isLastItem={index === displayedGames.length - 1}
              hoverIndex={hoverIndex}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
            />
          ))}
        </Stack>
        <IconButton
          sx={{ position: "absolute", right: { xs: 0, sm: 5, md: 0 }, zIndex: 10, color: theme.palette.text.contrast, backgroundColor: theme.palette.background.elevation[2], width: { xs: 40, md: 50 }, height: { xs: 40, md: 50 }, "&:hover": { backgroundColor: theme.palette.primary.light, transform: "scale(1.1)" }, transition: "all 0.3s ease", boxShadow: `0 4px 12px ${theme.palette.background.elevation[2]}` }}
          onClick={handleNext}
          disabled={currentIndex >= games.length - 3}
        >
          <NavigateNextIcon fontSize="large" />
        </IconButton>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 2 }}>
        {Array.from({ length: Math.ceil(games.length / 3) }).map((_, idx) => (
          <Box
            key={idx}
            sx={{ width: 30, height: 6, borderRadius: 3, backgroundColor: currentIndex / 3 === idx ? theme.palette.secondary.main : theme.palette.background.elevation[1], transition: "all 0.3s ease", cursor: "pointer" }}
            onClick={() => setCurrentIndex(idx * 3)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default GameStories;