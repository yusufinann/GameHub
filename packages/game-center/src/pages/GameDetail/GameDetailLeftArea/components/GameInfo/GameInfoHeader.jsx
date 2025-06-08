import React from "react";
import {
  Box,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PeopleIcon from "@mui/icons-material/People";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import CelebrationIcon from "@mui/icons-material/Celebration";
import halloweenBingo from "../../../../../assets/halloweenBingo.png";
import hangmanHeader from "../../../../../assets/hangmanHeader.png";
import { LobbyInfo } from "../../../../../shared/components/LobbyItem/LobbyInfo";
import { useTranslation } from "react-i18next";

function GameInfoHeader({ game, filteredLobbies }) {
  const theme = useTheme();
  const{t}=useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const upcomingEvents = filteredLobbies.filter(
    (lobby) => lobby.lobbyType === "event"
  );
const headerImage =
    game.id === 1
      ? `url(${halloweenBingo})`
      : game.id === 2
      ? `url(${hangmanHeader})`
      : 'none';

  return (
    <Box
      sx={{
        minHeight: { xs: "55vh", sm: "35vh" },
        width: "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        borderRadius: { xs: "30px", sm: "50px" },
        background:
          "radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.05) 70%)",
        overflow: "visible",
      }}
    >
      {!isMobile && (
        <>
          <Box
            sx={{
              position: "absolute",
              width: { xs: "40px", sm: "60px" },
              height: { xs: "40px", sm: "60px" },
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #FF5252, #C62828)",
              left: "5%",
              top: "10%",
              opacity: 0.8,
              zIndex: 2,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: { xs: "30px", sm: "40px" },
              height: { xs: "30px", sm: "40px" },
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #42A5F5, #1565C0)",
              left: "15%",
              top: "25%",
              opacity: 0.7,
              zIndex: 2,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: { xs: "35px", sm: "50px" },
              height: { xs: "35px", sm: "50px" },
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #66BB6A, #2E7D32)",
              left: "25%",
              top: "8%",
              opacity: 0.6,
              display: { xs: "none", md: "block" },
              zIndex: 2,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: { xs: "25px", sm: "35px" },
              height: { xs: "25px", sm: "35px" },
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #FFEE58, #F9A825)",
              left: "8%",
              top: "30%",
              opacity: 0.8,
              zIndex: 2,
            }}
          />
        </>
      )}

      <Box
        sx={{
          position: "relative",
          height: { xs: "10vh", sm: "12vh" },
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: { xs: 1, sm: 0 },
          overflow: "visible",
          zIndex: 10,
        }}
      >
        <Typography
          variant="h2"
          sx={{
            position: "absolute",
            top: "50%",
            left: "5%",
            transform: "translateY(-50%) rotate(-3deg)",
            transformOrigin: "center center",
            whiteSpace: "nowrap",
            fontWeight: "bold",
            fontSize: "clamp(3rem, 8vw, 6rem)",
            color: theme.palette.secondary.gold,
            textShadow: {
              xs: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 3px 3px 0px rgba(0,0,0,0.3)",
              sm: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 4px 4px 0px rgba(0,0,0,0.3)",
              md: "4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 6px 6px 0px rgba(0,0,0,0.3)",
            },
            WebkitTextStroke: { xs: "1px black", sm: "2px black" },
            "&:before": {
              content: '""',
              position: "absolute",
              width: "100%",
              height: "10px",
              background: "rgba(0,0,0,0.2)",
              bottom: "-10px",
              left: "-5%",
              borderRadius: "50%",
              filter: "blur(5px)",
              zIndex: -1,
              display: { xs: "none", md: "block" },
            },
          }}
        >
            {t(`games.${game.title}.title`, { fallback: game.title })}
        </Typography>

        <CelebrationIcon
          sx={{
            position: "absolute",
            top: "50%",
            left: "calc(5% + 100%)",
            transform: "translateY(-50%)",
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: theme.palette.error.main,
            display: { xs: "none", sm: "block" },
          }}
        />
      </Box>

      <Box
        sx={{
          background: theme.palette.background.gradientFadeBg,
          width: "100%",
          borderRadius: "20px",
          display: "flex",
          padding: 3,
          overflow: "hidden",
          flexDirection: "column",
          position: "relative",
          zIndex: 1,
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: `linear-gradient(90deg, ${theme.palette.secondary.gold}, transparent, ${theme.palette.secondary.gold})`,
            borderRadius: "20px 20px 0 0",
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: theme.palette.text.primary,
            marginBottom: 2,
            textShadow: "2px 2px 0 #000",
            letterSpacing: "0.05em",
          }}
        >
          {t("Upcoming Events")}
        </Typography>

        {upcomingEvents.length > 0 ? (
          <Box
            sx={{
              display: "flex",
              gap: 2,
              marginTop: 2,
              width: "100%",
              justifyContent: "flex-start",
              overflowX: "auto",
              paddingBottom: 2,
              "&::-webkit-scrollbar": {
                height: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(255,255,255,0.2)",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: theme.palette.secondary.gold,
                borderRadius: "10px",
              },
            }}
          >
            {upcomingEvents.map((lobby) => {
              const [startDate, startTime] = lobby.startTime?.split("T") || [
                null,
                null,
              ];
              const [endDate, endTime] = lobby.endTime?.split("T") || [
                null,
                null,
              ];
              const datePart = startDate ? new Date(startDate) : null;
              const formattedDate = datePart
                ? datePart.toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                  })
                : "Undefined Date";

              return (
                <Box
                  key={lobby.id || lobby.lobbyCode}
                  sx={{
                    width: "180px",
                    height: "160px",
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: "16px",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-1px) scale(1.02)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.25)",
                    },
                    border: `3px solid ${theme.palette.secondary.gold}`,
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      height: "50px",
                      background: `linear-gradient(90deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderBottom: `2px dashed ${theme.palette.background.paper}`,
                    }}
                  >
                    <CalendarTodayIcon
                      sx={{ color: theme.palette.text.contrast, marginRight: 1 }}
                    />
                    <Typography
                      sx={{
                        color: theme.palette.text.contrast,
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {formattedDate}
                    </Typography>
                  </Box>

                  <Box sx={{ padding: 0.5 }}>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        fontSize: "16px", 
                        color: theme.palette.text.primary,
                      }}
                    >
                      {lobby.lobbyName}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 1,
                        backgroundColor: theme.palette.background.offwhite,
                        padding: "4px 8px",
                        borderRadius: "16px",
                        width: "fit-content",
                      }}
                    >
                      <PeopleIcon
                        sx={{
                          fontSize: 16,
                          color: theme.palette.success.main,
                          marginRight: 0.5,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: theme.palette.success.main,
                          fontWeight: "bold",
                        }}
                      >
                        {lobby.maxMembers} {t("Person Capacity")}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ padding: 1 }}>
                    <LobbyInfo
                      startDate={startDate}
                      startTime={startTime}
                      endDate={endDate}
                      endTime={endTime}
                      eventStatus={lobby.lobbyStatus}
                      isMobile={isMobile}
                    />
                  </Box>

                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: "30px",
                      height: "30px",
                      overflow: "hidden",
                      "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        right: 0,
                        width: "30px",
                        height: "30px",
                        background: theme.palette.secondary.gold,
                        transformOrigin: "100% 0%",
                        transform: "rotate(45deg) translateY(-15px)",
                      },
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 4,
              width: "100%",
              paddingLeft: 3,
              paddingRight: 3,
              textAlign: "center",
              color: theme.palette.text.primary,
              minHeight: "150px",
            }}
          >
            <EventBusyIcon
              sx={{
                fontSize: 60,
                color: theme.palette.text.primary,
                marginBottom: 2,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                mb: 1,
                textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              {t("There are no upcoming events")}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              {t("You can follow new events from here when they are added")}.
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          height: { xs: "25vh", sm: "30vh", md: "40vh" },
          width: { xs: "35vw", sm: "30vw", md: "35vw" },
          backgroundImage: headerImage,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right",
          position: "absolute",
          right: 0,
          top: 0,
          filter: "drop-shadow(5px 5px 10px rgba(0,0,0,0.3))",
          zIndex: 1,
        }}
      />
    </Box>
  );
}

export default GameInfoHeader;
