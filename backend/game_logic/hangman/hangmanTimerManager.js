// game_logic/hangman/hangmanTimerManager.js

const activeTurnTimers = new Map();

export function setTimerWithCallback(lobbyCode, callback, delay) {
  if (activeTurnTimers.has(lobbyCode)) {
    const oldTimerId = activeTurnTimers.get(lobbyCode);
    clearTimeout(oldTimerId);
    activeTurnTimers.delete(lobbyCode);
  }

  const newTimerId = setTimeout(async () => {
    if (activeTurnTimers.get(lobbyCode) === newTimerId) {
      activeTurnTimers.delete(lobbyCode);
      try {
        await callback();
      } catch (error) {
        console.error(`[TIMER_MGR] Error executing timer callback for lobby ${lobbyCode}, timerId ${newTimerId}:`, error);
      }
    } else {
      console.log(`[TIMER_MGR] Stale timer ${newTimerId} for lobby ${lobbyCode} detected. Callback NOT executed.`);
    }
  }, delay);

  activeTurnTimers.set(lobbyCode, newTimerId);
}

export function hasTimer(lobbyCode) {
  return activeTurnTimers.has(lobbyCode);
}

export function clearAndRemoveTimer(lobbyCode) {
  if (activeTurnTimers.has(lobbyCode)) {
    const timerId = activeTurnTimers.get(lobbyCode);
    clearTimeout(timerId);
    activeTurnTimers.delete(lobbyCode);
    return true;
  }
  return false;
}

export function getTimer(lobbyCode) {
  return activeTurnTimers.get(lobbyCode);
}

export function deleteTimer(lobbyCode) {
    if(activeTurnTimers.has(lobbyCode)){
        activeTurnTimers.delete(lobbyCode);

        return true;
    }
    return false;
}