import React from "react";
import {
  Box,
  Typography,
  Paper,
  Switch,
  useTheme,
  alpha,
  Grow,
} from "@mui/material";
import { VolumeUp as VolumeUpIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const VolumeCard = ({
  bingoSoundEnabled,
  toggleBingoSound,
  hangmanSoundEnabled,
  toggleHangmanSound,
  animateCards,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const primary = theme.palette.primary;
  const bg = theme.palette.background;
  const cardBgGlow =
    theme.palette.mode === "dark"
      ? `0 0 25px ${alpha(primary.dark, 0.5)}, 0 0 15px ${alpha(
          theme.palette.secondary.main,
          0.3
        )}`
      : `0 0 25px ${alpha(primary.main, 0.15)}, 0 0 15px ${alpha(
          theme.palette.secondary.main,
          0.1
        )}`;

  const handleBingoToggle = () => {
    toggleBingoSound();
  };

  const handleHangmanToggle = () => {
    toggleHangmanSound();
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Grow in={animateCards} timeout={700}>
        <Paper
          elevation={6}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            position: "relative",
            background: alpha(bg.card, 0.8),
            backdropFilter: "blur(10px)",
            boxShadow: cardBgGlow,
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: `0 10px 30px ${alpha(
                theme.palette.warning.main,
                0.2
              )}`,
            },
          }}
        >
          <Box
            sx={{
              background: `linear-gradient(135deg, ${
                theme.palette.warning.main
              } 0%, ${primary.medium || primary.main} 100%)`,
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
              }}
            >
              <VolumeUpIcon fontSize="large" sx={{ color: "white" }} />
            </Box>
            <Typography variant="h5" fontWeight="bold" color="white">
              {t("volumeCard.title", "Sound Settings")}
            </Typography>
          </Box>
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: alpha(bg.default, 0.5),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Bingo SVG İkon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  width="36"
                  height="36"
                >
                  <rect
                    x="4"
                    y="4"
                    width="56"
                    height="56"
                    rx="8"
                    fill={theme.palette.mode === "dark" ? "#2a3b4e" : "#f0f4ff"}
                    stroke={theme.palette.info.main}
                    strokeWidth="2"
                  />
                  <text
                    x="32"
                    y="36"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fill={theme.palette.info.main}
                    fontFamily="Arial, sans-serif"
                    fontWeight="bold"
                  >
                    BINGO
                  </text>

                  {/* Bingo kartı noktalar */}
                  <circle
                    cx="16"
                    cy="16"
                    r="3"
                    fill={theme.palette.info.main}
                  />
                  <circle
                    cx="32"
                    cy="16"
                    r="3"
                    fill={theme.palette.info.main}
                  />
                  <circle
                    cx="48"
                    cy="16"
                    r="3"
                    fill={theme.palette.info.main}
                  />
                  <circle
                    cx="16"
                    cy="32"
                    r="3"
                    fill={theme.palette.info.main}
                  />
                  <circle
                    cx="48"
                    cy="32"
                    r="3"
                    fill={theme.palette.info.main}
                  />
                  <circle
                    cx="16"
                    cy="48"
                    r="3"
                    fill={theme.palette.info.main}
                  />
                  <circle
                    cx="32"
                    cy="48"
                    r="3"
                    fill={theme.palette.info.main}
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="3"
                    fill={theme.palette.info.main}
                  />

                  {/* Merkezdeki yıldız efekti */}
                  <circle
                    cx="32"
                    cy="32"
                    r="6"
                    fill={theme.palette.error.main}
                  />
                  <path
                    d="M32,26 L33.5,30.5 L38,32 L33.5,33.5 L32,38 L30.5,33.5 L26,32 L30.5,30.5 Z"
                    fill="#fff"
                  />
                </svg>
                <Typography variant="body1" fontWeight="medium">
                  {t("volumeCard.bingoSoundLabel", "Bingo Game Sounds")}
                </Typography>
              </Box>
              <Switch
                checked={bingoSoundEnabled}
                onChange={handleBingoToggle}
                color="info"
                aria-label={t(
                  "volumeCard.bingoSoundAriaLabel",
                  "Toggle Bingo game sounds"
                )}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.palette.info.main,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: alpha(theme.palette.info.main, 0.5),
                  },
                }}
              />
            </Paper>

            <Paper
              elevation={2}
              sx={{
                p: 2,
                borderRadius: 3,
                backgroundColor: alpha(bg.default, 0.5),
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {/* Adam Asmaca SVG İkon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 64 64"
                  width="36"
                  height="36"
                >
                  <rect
                    width="64"
                    height="64"
                    rx="8"
                    fill={theme.palette.mode === "dark" ? "#263238" : "#f5f5f5"}
                    fillOpacity="0.5"
                  />

                  {/* Darağacı */}
                  <line
                    x1="14"
                    y1="14"
                    x2="42"
                    y2="14"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="14"
                    y1="14"
                    x2="14"
                    y2="50"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="14"
                    y1="50"
                    x2="22"
                    y2="50"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="28"
                    y1="14"
                    x2="28"
                    y2="20"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />

                  {/* Adam */}
                  <circle
                    cx="28"
                    cy="26"
                    r="6"
                    fill="none"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="28"
                    y1="32"
                    x2="28"
                    y2="42"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="28"
                    y1="36"
                    x2="22"
                    y2="32"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="28"
                    y1="36"
                    x2="34"
                    y2="32"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="28"
                    y1="42"
                    x2="23"
                    y2="48"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />
                  <line
                    x1="28"
                    y1="42"
                    x2="33"
                    y2="48"
                    stroke={theme.palette.success.main}
                    strokeWidth="2"
                  />

                  {/* Harfler */}
                  <text
                    x="44"
                    y="24"
                    fontSize="6"
                    fill={theme.palette.success.main}
                  >
                    A
                  </text>
                  <text
                    x="50"
                    y="24"
                    fontSize="6"
                    fill={theme.palette.success.main}
                  >
                    B
                  </text>
                  <text
                    x="44"
                    y="32"
                    fontSize="6"
                    fill={theme.palette.success.main}
                  >
                    C
                  </text>
                  <text
                    x="50"
                    y="32"
                    fontSize="6"
                    fill={theme.palette.success.main}
                  >
                    D
                  </text>
                  <text
                    x="44"
                    y="40"
                    fontSize="6"
                    fill={theme.palette.success.main}
                  >
                    ?
                  </text>
                  <text
                    x="50"
                    y="40"
                    fontSize="6"
                    fill={theme.palette.success.main}
                  >
                    !
                  </text>

                  {/* Kelime alanı */}
                  <line
                    x1="40"
                    y1="50"
                    x2="45"
                    y2="50"
                    stroke={theme.palette.success.main}
                    strokeWidth="1"
                  />
                  <line
                    x1="47"
                    y1="50"
                    x2="52"
                    y2="50"
                    stroke={theme.palette.success.main}
                    strokeWidth="1"
                  />
                  <line
                    x1="54"
                    y1="50"
                    x2="59"
                    y2="50"
                    stroke={theme.palette.success.main}
                    strokeWidth="1"
                  />
                </svg>
                <Typography variant="body1" fontWeight="medium">
                  {t("volumeCard.hangmanSoundLabel", "Hangman Game Sounds")}
                </Typography>
              </Box>
              <Switch
                checked={hangmanSoundEnabled}
                onChange={handleHangmanToggle}
                color="success"
                aria-label={t(
                  "volumeCard.hangmanSoundAriaLabel",
                  "Toggle Hangman game sounds"
                )}
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": {
                    color: theme.palette.success.main,
                  },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                    backgroundColor: alpha(theme.palette.success.main, 0.5),
                  },
                }}
              />
            </Paper>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
};

export default VolumeCard;
