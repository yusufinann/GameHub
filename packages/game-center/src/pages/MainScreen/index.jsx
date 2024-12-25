import { Box } from '@mui/material';
import React from 'react';
import { useTheme } from '@mui/material/styles';
import MainScreenHeader from './MainScreenHeaderArea/MainScreenHeader';
import MainScreenMiddleArea from './MainScreenMiddleArea';
import MainScreenBottomArea from './MainScreenBottomArea';

function MainScreen() {
  const theme = useTheme(); // Access theme for breakpoints

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        width: '80vw',
        flexDirection: 'column',
        flexGrow: 1,
        padding: '10px',
        overflow: 'hidden',
        borderRadius: '10px', // Rounded corners
        border: '1px solid rgb(238, 143, 41)', // Accent border
       
       [theme.breakpoints.up('md')]: {  //960px ve üzerindeki ekranlar için stili uygular.
          marginLeft: '10px',
       },
       [theme.breakpoints.up('sm')]: {  //Küçük ekranlar (600px'den büyük) için geçerli
        marginLeft: '10px',   
         },
       [theme.breakpoints.down('sm')]: {  //Küçük ekranlar (600px'den küçük) için geçerli
       marginLeft: '10px',   
        },
      }}
    >
      <MainScreenHeader />
      <MainScreenMiddleArea />
      <MainScreenBottomArea />
    </Box>
  );
}

export default MainScreen;
