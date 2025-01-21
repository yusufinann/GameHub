import React from "react";
import Sidebar from "../Sidebar";
import { Box, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import { LobbyProvider } from "../MainScreen/MainScreenMiddleArea/LobbyContext";
import LobbiesSidebar from "../LobbiesSidebar";
import { SnackbarProvider } from "../../shared/context/SnackbarContext";

function MainContainer() {
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100%", width: "100%" }}>
      {/* Left Sidebar */}
      <Sidebar />

      {/* Content Section */}
      <LobbyProvider>
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
              border: `2px solid ${theme.palette.primary.main}`, // Theme-based accent border
              marginLeft: "10px", // Consistent margin
            }}
          >
            <Outlet />
          </Box>

          {/* Right Sidebar (Lobbies Sidebar) */}
          <LobbiesSidebar />
        </SnackbarProvider>
      </LobbyProvider>
    </Box>
  );
}

export default MainContainer;
