import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  useTheme,
  IconButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useGames } from "../../../../service/useGames";
import TrendGameItem from "./FeaturedGameItem";

const HotAndNewList = () => {
  const theme = useTheme();
  const { data: games, loading, error } = useGames({ limit: 10, offset: 10 });
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const SCROLL_AMOUNT = 300;
  const checkScrollability = useCallback(() => {
    const element = scrollContainerRef.current;
    if (element) {
      const tolerance = 1;
      const currentScrollLeft = element.scrollLeft;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;

      setCanScrollLeft(currentScrollLeft > tolerance);
      setCanScrollRight(currentScrollLeft < maxScrollLeft - tolerance);
    } else {
      setCanScrollLeft(false);
      setCanScrollRight(true);
    }
  }, []);
  useEffect(() => {
    const element = scrollContainerRef.current;

    const timer = setTimeout(() => {
      checkScrollability();
    }, 100);

    element?.addEventListener("scroll", checkScrollability);
    window.addEventListener("resize", checkScrollability);

    return () => {
      clearTimeout(timer);
      element?.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [games, checkScrollability]);

  const handleScroll = (direction) => {
    const element = scrollContainerRef.current;
    if (element) {
      const currentScroll = element.scrollLeft;
      const amount = direction === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
      element.scrollTo({
        left: currentScroll + amount,
        behavior: "smooth",
      });
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress
          color="success"
          sx={{ color: theme.palette.success.main }}
        />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" sx={{ textAlign: "center", my: 2 }}>
        Hata: {error.message}
      </Typography>
    );

  const showArrows = games && games.length > 0;

  return (
    <Container maxWidth="xl" disableGutters>
      <Box sx={{ mb: 3, px: { xs: 2, sm: 3, md: 2 } }}>
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 700,
            position: "relative",
            pl: 2.5,
            fontSize: { xs: "1.4rem", sm: "1.6rem", md: "1.8rem" },
            "&:before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "50%",
              transform: "translateY(-50%)",
              height: "85%",
              width: "6px",
              backgroundColor: theme.palette.primary.main,
              borderRadius: "6px",
            },
            "&:after": {
              content: '""',
              position: "absolute",
              left: "10px",
              bottom: "-8px",
              width: "40px",
              height: "3px",
              backgroundColor: theme.palette.primary.light,
              borderRadius: "3px",
            },
          }}
        >
          Hot & New
        </Typography>

        <Box sx={{ position: "relative", px: { xs: 0, sm: "40px" } }}>
          {" "}
          {/* Left Arrow */}
          {showArrows && (
            <IconButton
              aria-label="scroll left"
              onClick={() => handleScroll("left")}
              disabled={!canScrollLeft}
              sx={{
                position: "absolute",
                left: { xs: "-10px", sm: "0px" }, // Adjust position
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                color: theme.palette.grey[800],
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
                "&.Mui-disabled": {
                  opacity: 0.3,
                  backgroundColor: "rgba(200, 200, 200, 0.5)",
                },
              }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          )}
          {/* Scrollable Container */}
          <Box
            ref={scrollContainerRef}
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              overflowX: "auto",
              pb: 2,
              pt: 1,
              gap: { xs: 1.5, sm: 2, md: 3 },
              scrollBehavior: "smooth",
              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: theme.palette.grey[100],
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: theme.palette.primary.main,
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: theme.palette.primary.dark,
                },
              },
              scrollbarWidth: "auto", 
            }}
          >
            {games.map((game, index) => (
              <Box
                key={game.id}
                sx={{
                  width: {
                    xs: "85%",
                    sm: "45%",
                    md: "30%",
                    lg: "22%",
                  },
                  minWidth: {
                    xs: "220px",
                    sm: "240px",
                  },
                  flexShrink: 0,
                  transform: "scale(0.98)",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "scale(1)",
                    zIndex: 2,
                  },
                }}
              >
                <TrendGameItem
                  title={game.title}
                  thumbnail={game.thumbnail}
                  openGiveawayUrl={game.open_giveaway_url}
                />
              </Box>
            ))}
          </Box>
          {/* Right Arrow */}
          {showArrows && (
            <IconButton
              aria-label="scroll right"
              onClick={() => handleScroll("right")}
              disabled={!canScrollRight}
              sx={{
                position: "absolute",
                right: { xs: "-10px", sm: "0px" }, 
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 10,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                color: theme.palette.grey[800],
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
                "&.Mui-disabled": {
                  opacity: 0.3,
                  backgroundColor: "rgba(200, 200, 200, 0.5)",
                },
              }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default HotAndNewList;