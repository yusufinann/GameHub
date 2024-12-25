import React, { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SidebarHeader from './components/SidebarHeader';
import SidebarMenu from './components/SidebarMenu';
import SidebarFooter from './components/SidebarFooter';

// Modify StyledSidebar to handle collapse
const StyledSidebar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})(({ theme, isExpanded }) => ({
  height: "100vh",
  position: 'sticky', // Important for absolute positioning of child elements
  top: 0,
  backgroundColor: "#caecd5",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "width 0.3s ease",
  width: isExpanded ? "13vw" : "70px",
  [theme.breakpoints.down("md")]: {
    width: isExpanded ? "20vw" : "70px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "70px",
  },
}));


// Modify Header Component
const CollapsibleHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})(({ theme, isExpanded }) => ({
  position: 'relative',
  '.MuiTypography-root': {
    display: isExpanded ? 'block' : 'none',
  },
  '.MuiAvatar-root': {
    width: isExpanded ? '8vw' : '40px',
    height: isExpanded ? '16vh' : '40px',
    transition: 'all 0.3s ease',
  },
}));

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Auto-collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600) {
        setIsExpanded(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <StyledSidebar isExpanded={isExpanded}>
      <IconButton
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          position: 'absolute',
          right: 5,
          top: 5,
          zIndex: 1,
          '&:hover': { bgcolor: '#269366', color: 'white' }
        }}
      >
        {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </IconButton>

      <CollapsibleHeader isExpanded={isExpanded}>
        <SidebarHeader />
      </CollapsibleHeader>

      <Box sx={{ 
        '.MuiListItemText-root': { 
          display: isExpanded ? 'block' : 'none' 
        },
        '.MuiListItemIcon-root': {
          minWidth: isExpanded ? '40px' : '100%',
          justifyContent: isExpanded ? 'flex-start' : 'center'
        }
      }}>
        <SidebarMenu />
      </Box>

      <Box sx={{
        '.MuiTypography-root': { 
          display: isExpanded ? 'block' : 'none' 
        }
      }}>
        <SidebarFooter isExpanded={isExpanded} />
      </Box>
    </StyledSidebar>
  );
}

export default Sidebar;