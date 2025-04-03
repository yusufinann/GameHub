import { Box } from '@mui/material'
import React from 'react'
import battyBingo from '../../../../assets/battyBingo.png'
const DummyArea = () => {
  return (
    <Box
    sx={{
        height: { xs: "25vh", sm: "30vh", md: "40vh" },
        width: { xs: "35vw", sm: "30vw", md: "35vw" },
      position: 'relative', 
      zIndex: 1,   mt:5,
    }}
  >
   <Box
        sx={{
          height: { xs: "25vh", sm: "30vh", md: "40vh" },
          width: { xs: "35vw", sm: "30vw", md: "35vw" },
          backgroundImage: `url(${battyBingo})`,
          backgroundSize: "contain", 
          backgroundRepeat: "no-repeat",
          backgroundPosition: "left", 
          position: "absolute",
           mt:5,
          filter: "drop-shadow(5px 5px 10px rgba(0,0,0,0.3))",
          zIndex: 1,
        }}
      ></Box>
      </Box>
  )
}

export default DummyArea


// DummyArea.jsx (Simplified for testing)
// import { Box } from '@mui/material';
// import React from 'react'

// const DummyArea = () => {
//   return (
//     <Box
//       sx={{
//         height: '200px', // Fixed height for testing
//         width: '200px',  // Fixed width for testing
//         backgroundColor: 'red', // Solid color for easy visibility
//         position: 'relative', // Or 'static' initially to see if it appears in flow
//         zIndex: 1,
//       }}
//     >
//       {/* You can put some text inside to confirm it's rendering */}
//       <div>Dummy Area Test</div>
//     </Box>
//   )
// }

// export default DummyArea