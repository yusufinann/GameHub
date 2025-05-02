import { Box} from '@mui/material';
import React, { useEffect, useState } from 'react';

const FingerPushingButton = ({ isHovering, onClick }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    if (isHovering) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isHovering]);
  
  return (
    <Box
      sx={{
        position: "relative",
        width: "160px",
        height: "160px",
        mb: -2,
        transform: isAnimating ? "translateY(10px)" : "translateY(0)",
        transition: "transform 0.3s ease-in-out",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 72 72"
        width="100%"
        height="100%"
        fill="none"
      >
        {/* Red Button - Modified to be a button shape */}
        <rect
          x="31"
          y={isAnimating ? "62" : "60"}
          width="10"
          height="6"
          rx="2"
          fill="#ea5a47"
          stroke="#000"
          strokeWidth="1"
        />
              
        {/* Finger */}
        <path
          fill="#fcea2b"
          d="m44.066 27.414l-1.01-2.074a6.2 6.2 0 0 1-.602-2.146l-.297-3.167a11.6 11.6 0 0 0-1.925-5.392a9 9 0 0 0-.53-.706l-.985-1.185a8.6 8.6 0 0 0-2.524-2.063l-1.145-.617a9.2 9.2 0 0 0-3.11-1.012l-.908-.125a11.6 11.6 0 0 0-5.214.484l-.85.282a9.6 9.6 0 0 0-3.523 2.096l-1.17 1.096A9.4 9.4 0 0 0 18.4 15.34l-.32.605a10.65 10.65 0 0 0-1.234 4.804l-.182 11.154a2.44 2.44 0 0 0 .923 1.95c.59.468 1.414.507 2.046.096l2.264-1.47l.143.2a5.05 5.05 0 0 0 1.54 1.4a1.91 1.91 0 0 0 1.951-.01l2.036-1.224l1.256 1.115a3.68 3.68 0 0 0 2.513.928l2.702-2.061l.145 5.71l-.053 5.842l-.026 1.935c0 .675-.106 2.747-.106 3.22c0 1.656.106 3.113 1.563 3.63c.108.038.538.144.65.132l.397-.08l.808-.291c.318-.225.715-.186.821-2.584l-.01-2.924l.075-8.275V28.166l1.1 3.519l1.214 2.048l3.966 1.24a1.91 1.91 0 0 0 2.123-.71a2.14 2.14 0 0 0 .084-2.37l-2.44-3.964a6 6 0 0 1-.282-.515Zm-10.627 21.95l.003.088c-.018.03-.032.061-.05.091z"
          style={{ 
            transform: isAnimating ? "translate(0, 10px)" : "",
            transition: "transform 0.3s ease-in-out" 
          }}
        />
        
        {/* Finger outlines */}
        <g
          stroke="#000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          style={{ 
            transform: isAnimating ? "translate(0, 10px)" : "",
            transition: "transform 0.3s ease-in-out" 
          }}
        >
          <path d="M16.004 21.435c0-7.463 6.05-13.513 13.513-13.513s13.514 6.05 13.514 13.513m-27.027.718v9.854m5.742.241a2.874 2.874 0 1 1-5.743-.241"></path>
          <path d="M27.492 32.44a2.874 2.874 0 1 1-5.744-.242"></path>
          <path d="M27.488 32.55a2.874 2.874 0 1 1-5.73-.462m11.512.744a2.874 2.874 0 1 1-5.736-.368m19.659-1.458a2.874 2.874 0 1 1-4.135 3.993M39.02 51.204a2.874 2.874 0 1 1-5.75 0m.001-18.342v18.342m5.748 0V28.383m2.432 4.798l1.608 1.818m-.029-13.717c-.059 3.575 1.108 6.059 2.712 7.819m-.045-.05l1.496 1.955M20 65h8m16 0h8m-21 0v-5m10 5v-5m-11 0h12"></path>
        </g>
      </svg>
    </Box>
  );
};

export default FingerPushingButton;