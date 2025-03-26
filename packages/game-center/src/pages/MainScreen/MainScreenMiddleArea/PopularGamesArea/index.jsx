import { Box } from '@mui/material'
import React from 'react'
import GameShowcase from './GameShowcase'
import GameList from './GameList'

const PopularGamesArea = () => {
  return (
    <Box
    sx={{
      display: "flex",
      flexDirection: {
        xs: "column",
        md: "column",
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        height: "50vh",
        width: "40vw",
      }}
    >
      <GameShowcase />
    </Box>
    <Box
      sx={{
        height: "20vh",
        width: "40vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden", 
      }}
    >
      <GameList />
    </Box>
  </Box>
  )
}

export default PopularGamesArea
