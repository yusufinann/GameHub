import React from "react";
import Sidebar from "../Sidebar";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import FriendsSidebar from "../FriendsSidebar";

function MainContainer() {
  return (
    <Box sx={{ display: "flex", flexDirection: "row", height: "100%", width: "100%" }}>
      <Sidebar />
      <Box sx={{
        display: "flex",
        height: "100%",
        width: "80vw",
        flexDirection: "column",
        flexGrow: 1,
        padding: "10px",
        overflow: "hidden",
        borderRadius: "10px",
      }}>
        <Outlet /> 
      </Box>
      <FriendsSidebar />
    </Box>
  );
}

export default MainContainer;