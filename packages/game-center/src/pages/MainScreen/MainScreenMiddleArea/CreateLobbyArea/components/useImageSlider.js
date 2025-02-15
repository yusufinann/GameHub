import { useState, useEffect, useRef, useCallback } from 'react';

const images = [
  "https://cdn.pixabay.com/photo/2024/10/07/20/38/ai-generated-9103752_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/10/03/14/13/orc-9093828_1280.jpg",
  "https://cdn.pixabay.com/photo/2024/03/02/15/41/ai-generated-8608836_1280.png",
];

export const useImageSlider = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const intervalRef = useRef(null);

  // Resim ön yükleme (Preloading)
  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Otomatik geçiş fonksiyonu
  // const startSlider = useCallback(() => {
  //   intervalRef.current = setInterval(() => {
  //     setCurrentImage((prev) => (prev + 1) % images.length);
  //   }, 5000);
  // }, []);

  // useEffect(() => {
  //   startSlider();
  //   return () => clearInterval(intervalRef.current);
  // }, [startSlider]);

  const handleNext = useCallback(() => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, []);

  return { currentImage, setCurrentImage, handleNext, handlePrev, images };
};
