import { Box } from '@mui/material'
import React from 'react'
import battyBingo from '../../../../assets/battyBingo.png'
import hangmanPage from '../../../../assets/hangmanPage.png'

const DummyArea = ({ gameId }) => {

  const dummyImage =
    gameId === '1'
      ? `url(${battyBingo})`
      : gameId === '2'
      ? `url(${hangmanPage})`
      : 'none'

  return (
    <Box
      sx={{
        height: { xs: '25vh', sm: '30vh', md: '40vh' },
        position: 'relative',
        zIndex: 1,
        mt: 5,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto', // Center horizontally within parent
      }}
    >
      <Box
        sx={{
          height: '100%',
          width: '100%',
          backgroundImage: dummyImage,      
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'drop-shadow(5px 5px 10px rgba(0,0,0,0.3))',
        }}
      />
    </Box>
  )
}

export default DummyArea