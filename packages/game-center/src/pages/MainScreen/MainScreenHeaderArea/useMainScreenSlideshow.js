import { useState, useEffect, useCallback } from 'react';

export const useMainScreenSlideshow = (numberOfSlides, autoplayDelay = 6000) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const navigateToSlide = useCallback((newIndexOrUpdater) => {
    setCurrentSlideIndex(newIndexOrUpdater);
  }, []);

  const pauseAutoplay = useCallback(() => {
    setIsAutoplayPaused(true);
  }, []);

  const resumeAutoplay = useCallback(() => {
    setIsAutoplayPaused(false);
  }, []);

  useEffect(() => {
    if (isAutoplayPaused || numberOfSlides === 0 || !numberOfSlides) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % numberOfSlides);
    }, autoplayDelay);

    return () => clearInterval(interval);
  }, [numberOfSlides, isAutoplayPaused, autoplayDelay]);

  return {
    currentSlideIndex,
    navigateToSlide,
    pauseAutoplay,
    resumeAutoplay,
  };
};