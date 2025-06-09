import redisClient from "../../redisClient.js";
import { connectedClients } from "../../websocket/webSocketServer.js";
import * as timerManager from './hangmanTimerManager.js';
const HANGMAN_GAME_KEY_PREFIX = 'hangman:game:';
export const GAME_EXPIRY_SECONDS = 24 * 60 * 60;
export const ENDED_GAME_EXPIRY_SECONDS = 15 * 60;
const getRedisKey = (lobbyCode) => `${HANGMAN_GAME_KEY_PREFIX}${lobbyCode}`;

export async function getGameFromRedis(lobbyCode) {
  if (!redisClient.isOpen) {
    console.error('Redis client not connected. Attempting to fetch game:', lobbyCode);
    return null;
  }
  try {
    const gameKey = getRedisKey(lobbyCode);
    const gameJson = await redisClient.get(gameKey);
    if (!gameJson) return null;
    return JSON.parse(gameJson);
  } catch (error) {
    console.error(`Error getting game ${lobbyCode} from Redis:`, error);
    return null;
  }
}
export function prepareGameForRedis(gameObject) {
  const gameCopy = { ...gameObject };
  delete gameCopy.turnTimer;
  delete gameCopy.lobbyName;
  if (gameCopy.players) {
    const newPlayers = {};
    for (const playerId in gameCopy.players) {
      if (Object.prototype.hasOwnProperty.call(gameCopy.players, playerId) && gameCopy.players[playerId]) {
        const { ws, ...playerWithoutWs } = gameCopy.players[playerId];
        newPlayers[playerId] = playerWithoutWs;
      }
    }
    gameCopy.players = newPlayers;
  }
  return gameCopy;
}

export async function saveGameToRedis(game) {
  if (!game || !game.lobbyCode) {
    console.error("Attempted to save invalid game object to Redis", game);
    return;
  }
  if (!redisClient.isOpen) {
    console.error('Redis client not connected. Attempting to save game:', game.lobbyCode);
    return;
  }
  try {
    const gameKey = getRedisKey(game.lobbyCode);
    const gameToSave = prepareGameForRedis(game);

   const expirySeconds = gameToSave.gameEnded
       ? ENDED_GAME_EXPIRY_SECONDS  
       : GAME_EXPIRY_SECONDS; 

    await redisClient.set(
      gameKey,
      JSON.stringify(gameToSave),
      {
        EX: expirySeconds,
      }
    );
  }  catch (error) {
    console.error(`Error stringifying or saving game ${game.lobbyCode} to Redis:`, error);
  }
}

export async function deleteGameFromRedis(lobbyCode) {
  if (!redisClient.isOpen) {
    console.error('Redis client not connected. Attempting to delete hangman game:', lobbyCode);
    return;
  }
  try {
    const gameKey = getRedisKey(lobbyCode);
    await redisClient.del(gameKey);
      timerManager.clearAndRemoveTimer(lobbyCode);
  } catch (error) {
    console.error(`Error deleting hangman game ${lobbyCode} from Redis:`, error);
  }
}
export function hydrateGamePlayersWithWs(game) {
    if (!game || !game.players) return game;
    const hydratedGame = { ...game, players: {} };
    for (const playerId in game.players) {
        if (Object.prototype.hasOwnProperty.call(game.players, playerId)) {
            const playerCopy = { ...game.players[playerId] };
            if (connectedClients.has(playerId)) {
                playerCopy.ws = connectedClients.get(playerId);
            } else {
                delete playerCopy.ws;
            }
            hydratedGame.players[playerId] = playerCopy;
        }
    }
    return hydratedGame;
}

function generateMaskedWord(word, collectiveCorrectGuesses, language = 'en') {
  const collectiveSet = new Set(collectiveCorrectGuesses.map(l => l.toLowerCase()));
  return Array.from(word).map(letter => {
    const lowerLetter = letter.toLowerCase();
    if (lowerLetter === ' ') return ' ';
    return collectiveSet.has(lowerLetter) ? letter : '_';
  }).join('');
}

export function getSharedGameState(game) {
  let allPlayersCorrectGuesses = new Set();
  if (game.players) {
    Object.values(game.players).forEach(p => {
        if (game.isHostParticipant || p.userId !== game.host) {
            if(p.correctGuesses && Array.isArray(p.correctGuesses)) {
                 p.correctGuesses.forEach(g => allPlayersCorrectGuesses.add(g));
            }
        }
    });
  }
  const currentMaskedWord = game.word ? generateMaskedWord(game.word, Array.from(allPlayersCorrectGuesses), game.languageMode) : '';
  const activePlayersForTimerCheck = game.playerOrder ? game.playerOrder.filter(playerId => {
    const p = game.players[playerId];
    return p && !p.eliminated && !p.won;
  }) : [];
  const isMultiplayerTurnWithTimer = activePlayersForTimerCheck.length > 1;
  return {
    lobbyCode: game.lobbyCode,
    lobbyName: game.lobbyName,
    maskedWord: currentMaskedWord,
    category: game.category,
    gameStarted: game.gameStarted,
    gameEnded: game.gameEnded,
    currentPlayerId: game.currentPlayerId,
    hostId: game.host,
    languageMode: game.languageMode,
    wordSourceMode: game.wordSourceMode,
    isHostParticipant: game.isHostParticipant,
    turnEndsAt: (game.gameStarted && !game.gameEnded && game.turnStartTime && isMultiplayerTurnWithTimer)
                  ? game.turnStartTime + 12000
                  : null,
    playerStates: game.players ? Object.fromEntries(
      Object.values(game.players).map(p => [p.userId, {
        userId: p.userId,
        userName: p.userName,
        name: p.name,
        avatar: p.avatar || null,
        remainingAttempts: (game.isHostParticipant || p.userId !== game.host) ? p.remainingAttempts : 0,
        won: (game.isHostParticipant || p.userId !== game.host) ? (p.won || false) : false,
        eliminated: (game.isHostParticipant || p.userId !== game.host) ? (p.eliminated || false) : false,
        isHost: game.host === p.userId,
        isParticipating: (game.isHostParticipant || p.userId !== game.host)
      }])
    ) : {},
    rankings: game.gameEnded ? (game.rankingsSnapshot || []) : [],
    wordLength: game.word ? game.word.length : 0,
  };
}