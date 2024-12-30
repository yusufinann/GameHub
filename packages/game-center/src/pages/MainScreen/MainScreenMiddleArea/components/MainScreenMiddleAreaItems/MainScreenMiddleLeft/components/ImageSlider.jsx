import React from 'react';
import { Box, IconButton } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { sliderStyles } from '../styles';
import { useImageSlider } from './useImageSlider';



const ImageSlider = () => {
  const { currentImage, handleNext, handlePrev, images,setCurrentImage } = useImageSlider();

  return (
    <>
      <Box sx={sliderStyles.imageContainer}>
        <Box
          component="img"
          src={images[currentImage]}
          alt="background"
          sx={sliderStyles.image}
        />
      </Box>
      <Box sx={sliderStyles.navigation}>
        <IconButton onClick={handlePrev} sx={sliderStyles.navigationButton}>
          <KeyboardArrowLeft />
        </IconButton>
        <Box sx={sliderStyles.dots}>
          {images.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentImage(index)}
              sx={{
                ...sliderStyles.dot,
                ...(index === currentImage && sliderStyles.activeDot),
              }}
            />
          ))}
        </Box>
        <IconButton onClick={handleNext} sx={sliderStyles.navigationButton}>
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    </>
  );
};

export default ImageSlider;
