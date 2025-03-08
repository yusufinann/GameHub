import React from "react";
import Sidebar from "../Sidebar";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "../../shared/context/SnackbarContext";
import { LobbyProvider } from "../MainScreen/MainScreenMiddleArea/context";
import { WebSocketProvider } from "../../shared/context/WebSocketContext/context";
import FriendsSidebar from "../FriendsSidebar";
import { FriendsProvider } from "../Profile/context";
function MainContainer() {
  //  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        height: "100%",
        width: "100%",
      }}
    >
      <WebSocketProvider>
        {/* Left Sidebar */}
        <Sidebar />

        {/* Content Section */}

        <LobbyProvider>
          {" "}
          <FriendsProvider>
            <SnackbarProvider>
              <Box
                sx={{
                  display: "flex",
                  height: "100%",
                  width: "80vw",
                  flexDirection: "column",
                  flexGrow: 1,
                  padding: "10px",
                  overflow: "hidden",
                  borderRadius: "10px", // Rounded corners
                  //border: `2px solid ${theme.palette.primary.main}`, // Theme-based accent border
                }}
              >
                <Outlet />
              </Box>
              {/* Right Sidebar  */}
              <FriendsSidebar /> {/* for now, just to try it out */}
            </SnackbarProvider>
          </FriendsProvider>
        </LobbyProvider>
      </WebSocketProvider>
    </Box>
  );
}

export default MainContainer;
