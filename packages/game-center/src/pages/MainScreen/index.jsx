import { Box } from '@mui/material';
import React from 'react';
import MainScreenHeader from './MainScreenHeaderArea/index';
import MainScreenMiddleArea from './MainScreenMiddleArea/index';
import MainScreenBottomArea from './MainScreenBottomArea/index';
function MainScreen() {
   // Access theme for breakpoints

  return (
    <Box>
      <MainScreenHeader />
      <MainScreenMiddleArea />
      <MainScreenBottomArea />
    </Box>
  );
}

export default MainScreen;
