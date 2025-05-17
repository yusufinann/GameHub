import React, { createContext, useState, useRef, useEffect } from 'react';

export const GameSettingsContext = createContext();

const BINGO_SOUND_ENABLED_KEY = "bingoSoundEnabled";
const HANGMAN_SOUND_ENABLED_KEY = "hangmanSoundEnabled"; 

export const GameSettingsProvider = ({ children }) => {

  const [bingoSoundEnabled, setBingoSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(BINGO_SOUND_ENABLED_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const bingoSoundEnabledRef = useRef(bingoSoundEnabled);

  useEffect(() => {
    bingoSoundEnabledRef.current = bingoSoundEnabled;
  }, [bingoSoundEnabled]);

  const toggleBingoSound = () => {
    setBingoSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(BINGO_SOUND_ENABLED_KEY, JSON.stringify(newValue));
      return newValue;
    });
  };


  const [hangmanSoundEnabled, setHangmanSoundEnabled] = useState(() => {
    const saved = localStorage.getItem(HANGMAN_SOUND_ENABLED_KEY);
    return saved !== null ? JSON.parse(saved) : true;
  });
  const hangmanSoundEnabledRef = useRef(hangmanSoundEnabled);

  useEffect(() => {
    hangmanSoundEnabledRef.current = hangmanSoundEnabled;
  }, [hangmanSoundEnabled]);

  const toggleHangmanSound = () => {
    setHangmanSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem(HANGMAN_SOUND_ENABLED_KEY, JSON.stringify(newValue));
      return newValue;
    });
  };

  const value = {
    soundEnabled: bingoSoundEnabled,
    toggleSound: toggleBingoSound,
    soundEnabledRef: bingoSoundEnabledRef,
    bingoSoundEnabled,
    toggleBingoSound,
    bingoSoundEnabledRef,
    hangmanSoundEnabled,
    toggleHangmanSound,
    hangmanSoundEnabledRef,
  };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
};