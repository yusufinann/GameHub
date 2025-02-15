import React, { useMemo } from 'react';
import { Box, IconButton } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { useImageSlider } from './useImageSlider';

const sliderStyles = {
  imageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  navigation: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  navigationButton: {
    color: 'white',
  },
  dots: {
    display: 'flex',
    gap: 1,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    bgcolor: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.7)',
    },
  },
  activeDot: {
    bgcolor: 'white',
    '&:hover': {
      bgcolor: 'white',
    },
  },
};

const ImageSlider = () => {
  const { currentImage, handleNext, handlePrev, images, setCurrentImage } = useImageSlider();

  const renderedDots = useMemo(
    () =>
      images.map((_, index) => (
        <Box
          key={index}
          onClick={() => setCurrentImage(index)}
          sx={{
            ...sliderStyles.dot,
            ...(index === currentImage && sliderStyles.activeDot),
          }}
        />
      )),
    [currentImage, setCurrentImage, images]
  );

  return (
    <>
      <Box sx={sliderStyles.imageContainer}>
        <Box component="img" src={images[currentImage]} alt="background" sx={sliderStyles.image} />
      </Box>
      <Box sx={sliderStyles.navigation}>
        <IconButton onClick={handlePrev} sx={sliderStyles.navigationButton}>
          <KeyboardArrowLeft />
        </IconButton>
        <Box sx={sliderStyles.dots}>{renderedDots}</Box>
        <IconButton onClick={handleNext} sx={sliderStyles.navigationButton}>
          <KeyboardArrowRight />
        </IconButton>
      </Box>
    </>
  );
};

export default ImageSlider;
