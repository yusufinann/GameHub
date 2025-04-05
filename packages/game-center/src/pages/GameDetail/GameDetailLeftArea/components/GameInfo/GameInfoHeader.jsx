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
import hallowenBingo from "../../../../../assets/hallowenBingo.png";
import { LobbyInfo } from "../../../../../shared/components/LobbyItem/LobbyInfo";

function GameInfoHeader({game, filteredLobbies }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const upcomingEvents = filteredLobbies.filter(
    (lobby) => lobby.lobbyType === "event"
  );

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
        overflow: "hidden",
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
              display: { xs: "none", sm: "block" },
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
              display: { xs: "none", sm: "block" },
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
              display: { xs: "none", sm: "block" },
              zIndex: 2,
            }}
          />
        </>
      )}
      <Box
        sx={{
          height: { xs: "10vh", sm: "12vh" },
          width: "100%",
          backgroundColor: "transparent",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          mb: { xs: 1, sm: 0 },
        }}
      >
        <Typography
          variant="h2"
          sx={{
            color: "#FFE14C",
            fontWeight: "bold",
            fontSize: { xs: "3rem", sm: "4rem", md: "5rem", lg: "6rem" },
            fontFamily: '"Bangers", cursive', 
            letterSpacing: "0.08em",
            transform: "rotate(-3deg)",
            textShadow: {
              xs: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 3px 3px 0px rgba(0,0,0,0.3)",
              sm: "3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 4px 4px 0px rgba(0,0,0,0.3)",
              md: "4px 4px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, 6px 6px 0px rgba(0,0,0,0.3)",
            },
            WebkitTextStroke: { xs: "1px black", sm: "2px black" },
            position: "relative",
            whiteSpace: "nowrap",
            overflow: "visible",
            "&:before": {
              content: '""',
              position: "absolute",
              width: "110%",
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
          {game.title}
        </Typography>

        <CelebrationIcon
          sx={{
            fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            color: "#FF5252",
            ml: { xs: 1, sm: 2 },
            display: { xs: "none", sm: "block" },
          }}
        />
      </Box>
      <Box
        sx={{
          background:
            "linear-gradient(135deg, rgba(50,135,97,0.9) 50%, rgba(202,236,213,0.9) 100%)",
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
            background: "linear-gradient(90deg, #FFE14C, transparent, #FFE14C)",
            borderRadius: "20px 20px 0 0",
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily: '"Bangers", cursive',
            fontWeight: "bold",
            color: "white",
            marginBottom: 2,
            textShadow: "2px 2px 0 #000",
            letterSpacing: "0.05em",
          }}
        >
          Upcoming Events
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
                background: "#FFE14C",
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
                    backgroundColor: "white",
                    borderRadius: "16px",
                    boxShadow: "0 6px 12px rgba(0,0,0,0.2)",
                    overflow: "hidden",
                    transition: "all 0.3s",
                    "&:hover": {
                      transform: "translateY(-8px) scale(1.02)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.25)",
                    },
                    border: "3px solid #FFE14C",
                    position: "relative",
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'space-between' 
                  }}
                >
                  <Box
                    sx={{
                      height: "50px",
                      background: "linear-gradient(90deg, #2e7d32, #388e3c)",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderBottom: "2px dashed #f0f0f0",
                    }}
                  >
                    <CalendarTodayIcon
                      sx={{ color: "white", marginRight: 1 }}
                    />
                    <Typography
                      sx={{
                        color: "white",
                        fontFamily: '"Boogaloo", cursive',
                        fontWeight: "bold",
                        fontSize: "1.1rem",
                      }}
                    >
                      {formattedDate}
                    </Typography>
                  </Box>

                  <Box sx={{ padding: 1.5 }}>
                    <Typography
                      sx={{
                        fontFamily: '"Fredoka One", cursive',
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: "#333",
                      }}
                    >
                      {lobby.lobbyName}
                    </Typography>


                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        marginTop: 1,
                        backgroundColor: "#e8f5e9",
                        padding: "4px 8px",
                        borderRadius: "16px",
                        width: "fit-content",
                      }}
                    >
                      <PeopleIcon
                        sx={{
                          fontSize: 16,
                          color: "#2e7d32",
                          marginRight: 0.5,
                        }}
                      />
                      <Typography
                        sx={{
                          fontSize: "12px",
                          color: "#2e7d32",
                          fontWeight: "bold",
                        }}
                      >
                        {lobby.maxMembers} Person Capacity
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
                        background: "#FFE14C",
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
              color: "white",
              minHeight: "150px",
            }}
          >
            <EventBusyIcon
              sx={{
                fontSize: 60,
                color: "white",
                marginBottom: 2,
                filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Bubblegum Sans", cursive',
                fontWeight: "bold",
                mb: 1,
                textShadow: "1px 1px 2px rgba(0,0,0,0.4)",
              }}
            >
              There are no upcoming events.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                fontFamily: '"Nunito", sans-serif',
              }}
            >
              You can follow new events from here when they are added.
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          height: { xs: "25vh", sm: "30vh", md: "40vh" },
          width: { xs: "35vw", sm: "30vw", md: "35vw" },
          backgroundImage: `url(${hallowenBingo})`,
          backgroundSize: "contain", 
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right",
          position: "absolute",
          right: 0,
          top: 0,
          filter: "drop-shadow(5px 5px 10px rgba(0,0,0,0.3))",
          zIndex: 1,
        }}
      ></Box>
    </Box>
  );
}

export default GameInfoHeader;