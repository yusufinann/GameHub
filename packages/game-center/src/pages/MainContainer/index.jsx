import React from "react";
import Sidebar from "../Sidebar";
import { Box } from "@mui/material";
import RoomsSidebar from "../RoomsSidebar";
import MainScreen from "../MainScreen";

function MainContainer() {
  return (
    <Box sx={{ display: "flex", flexDirection:"row", height:"100%" ,width:"100%" }}>
      {/* Left Sidebar */}
        <Sidebar />    
      {/*Content Section */}
      <MainScreen />
      {/* Right Sidebar (Rooms Sidebar) */}
      <RoomsSidebar />
    </Box>
  );
}

export default MainContainer;
