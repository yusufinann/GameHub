import { Box } from '@mui/material'
import React from 'react'
import MainScreenLeft from './components/MainScreenLeft'
import MainScreenRight from './components/MainScreenRight'

function MainScreenMiddleArea() {
  return (
    <Box sx={{display:'flex', flexDirection:'row', marginTop:'20px', gap:'10px',height:'100%',width:'100%'}}>
    <MainScreenLeft/>
    <MainScreenRight/>
    </Box>
  )
}

export default MainScreenMiddleArea