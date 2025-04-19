import React from 'react';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import SidebarHeader from './components/SidebarHeader';
import SidebarMenu from './components/SidebarMenu';
import SidebarFooter from './components/SidebarFooter';

const StyledSidebar = styled(Box)(({ theme }) => ({
  height: "calc(100vh - 20px)", // Subtract total vertical margin (10px top + 10px bottom)
  position: "sticky",
  top: "10px", // Add top spacing for sticky positioning
  borderRadius: "20px",
  margin: "10px", // This will now work correctly on all sides
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  width: "70px",
}));

function Sidebar() {
  return (
    <StyledSidebar>
      <SidebarHeader />
      <Box sx={{ 
        '.MuiListItemIcon-root': {
          minWidth: '100%',
          justifyContent: 'center'
        }
      }}>
        <SidebarMenu />
      </Box>
      <SidebarFooter />
    </StyledSidebar>
  );
}

export default Sidebar;