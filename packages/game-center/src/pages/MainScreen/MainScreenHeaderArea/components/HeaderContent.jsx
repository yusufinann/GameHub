import React, { useState, useCallback } from "react";
import { Box, Typography, IconButton, Fade, Card } from "@mui/material";
import { ArrowBackIos, ArrowForwardIos, PlayArrow } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const HeaderContent = ({
  theme,
  slides,
  activeSlideIndex,
  onSlideNavigation,
  onHoverStateChange,
}) => {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);

  const nextSlide = useCallback(() => {
    if (onSlideNavigation && slides.length > 0) {
      onSlideNavigation((prev) => (prev + 1) % slides.length);
    }
  }, [slides.length, onSlideNavigation]);

  const prevSlide = useCallback(() => {
    if (onSlideNavigation && slides.length > 0) {
      onSlideNavigation(
        (prev) => (prev - 1 + slides.length) % slides.length
      );
    }
  }, [slides.length, onSlideNavigation]);

  const goToSlide = useCallback(
    (index) => {
      if (onSlideNavigation) {
        onSlideNavigation(index);
      }
    },
    [onSlideNavigation]
  );

  if (slides.length === 0) return null;

  return (
    <Card
      sx={{
        position: "relative",
        flex: 1,
        overflow: "hidden",
        background: "transparent",
        boxShadow: "none",
        border: "none",
      }}
      onMouseEnter={() => {
        setIsHovered(true);
        if (onHoverStateChange) onHoverStateChange(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (onHoverStateChange) onHoverStateChange(false);
      }}
    >
      {slides.map((slide, index) => {
        const isActive = index === activeSlideIndex;
        const isFirstSlide = index === 0;

        return (
          <Fade key={slide.id} in={isActive} timeout={800}>
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: isActive ? "flex" : "none",
                background: "transparent",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  width: "45%",
                  display: { xs: "none", md: "flex" },
                  alignItems: "flex-end",
                  justifyContent: "center",
                  zIndex: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: "90%",
                    width: "auto",
                    maxWidth: "85%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <Box
                    component="img"
                    src={slide.characterImg}
                    alt={t("alt.gameCharacter")}
                    loading={isActive || isFirstSlide ? "eager" : "lazy"}
                    fetchPriority={isFirstSlide ? "high" : "auto"}
                    decoding="async"
                    sx={{
                      height: "100%",
                      width: "auto",
                      objectFit: "contain",
                      filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))",
                      transition: "filter 0.3s ease",
                      "&:hover": {
                        filter: "drop-shadow(0 25px 50px rgba(0,0,0,0.5))",
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: { xs: "center", md: "flex-start" },
                  px: { xs: 3, sm: 4, md: 5 },
                  py: 4,
                  zIndex: 3,
                  position: "relative",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "20%",
                    right: { xs: "10%", md: "20%" },
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    bgcolor: theme.palette.background.elevation[1],
                    backdropFilter: "blur(10px)",
                    border: `1px solid ${theme.palette.divider}`,
                    display: { xs: "none", sm: "block" },
                    boxShadow:
                      theme.palette.mode === "neonOcean"
                        ? `0 0 20px ${theme.palette.primary.main}40`
                        : theme.shadows[4],
                  }}
                />
                <Typography
                  variant="h3"
                  component="h1"
                  sx={{
                    fontWeight: 700,
                    background:
                      theme.palette.text.gradient ||
                      `linear-gradient(45deg, ${slide.color}, ${theme.palette.text.primary})`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem", lg: "3.5rem" },
                    mb: 3,
                    textAlign: { xs: "center", md: "left" },
                    lineHeight: 1.1,
                    textShadow:
                      theme.palette.mode === "neonOcean"
                        ? `0 0 20px ${slide.color}80, 0 4px 8px rgba(0,0,0,0.3)`
                        : "0 4px 8px rgba(0,0,0,0.3)",
                    transform: isActive ? "translateY(0)" : "translateY(20px)",
                    opacity: isActive ? 1 : 0,
                    transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {t(slide.titleKey)}
                </Typography>
                <Box
                  sx={{ display: { xs: "flex", md: "flex" }, alignItems: "center", gap: 2 }}
                >
                  <IconButton
                    sx={{
                      bgcolor: theme.palette.background.elevation[2],
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.text.primary,
                      width: 56,
                      height: 56,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow:
                        theme.palette.mode === "neonOcean"
                          ? `0 0 15px ${theme.palette.primary.main}60`
                          : theme.shadows[4],
                      "&:hover": {
                        bgcolor: theme.palette.background.elevation[3],
                        transform: "scale(1.05)",
                        boxShadow:
                          theme.palette.mode === "neonOcean"
                            ? `0 0 25px ${theme.palette.primary.main}80, 0 8px 25px rgba(0,0,0,0.3)`
                            : "0 8px 25px rgba(0,0,0,0.3)",
                      },
                    }}
                  >
                    <PlayArrow sx={{ fontSize: 28 }} />
                  </IconButton>
                  <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.secondary, fontWeight: 500, display: { xs: "none", sm: "block" } }}
                  >
                    {t(slide.buttonTextKey)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        );
      })}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 1.5,
          zIndex: 10,
          bgcolor: theme.palette.background.elevation[2],
          backdropFilter: "blur(10px)",
          borderRadius: 3,
          px: 2,
          py: 1,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow:
            theme.palette.mode === "neonOcean"
              ? `0 0 15px ${theme.palette.primary.main}40`
              : theme.shadows[8],
        }}
      >
        {slides.map((_, i) => (
          <Box
            key={i}
            onClick={() => goToSlide(i)}
            sx={{
              width: i === activeSlideIndex ? 24 : 12,
              height: 12,
              borderRadius: 6,
              bgcolor: i === activeSlideIndex ? theme.palette.primary.main : theme.palette.action.disabled,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              cursor: "pointer",
              "&:hover": {
                bgcolor:
                  i === activeSlideIndex
                    ? theme.palette.primary.light
                    : theme.palette.text.secondary,
                transform: "scale(1.1)",
              },
            }}
          />
        ))}
      </Box>

      <IconButton
        onClick={prevSlide}
        aria-label={t("navigation.previousSlide")}
        sx={{
          position: "absolute",
          left: 20,
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.palette.text.primary,
          bgcolor: theme.palette.background.elevation[2],
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.palette.divider}`,
          width: 48,
          height: 48,
          boxShadow:
            theme.palette.mode === "neonOcean"
              ? `0 0 15px ${theme.palette.primary.main}40`
              : theme.shadows[4],
          "&:hover": {
            bgcolor: theme.palette.background.elevation[3],
            transform: "translateY(-50%) scale(1.1)",
            boxShadow:
              theme.palette.mode === "neonOcean"
                ? `0 0 20px ${theme.palette.primary.main}60`
                : theme.shadows[8],
          },
          zIndex: 10,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isHovered ? 1 : 0.7,
        }}
      >
        <ArrowBackIos sx={{ fontSize: 20 }} />
      </IconButton>

      <IconButton
        onClick={nextSlide}
        aria-label={t("navigation.nextSlide")}
        sx={{
          position: "absolute",
          right: 20,
          top: "50%",
          transform: "translateY(-50%)",
          color: theme.palette.text.primary,
          bgcolor: theme.palette.background.elevation[2],
          backdropFilter: "blur(10px)",
          border: `1px solid ${theme.palette.divider}`,
          width: 48,
          height: 48,
          boxShadow:
            theme.palette.mode === "neonOcean"
              ? `0 0 15px ${theme.palette.primary.main}40`
              : theme.shadows[4],
          "&:hover": {
            bgcolor: theme.palette.background.elevation[3],
            transform: "translateY(-50%) scale(1.1)",
            boxShadow:
              theme.palette.mode === "neonOcean"
                ? `0 0 20px ${theme.palette.primary.main}60`
                : theme.shadows[8],
          },
          zIndex: 10,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: isHovered ? 1 : 0.7,
        }}
      >
        <ArrowForwardIos sx={{ fontSize: 20 }} />
      </IconButton>

      <Box
        sx={{
          position: "absolute",
          top: 20,
          right: 20,
          bgcolor: theme.palette.background.elevation[2],
          backdropFilter: "blur(10px)",
          color: theme.palette.text.primary,
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontSize: "0.875rem",
          zIndex: 10,
          border: `1px solid ${theme.palette.divider}`,
          fontWeight: 500,
          boxShadow:
            theme.palette.mode === "neonOcean"
              ? `0 0 10px ${theme.palette.primary.main}40`
              : theme.shadows[2],
        }}
      >
        <Typography variant="body2" sx={{ color: "inherit" }}>
          {activeSlideIndex + 1} / {slides.length}
        </Typography>
      </Box>
    </Card>
  );
};

export default HeaderContent;