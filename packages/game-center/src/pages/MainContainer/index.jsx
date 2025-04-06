import React from "react";
import Sidebar from "../Sidebar";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { SnackbarProvider } from "../../shared/context/SnackbarContext";
import { WebSocketProvider } from "../../shared/context/WebSocketContext/context";
import FriendsSidebar from "../FriendsSidebar";
import { FriendsProvider } from "../../shared/context/FriendsContext/context";
import { GlobalNotificationProvider } from "../FriendsSidebar/context";
import { GameSettingsProvider} from "../GameDetail/GameDetailRightArea/context";
import { LobbyProvider } from "../../shared/context/LobbyContext/context";
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
          <GlobalNotificationProvider>
            <FriendsProvider>
              <SnackbarProvider>
                <GameSettingsProvider>
                <Box
                  sx={{
                    display: "flex",
                    height: "100%",
                    width: "80vw",
                    flexDirection: "column",
                    flexGrow: 1,
                    padding: "10px",
                    overflow: "hidden",
                    borderRadius: "10px",
                  }}
                >
                  <Outlet />
                </Box>
                </GameSettingsProvider>
                <FriendsSidebar />
              </SnackbarProvider>
            </FriendsProvider>
          </GlobalNotificationProvider>
        </LobbyProvider>
      </WebSocketProvider>
    </Box>
  );
}

export default MainContainer;
