import React from "react";
import Sidebar from "../Sidebar";
import { Box, useTheme } from "@mui/material";
import RoomsSidebar from "../RoomsSidebar";
import { Outlet } from "react-router-dom";

function MainContainer() {
  const theme = useTheme();
  return (
    <Box sx={{ display: "flex", flexDirection:"row", height:"100%" ,width:"100%" }}>
      {/* Left Sidebar */}
        <Sidebar />    
      {/*Content Section */}
      <Box    sx={{
        display: 'flex',
        height: '100%',
        width: '80vw',
        flexDirection: 'column',
        flexGrow: 1,
        padding: '10px',
        overflow: 'hidden',
        borderRadius: '10px', // Rounded corners
       // border: '1px solid rgb(238, 143, 41)', // Accent border
       border: '2px solid rgb(26, 139, 121)',
       
       [theme.breakpoints.up('md')]: {  //960px ve üzerindeki ekranlar için stili uygular.
          marginLeft: '10px',
       },
       [theme.breakpoints.up('sm')]: {  //Küçük ekranlar (600px'den büyük) için geçerli
        marginLeft: '10px',   
         },
       [theme.breakpoints.down('sm')]: {  //Küçük ekranlar (600px'den küçük) için geçerli
       marginLeft: '10px',   
        },
      }}> <Outlet/></Box>
     
      {/* Right Sidebar (Rooms Sidebar) */}
      <RoomsSidebar />
    </Box>
  );
}

export default MainContainer;
