// contexts/GameSettingsContext.js
import React, { createContext, useState, useRef, useEffect } from 'react';

export const GameSettingsContext = createContext();

export const GameSettingsProvider = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("soundEnabled");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem("soundEnabled", JSON.stringify(newValue));
      return newValue;
    });
  };

  const value = {
    soundEnabled,
    toggleSound,
    soundEnabledRef, // Optionally provide the ref if needed directly by consumers
  };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
};