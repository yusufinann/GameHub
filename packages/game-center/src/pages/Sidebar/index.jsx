import React, { useState, useEffect } from 'react';
import { Box, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SidebarHeader from './components/SidebarHeader';
import SidebarMenu from './components/SidebarMenu';
import SidebarFooter from './components/SidebarFooter';

// StyledSidebar to handle collapse
const StyledSidebar = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})(({ theme, isExpanded }) => ({
  height: "100vh",
  position: 'sticky',
  top: 0,
  backgroundColor: "#caecd5",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  transition: "width 0.3s ease",
  width: isExpanded ? "13vw" : "70px", // Width based on isExpanded state
  [theme.breakpoints.down("md")]: {
    width: isExpanded ? "20vw" : "70px",
  },
  [theme.breakpoints.down("sm")]: {
    width: "70px",
  },
}));

// Collapsible Header Component
const CollapsibleHeader = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isExpanded'
})(({ theme, isExpanded }) => ({
  position: 'relative',
  '.MuiTypography-root': {
    display: isExpanded ? 'block' : 'none', // Show text when expanded
  },
  '.MuiAvatar-root': {
    width: isExpanded ? '8vw' : '40px',
    height: isExpanded ? '16vh' : '40px',
    transition: 'all 0.3s ease',
  },
}));

// Expand Icon Button Styled
const ExpandIconButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: '5px',
  top: '5px',
  zIndex: 1,
  '&:hover': { 
    backgroundColor: '#269366', 
    color: 'white' 
  },
  [theme.breakpoints.down("sm")]: {
    right: '10px', // Adjust position on small screens if necessary
    top: '10px',
  },
}));

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md')); // Check if the screen is small

  // Auto-collapse on small or medium screens
  useEffect(() => {
    if (isSmallScreen) {
      setIsExpanded(false); // Collapse the sidebar on small and medium screens
    }
  }, [isSmallScreen]);

  return (
    <StyledSidebar 
      isExpanded={isExpanded}
    >
      {/* Only show the expand icon on larger screens */}
      {!isSmallScreen && (
        <ExpandIconButton
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </ExpandIconButton>
      )}

      <CollapsibleHeader isExpanded={isExpanded}>
        <SidebarHeader isExpanded={isExpanded} />
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
 