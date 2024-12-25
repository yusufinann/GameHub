import { Box } from '@mui/material';
import React from 'react';
import MainScreenHeader from './MainScreenHeaderArea/MainScreenHeader';
import MainScreenMiddleArea from './MainScreenMiddleArea';
import MainScreenBottomArea from './MainScreenBottomArea';

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
