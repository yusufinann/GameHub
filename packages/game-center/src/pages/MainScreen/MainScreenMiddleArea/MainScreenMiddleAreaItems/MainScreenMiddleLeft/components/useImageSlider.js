import { useState, useEffect } from 'react';

const images = [
  "https://cdn.pixabay.com/photo/2024/10/07/20/38/ai-generated-9103752_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/10/03/14/13/orc-9093828_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/03/02/15/41/ai-generated-8608836_1280.png",
];

export const useImageSlider = () => {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return {
    currentImage,
    setCurrentImage,
    handleNext,
    handlePrev,
    images,
  };
};