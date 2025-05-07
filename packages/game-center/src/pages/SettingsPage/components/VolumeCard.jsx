import React from "react";
import {
  Box,
  Typography,
  Paper,
  Switch,
  Slider,
  useTheme,
  alpha,
  Grow,
} from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const VolumeCard = ({
  soundEnabled,
  soundVolume,
  handleSoundChange,
  handleVolumeChange,
  handleVolumeChangeCommitted,
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
              {soundEnabled ? (
                <VolumeUpIcon fontSize="large" />
              ) : (
                <VolumeOffIcon fontSize="large" />
              )}
            </Box>
            <Typography variant="h5" fontWeight="bold" color="white">
              {t("volumeCard.title")}
            </Typography>
          </Box>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", mx: -1.5 }}>
              <Box sx={{ width: { xs: "100%", md: "50%" }, p: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 2,
                    backgroundColor: alpha(bg.default, 0.5),
                    borderRadius: 3,
                  }}
                >
                  <Typography variant="body1" fontWeight="medium">
                    {soundEnabled
                      ? t("volumeCard.soundOnLabel")
                      : t("volumeCard.soundOffLabel")}
                  </Typography>
                  <Switch
                    checked={soundEnabled}
                    onChange={handleSoundChange}
                    color="warning"
                    aria-label={
                      soundEnabled
                        ? t("volumeCard.soundOnSwitchAriaLabel")
                        : t("volumeCard.soundOffSwitchAriaLabel")
                    }
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": {
                        color: theme.palette.warning.main,
                      },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                        {
                          backgroundColor: alpha(
                            theme.palette.warning.main,
                            0.5
                          ),
                        },
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ width: { xs: "100%", md: "50%" }, p: 1.5 }}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: alpha(bg.default, 0.5),
                    borderRadius: 3,
                    opacity: soundEnabled ? 1 : 0.5,
                    pointerEvents: soundEnabled ? "auto" : "none",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <VolumeOffIcon fontSize="small" />
                    <Slider
                      value={soundVolume}
                      onChange={handleVolumeChange}
                      onChangeCommitted={handleVolumeChangeCommitted}
                      aria-label={t("volumeCard.volumeSliderAriaLabel")}
                      min={0}
                      max={100}
                      sx={{
                        color: theme.palette.warning.main,
                        "& .MuiSlider-thumb": {
                          width: 20,
                          height: 20,
                          "&:hover, &.Mui-active": {
                            boxShadow: `0px 0px 0px 8px ${alpha(
                              theme.palette.warning.main,
                              0.16
                            )}`,
                          },
                        },
                      }}
                    />
                    <VolumeUpIcon fontSize="small" />
                    <Typography variant="body2" sx={{ minWidth: 36 }}>
                      {soundVolume}%
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", mx: -1, mt: 2 }}>
              <Box sx={{ width: { xs: "100%", md: "33.33%" }, p: 1 }}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(bg.default, 0.3),
                    opacity: soundEnabled ? 1 : 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {t("volumeCard.musicLabel")}
                    </Typography>
                    <Switch
                      size="small"
                      defaultChecked={true}
                      disabled={!soundEnabled}
                      aria-label={t("volumeCard.musicSwitchAriaLabel")}
                    />
                  </Box>
                  <Slider
                    size="small"
                    defaultValue={80}
                    disabled={!soundEnabled}
                    aria-label={t("volumeCard.musicSliderAriaLabel")}
                    sx={{ color: theme.palette.warning.light }}
                  />
                </Paper>
              </Box>
              <Box sx={{ width: { xs: "100%", md: "33.33%" }, p: 1 }}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(bg.default, 0.3),
                    opacity: soundEnabled ? 1 : 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {t("volumeCard.soundEffectsLabel")}
                    </Typography>
                    <Switch
                      size="small"
                      defaultChecked={true}
                      disabled={!soundEnabled}
                      aria-label={t("volumeCard.soundEffectsSwitchAriaLabel")}
                    />
                  </Box>
                  <Slider
                    size="small"
                    defaultValue={90}
                    disabled={!soundEnabled}
                    aria-label={t("volumeCard.soundEffectsSliderAriaLabel")}
                    sx={{ color: theme.palette.warning.light }}
                  />
                </Paper>
              </Box>
              <Box sx={{ width: { xs: "100%", md: "33.33%" }, p: 1 }}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    backgroundColor: alpha(bg.default, 0.3),
                    opacity: soundEnabled ? 1 : 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {t("volumeCard.uiSoundsLabel")}
                    </Typography>
                    <Switch
                      size="small"
                      defaultChecked={true}
                      disabled={!soundEnabled}
                      aria-label={t("volumeCard.uiSoundsSwitchAriaLabel")}
                    />
                  </Box>
                  <Slider
                    size="small"
                    defaultValue={70}
                    disabled={!soundEnabled}
                    aria-label={t("volumeCard.uiSoundsSliderAriaLabel")}
                    sx={{ color: theme.palette.warning.light }}
                  />
                </Paper>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grow>
    </Box>
  );
};

export default VolumeCard;
