import Lobby from "../models/lobby.model.js";
import { HangmanGame } from '../models/hangman.model.js';
import mongoose from 'mongoose';
import { getUserDetails } from '../services/userService.js';
import { deleteGameFromRedis, getGameFromRedis, getSharedGameState, hydrateGamePlayersWithWs, saveGameToRedis } from "../game_logic/hangman/hangmanStateManager.js";
import * as timerManager from '../game_logic/hangman/hangmanTimerManager.js'; 

const wordCategories = {
  en: {
    animals: ['elephant', 'giraffe', 'penguin', 'dolphin', 'kangaroo', 'cheetah', 'crocodile', 'butterfly'],
    countries: ['united states', 'germany', 'japan', 'brazil', 'australia', 'canada', 'sweden', 'egypt'],
    fruits: ['strawberry', 'pineapple', 'watermelon', 'blueberry', 'pomegranate', 'kiwi', 'apricot'],
    sports: ['basketball', 'football', 'swimming', 'volleyball', 'gymnastics', 'skateboarding', 'tennis'],
    movies: ['inception', 'avatar', 'titanic', 'interstellar', 'gladiator', 'frozen', 'jaws']
  },
  tr: {
    hayvanlar: ['fil', 'zürafa', 'penguen', 'yunus', 'kanguru', 'çita', 'timsah', 'kelebek'],
    ulkeler: ['türkiye', 'almanya', 'japonya', 'brezilya', 'avustralya', 'kanada', 'isveç', 'mısır'],
    meyveler: ['çilek', 'ananas', 'karpuz', 'yabanmersini', 'nar', 'kivi', 'kayısı', 'şeftali'],
    sporlar: ['basketbol', 'futbol', 'yüzme', 'voleybol', 'jimnastik', 'kaykay', 'tenis', 'güreş'],
    filmler: ['başlangıç', 'avatar', 'titanik', 'yıldızlararası', 'gladyatör', 'karlarülkesi', 'yüzüklerinefendisi']
  }
};

export function broadcastToGame(gameWithWs, dataToSend) {
  if (!gameWithWs || !gameWithWs.players) {
      console.warn("[broadcastToGame] Game or game.players is undefined. Cannot broadcast.", gameWithWs ? gameWithWs.lobbyCode : "Unknown Lobby");
      return;
  }
  const originalGameWithoutWs = { ...gameWithWs };
  if (originalGameWithoutWs.players) {
      const tempPlayers = {};
      for (const pid in originalGameWithoutWs.players) {
          if (Object.prototype.hasOwnProperty.call(originalGameWithoutWs.players, pid)) {
            const { ws, ...playerData } = originalGameWithoutWs.players[pid];
            tempPlayers[pid] = playerData;
          }
      }
      originalGameWithoutWs.players = tempPlayers;
  }
  Object.values(gameWithWs.players).forEach((playerWithWs) => {
    if (playerWithWs && playerWithWs.ws && playerWithWs.ws.readyState === playerWithWs.ws.OPEN) {
      const messageForPlayer = { ...dataToSend };
      const relevantTypesForPlayerSpecificState = [
        "HANGMAN_PLAYER_JOINED", "HANGMAN_GAME_STARTED", "HANGMAN_TURN_CHANGE",
        "HANGMAN_GUESS_MADE", "HANGMAN_WORD_GUESS_ATTEMPT", "HANGMAN_PLAYER_ELIMINATED",
        "HANGMAN_PLAYER_TIMEOUT", "HANGMAN_GAME_OVER_WINNER", "HANGMAN_WORD_REVEALED_GAME_OVER",
        "HANGMAN_GAME_OVER_NO_WINNERS", "HANGMAN_GAME_OVER_HOST_ENDED",
        "HANGMAN_RECONNECTED", "HANGMAN_JOINED_SUCCESS", "HANGMAN_CURRENT_GAME_STATE",
      ];
      if (relevantTypesForPlayerSpecificState.includes(messageForPlayer.type)) {
        messageForPlayer.playerSpecificGameState = getPlayerSpecificGameState(originalGameWithoutWs, playerWithWs.userId);
      }
       const typesThatShouldHaveSharedState = [
          ...relevantTypesForPlayerSpecificState,
          "HANGMAN_PLAYER_LEFT_PREGAME", "HANGMAN_PLAYER_LEFT_MIDGAME"
        ];
      if (typesThatShouldHaveSharedState.includes(messageForPlayer.type)) {
        if (!messageForPlayer.sharedGameState) {
            messageForPlayer.sharedGameState = getSharedGameState(originalGameWithoutWs);
        }
      }
      try {
        const message = JSON.stringify(messageForPlayer);
        playerWithWs.ws.send(message, (err) => {
          if (err) console.error(`Hangman message (${messageForPlayer.type}) send error to ${playerWithWs.userId}:`, err);
        });
      } catch (stringifyError) {
          console.error(`Error stringifying message for ${playerWithWs.userId}:`, stringifyError, messageForPlayer);
      }
    }
  });
}

function getGameRankings(game) {
  let playersForRanking = Object.values(game.players);
  if (game.wordSourceMode === 'host' && game.host) {
    playersForRanking = playersForRanking.filter(p => p.userId !== game.host);
  }
  return playersForRanking
    .filter(player => game.isHostParticipant || player.userId !== game.host)
    .map(player => ({
      playerId: player.userId,
      userName: player.userName,
      name: player.name,
      avatar: player.avatar || null,
      remainingAttempts: player.remainingAttempts,
      correctGuessesCount: player.correctGuesses.length,
      incorrectGuessesCount: player.incorrectGuesses.length,
      won: player.won || false,
      eliminated: player.eliminated || false
    }))
    .sort((a, b) => {
      if (a.won !== b.won) return a.won ? -1 : 1;
      if (a.eliminated !== b.eliminated) return a.eliminated ? 1 : -1;
      if (a.correctGuessesCount !== b.correctGuessesCount) return b.correctGuessesCount - a.correctGuessesCount;
      if (a.incorrectGuessesCount !== b.incorrectGuessesCount) return a.incorrectGuessesCount - b.incorrectGuessesCount;
      return b.remainingAttempts - a.remainingAttempts;
    });
}

function getPlayerSpecificGameState(game, playerId) {
    const player = game.players[playerId];
    if (!player) return null;
    const isParticipating = game.isHostParticipant || playerId !== game.host;
    return {
        correctGuesses: isParticipating ? player.correctGuesses : [],
        incorrectGuesses: isParticipating ? player.incorrectGuesses : [],
        remainingAttempts: isParticipating ? player.remainingAttempts : 0,
        isMyTurn: isParticipating && game.currentPlayerId === playerId && !game.gameEnded && !player.eliminated && !player.won,
        won: isParticipating ? (player.won || false) : false,
        eliminated: isParticipating ? (player.eliminated || false) : false,
        isHost: game.host === playerId,
        isParticipating: isParticipating,
    };
}

async function saveGameStatsToDB(game) {
  try {
    const finalRankings = getGameRankings(game);
    const winnerIds = finalRankings.filter(p => p.won).map(p => p.playerId);
    let playersForDBInput = Object.values(game.players);
    if (!game.isHostParticipant && game.host) {
        playersForDBInput = playersForDBInput.filter(p => p.userId !== game.host);
    }
    const playersForDB = playersForDBInput.map(player => {
      const rankInfo = finalRankings.find(r => r.playerId === player.userId);
      let playerCompletedAt = null;
      if (player.won || player.eliminated) {
        playerCompletedAt = new Date();
      }
      return {
        playerId: new mongoose.Types.ObjectId(player.userId),
        userName: player.userName,
        correctGuesses: player.correctGuesses,
        incorrectGuesses: player.incorrectGuesses,
        remainingAttempts: player.remainingAttempts,
        won: player.won || false,
        eliminated: player.eliminated || false,
        completedAt: playerCompletedAt,
        finalRank: rankInfo ? finalRankings.indexOf(rankInfo) + 1 : null
      };
    });
    const newHangmanGame = new HangmanGame({
      gameId: game.gameId,
      lobbyCode: game.lobbyCode,
      startedAt: game.startedAt,
      endedAt: new Date(),
      players: playersForDB,
      word: game.word,
      category: game.category,
      languageMode: game.languageMode,
      wordSourceMode: game.wordSourceMode,
      winners: winnerIds.map(id => new mongoose.Types.ObjectId(id)),
      createdBy: new mongoose.Types.ObjectId(game.host),
      isActive: false,
      maxIncorrectGuesses: game.maxAttempts,
    });
    await newHangmanGame.save();
  } catch (error) {
    console.error("Error saving Hangman game stats to DB:", error);
  }
}

async function endGameProcedure(game, outcomeType, messageText) {
  if (game.gameEnded) return;
  game.gameEnded = true;
  game.gameStarted = false;
  timerManager.clearAndRemoveTimer(game.lobbyCode);
  game.currentPlayerId = null;
  if (outcomeType === "HANGMAN_WORD_REVEALED_GAME_OVER") {
      Object.values(game.players).forEach(p => {
          if ((game.isHostParticipant || p.userId !== game.host) && !p.eliminated && !p.won) {
              p.won = true;
          }
      });
  }
  game.rankingsSnapshot = getGameRankings(game);
   await saveGameStatsToDB(game); 
   await saveGameToRedis(game);
  console.log(`[HangmanController] Game ${game.lobbyCode} ended. Saved to Redis with TTL for ended games.`);
  const gameForBroadcast = hydrateGamePlayersWithWs(game);
  if (gameForBroadcast) {
      broadcastToGame(gameForBroadcast, {
        type: outcomeType,
        message: messageText,
        word: game.word,
      });
  }
}

async function startNextTurn(lobbyCode) {
    let game = await getGameFromRedis(lobbyCode);
    if (!game || game.gameEnded || !game.gameStarted) {
        return;
    }
    timerManager.clearAndRemoveTimer(lobbyCode); // Clear any existing timer for this lobby

    const activePlayersInOrder = game.playerOrder.filter(playerId => {
        const p = game.players[playerId];
        return p && !p.eliminated && !p.won;
    });

    if (activePlayersInOrder.length === 0) {
        const currentMaskedWord = getSharedGameState(game).maskedWord;
        if (currentMaskedWord && !currentMaskedWord.includes('_')) {
            endGameProcedure(game, "HANGMAN_WORD_REVEALED_GAME_OVER", "Word revealed! Active players win.");
        } else {
            endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "No active players left. No one won.");
        }
        return;
    }

    let nextPlayerIndex = 0;
    if (game.currentPlayerId) {
        const lastPlayerIndexInActive = activePlayersInOrder.indexOf(game.currentPlayerId);
        if (lastPlayerIndexInActive !== -1) {
            nextPlayerIndex = (lastPlayerIndexInActive + 1) % activePlayersInOrder.length;
        }
    }
    game.currentPlayerId = activePlayersInOrder[nextPlayerIndex];
    game.turnStartTime = Date.now();

    if (activePlayersInOrder.length > 1) {
        const currentPlayerForTimer = game.currentPlayerId;
        timerManager.setTimerWithCallback(lobbyCode, async () => {
            console.log(`[TIMER_CALLBACK_CTRL] Timer for player ${currentPlayerForTimer} in lobby ${lobbyCode} EXPIRED. Calling handleTurnTimeout.`);
            await handleTurnTimeout(lobbyCode, currentPlayerForTimer);
        }, 12000);
    } else {
        console.log(`[TIMER_CTRL] startNextTurn: No new timer set for lobby ${lobbyCode} as active players <= 1.`);
    }

    await saveGameToRedis(game);
    const gameForBroadcast = hydrateGamePlayersWithWs(game);
    if (gameForBroadcast) {
        broadcastToGame(gameForBroadcast, { type: "HANGMAN_TURN_CHANGE" });
    }
}

async function handleTurnTimeout(lobbyCode, timedOutPlayerIdFromTimer) {

    let game = await getGameFromRedis(lobbyCode);
    if (!game || game.gameEnded || !game.gameStarted) {
        console.log(`[TIMER_CTRL] handleTurnTimeout: Game ${lobbyCode} not active or ended. Aborting.`);
        return;
    }

    if (game.currentPlayerId !== timedOutPlayerIdFromTimer) {
        console.log(`[TIMER_CTRL] handleTurnTimeout: Player ${timedOutPlayerIdFromTimer} is no longer current player in lobby ${lobbyCode} (current is ${game.currentPlayerId}). Likely a guess was made or player left. Aborting timeout action.`);
        return;
    }

    const player = game.players[timedOutPlayerIdFromTimer];
    const gameForBroadcast = hydrateGamePlayersWithWs(game);
    if (player && !player.eliminated && !player.won && (game.isHostParticipant || player.userId !== game.host)) {
        if (gameForBroadcast) {
            broadcastToGame(gameForBroadcast, {
                type: "HANGMAN_PLAYER_TIMEOUT",
                playerId: timedOutPlayerIdFromTimer,
                userName: player.userName,
            });
        }
    }
    await startNextTurn(lobbyCode); 
}

export const removePlayerFromHangmanPregame = async (lobbyCode, userId) => {
  let game = await getGameFromRedis(lobbyCode);
  if (game && !game.gameStarted && game.players[userId]) {
    const playerInfo = { ...game.players[userId] };
    delete game.players[userId];
    game.playerOrder = game.playerOrder.filter(pid => pid.toString() !== userId.toString());
    await saveGameToRedis(game);
    const gameForBroadcast = hydrateGamePlayersWithWs(game);
    if (gameForBroadcast) {
        broadcastToGame(gameForBroadcast, {
          type: "HANGMAN_PLAYER_LEFT_PREGAME",
          playerId: userId,
          playerName: playerInfo?.name,
        });
    }
    return true;
  }
  return false;
};

export const handleHangmanPlayerLeaveMidGame = async (lobbyCode, userId) => {
  let game = await getGameFromRedis(lobbyCode);
  if (!game || !game.gameStarted || game.gameEnded || !game.players[userId]) {
    return;
  }
  const player = game.players[userId];
  const isParticipatingPlayer = game.playerOrder.includes(userId);

  
  if (player.eliminated && isParticipatingPlayer && game.currentPlayerId !== userId) {
   
      
  }

  const playerName = player.name || player.userName || `Player ${userId}`;

  delete game.players[userId];
  game.playerOrder = game.playerOrder.filter(pid => pid.toString() !== userId.toString());

  const gameForBroadcastInitially = hydrateGamePlayersWithWs(game);
  if (gameForBroadcastInitially) {
      broadcastToGame(gameForBroadcastInitially, {
        type: "HANGMAN_PLAYER_LEFT_MIDGAME",
        playerId: userId,
        playerName: playerName,
      });
  }

  if (game.currentPlayerId === userId) {
      timerManager.clearAndRemoveTimer(lobbyCode);
      await saveGameToRedis(game);
      await startNextTurn(lobbyCode);
      return; 
  }

  const participatingPlayers = game.playerOrder.filter(pid => game.players[pid] && !game.players[pid].eliminated && !game.players[pid].won);

  if (participatingPlayers.length === 0 && !game.gameEnded) {
      endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "All participating players left or were eliminated. No winners.");
      return;
  } else if (game.playerOrder.length === 0 && !game.gameEnded && game.isHostParticipant && Object.keys(game.players).every(pid => pid === game.host && game.players[pid].eliminated)) {

      endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "No active players left. Game over.");
      return;
  }

  await saveGameToRedis(game);
};

export const getCategories = (ws) => {
  if (typeof wordCategories === 'undefined') {
    ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Sunucu hatası: Kelime kategorileri bulunamadı." }));
    return;
  }
  ws.send(JSON.stringify({
    type: "HANGMAN_CATEGORIES",
    categories: Object.keys(wordCategories)
  }));
};

export const getLanguageCategories = (ws, data) => {
  const { language } = data;
  if (!language || !wordCategories[language]) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid language." }));
  }
  ws.send(JSON.stringify({
    type: "HANGMAN_LANGUAGE_CATEGORIES",
    language: language,
    categories: Object.keys(wordCategories[language])
  }));
};

export const joinGame = async (ws, data) => {
    const { lobbyCode } = data;
    if (!lobbyCode) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby code not specified." }));
    }
    const userInfo = await getUserDetails(ws.userId);
    if (!userInfo) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "User info could not be retrieved." }));
    }
    let game = await getGameFromRedis(lobbyCode);
    if (!game) {
        const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });
        if (!lobby) {
            return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby not found." }));
        }
        game = {
            lobbyCode,
            lobbyName: lobby.lobbyName,
            players: {},
            gameStarted: false,
            gameEnded: false,
            host: lobby.createdBy.toString(),
            word: '',
            category: '',
            languageMode: 'en',
            wordSourceMode: 'server',
            isHostParticipant: true,
            startedAt: null,
            gameId: null,
            currentPlayerId: null,
            playerOrder: [],
            rankingsSnapshot: [],
            turnStartTime: null,
            maxAttempts: 6,
        };
    }
    if (game.players[ws.userId]) {
        let gameForReconnect = hydrateGamePlayersWithWs(game);
        if(gameForReconnect && gameForReconnect.players[ws.userId]) {
             gameForReconnect.players[ws.userId].ws = ws;
        }
        ws.send(JSON.stringify({
            type: "HANGMAN_RECONNECTED",
            message: "Reconnected to the game.",
            isHost: game.host === ws.userId,
            sharedGameState: getSharedGameState(gameForReconnect || game),
            playerSpecificGameState: getPlayerSpecificGameState(gameForReconnect || game, ws.userId)
        }));
        return;
    }
    if (game.gameStarted && !game.gameEnded) {
        const gameForSpectator = hydrateGamePlayersWithWs(game);
        ws.send(JSON.stringify({
            type: "HANGMAN_SPECTATOR_STATE",
            message: "Game has already started. Joined as spectator.",
            isHost: game.host === ws.userId,
            sharedGameState: getSharedGameState(gameForSpectator || game),
            playerSpecificGameState: null
        }));
        return;
    }
     if (Object.keys(game.players).length >= 10) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby is full." }));
    }
    game.players[ws.userId] = {
        userId: ws.userId,
        userName: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        correctGuesses: [],
        incorrectGuesses: [],
        remainingAttempts: game.maxAttempts,
        won: false,
        eliminated: false,
    };
    if (!game.playerOrder.includes(ws.userId)) {
         if (game.isHostParticipant || ws.userId !== game.host) {
            game.playerOrder.push(ws.userId);
         }
    }
    await saveGameToRedis(game);
    const playerStateForNewPlayer = getPlayerSpecificGameState(game, ws.userId);
    const sharedStateForNewPlayer = getSharedGameState(game);
    ws.send(JSON.stringify({
        type: "HANGMAN_JOINED_SUCCESS",
        message: "Joined the game.",
        isHost: game.host === ws.userId,
        sharedGameState: sharedStateForNewPlayer,
        playerSpecificGameState: playerStateForNewPlayer
    }));
    const gameForBroadcast = hydrateGamePlayersWithWs(game);
    if (gameForBroadcast) {
        broadcastToGame(gameForBroadcast, {
            type: "HANGMAN_PLAYER_JOINED",
            player: { id: ws.userId, userName: userInfo.username, name: userInfo.name, avatar: userInfo.avatar },
        });
    }
};

function getRandomWord(category, language) {
  const langCategories = wordCategories[language] || wordCategories.en;
  const safeCategory = langCategories[category] ? category : Object.keys(langCategories)[0];
  const words = langCategories[safeCategory];
  return words[Math.floor(Math.random() * words.length)];
}

export const startGame = async (ws, data) => {
    const { lobbyCode, languageMode, wordSourceMode, category, customWord, customCategory } = data;
    let game = await getGameFromRedis(lobbyCode);

    const lobbyDataFromDB = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });
    if (!lobbyDataFromDB) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby not found." }));
    }

    if (!game) {
        console.log(`[startGame] Game for lobby ${lobbyCode} not found in Redis. Creating new game instance.`);
        game = {
            lobbyCode,
            lobbyName: lobbyDataFromDB.lobbyName,
            players: {},
            gameStarted: false,
            gameEnded: false,
            host: lobbyDataFromDB.createdBy.toString(),
            word: '',
            category: '',
            languageMode: 'en',
            wordSourceMode: 'server',
            isHostParticipant: true,
            startedAt: null,
            gameId: null,
            currentPlayerId: null,
            playerOrder: [],
            rankingsSnapshot: [],
            turnStartTime: null,
            maxAttempts: 6,
        };
    }

    if (game.host !== ws.userId) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Only the host can start the game." }));
    }

    if (game.gameStarted && !game.gameEnded) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Game in this lobby has already started." }));
    }

    game.languageMode = languageMode;
    game.wordSourceMode = wordSourceMode;
    game.isHostParticipant = wordSourceMode === 'server';
    game.maxAttempts = 6;
    game.gameId = new mongoose.Types.ObjectId().toString();
    game.gameEnded = false;
    game.gameStarted = false;
    game.rankingsSnapshot = [];
    game.startedAt = null;
    game.currentPlayerId = null;
    game.turnStartTime = null;

    if (wordSourceMode === 'server') {
        if (!category || !wordCategories[languageMode] || !wordCategories[languageMode][category]) {
            return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Valid category must be selected for server-defined word." }));
        }
        game.category = category;
        game.word = getRandomWord(category, languageMode).toLowerCase();
    } else {
        if (!customWord || customWord.trim().length < 2 || customWord.trim().length > 25) {
            return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Custom word must be between 2 and 25 characters." }));
        }
        const validCharRegex = languageMode === 'tr' ? /^[a-zçğıöşü\s]+$/i : /^[a-z\s]+$/i;
        if (!validCharRegex.test(customWord.toLowerCase())) {
            return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: `Custom word contains invalid characters for ${languageMode.toUpperCase()} language.` }));
        }
        const finalCustomCategory = customCategory && customCategory.trim().length > 0 && customCategory.trim().length <= 30
            ? customCategory.trim()
            : (languageMode === 'tr' ? "Özel Kategori" : "Custom Category");
        game.category = finalCustomCategory;
        game.word = customWord.toLowerCase().trim();
    }

    const currentPlayersData = {};
    if (lobbyDataFromDB && lobbyDataFromDB.members) {
        for (const member of lobbyDataFromDB.members) {
            const memberIdStr = member.id.toString();
            const userInfo = await getUserDetails(memberIdStr);
            if (userInfo) {
                currentPlayersData[memberIdStr] = {
                    userId: memberIdStr,
                    userName: userInfo.username,
                    name: userInfo.name,
                    avatar: userInfo.avatar,
                    correctGuesses: [],
                    incorrectGuesses: [],
                    remainingAttempts: game.maxAttempts,
                    won: false,
                    eliminated: false,
                };
            } else {
                console.warn(`[startGame] Could not fetch user info for member ID: ${memberIdStr} in lobby ${lobbyCode}`);
            }
        }
    }
    game.players = currentPlayersData;

    let participatingPlayerCount = 0;
    if (game.isHostParticipant) {
        participatingPlayerCount = Object.keys(game.players).length;
    } else {
        participatingPlayerCount = Object.keys(game.players).filter(id => id !== game.host).length;
    }

    if (participatingPlayerCount === 0) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "At least one participating player is required to start." }));
    }

    const playerIdsForOrder = Object.keys(game.players)
        .filter(playerId => game.isHostParticipant || playerId !== game.host);
    game.playerOrder = playerIdsForOrder.sort(() => Math.random() - 0.5);

    Object.values(game.players).forEach(player => {
        if (!game.isHostParticipant && player.userId === game.host) {
            player.eliminated = true;
            player.remainingAttempts = 0;
        }
    });

    await saveGameToRedis(game);
    ws.send(JSON.stringify({ type: 'ACKNOWLEDGEMENT', messageType: 'HANGMAN_START', timestamp: new Date().toISOString() }));

    let countdown = 3;
    const countdownInterval = setInterval(async () => {
        let gameForCountdown = await getGameFromRedis(lobbyCode);
        if (!gameForCountdown || gameForCountdown.gameStarted || gameForCountdown.gameEnded) {
            clearInterval(countdownInterval);
            console.log(`[startGame] Countdown for ${lobbyCode} aborted as game state changed or became invalid.`);
            return;
        }

        gameForCountdown = hydrateGamePlayersWithWs(gameForCountdown);
        if (gameForCountdown) {
            broadcastToGame(gameForCountdown, { type: "HANGMAN_COUNTDOWN", countdown, lobbyCode: gameForCountdown.lobbyCode });
        }
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            let finalGameToStart = await getGameFromRedis(lobbyCode);
            if (!finalGameToStart || finalGameToStart.gameStarted || finalGameToStart.gameEnded) {
                console.log(`[startGame] Game ${lobbyCode} start aborted post-countdown as state changed or became invalid.`);
                return;
            }

            const finalLobbyData = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });
            const confirmedPlayers = {};
            let confirmedParticipatingCount = 0;

            if (finalLobbyData && finalLobbyData.members) {
                 for (const member of finalLobbyData.members) {
                    const memberIdStr = member.id.toString();
                    if (finalGameToStart.players[memberIdStr]) {
                        confirmedPlayers[memberIdStr] = finalGameToStart.players[memberIdStr];
                        if (finalGameToStart.isHostParticipant || memberIdStr !== finalGameToStart.host) {
                            confirmedParticipatingCount++;
                        }
                    }
                 }
            }

            if (confirmedParticipatingCount === 0) {
                 console.log(`[startGame] No participating players left in ${lobbyCode} at actual start time after countdown. Ending game.`);
                 await deleteGameFromRedis(lobbyCode);
                 const gameForNoPlayerBroadcast = hydrateGamePlayersWithWs({ ...finalGameToStart, players: confirmedPlayers, gameEnded: true, gameStarted: false });
                 if (gameForNoPlayerBroadcast) {
                    broadcastToGame(gameForNoPlayerBroadcast, { type: "HANGMAN_GAME_OVER_NO_WINNERS", message: "No participating players to start the game."});
                 }
                 return;
            }

            finalGameToStart.players = confirmedPlayers;
            finalGameToStart.playerOrder = Object.keys(confirmedPlayers)
                .filter(pid => finalGameToStart.isHostParticipant || pid !== finalGameToStart.host)
                .sort(() => Math.random() - 0.5);

            finalGameToStart.startedAt = new Date();
            finalGameToStart.gameStarted = true;
            finalGameToStart.gameEnded = false;

            await saveGameToRedis(finalGameToStart);

            const gameForStartBroadcast = hydrateGamePlayersWithWs(finalGameToStart);
            if (gameForStartBroadcast) {
                broadcastToGame(gameForStartBroadcast, {
                    type: "HANGMAN_GAME_STARTED",
                    message: "Hangman game started!",
                });
            }

            if (finalGameToStart.playerOrder.length > 0) {
                await startNextTurn(lobbyCode);
            } else if (!finalGameToStart.gameEnded) {
                const gameForEnd = await getGameFromRedis(lobbyCode);
                if (gameForEnd && !gameForEnd.gameEnded) {
                    endGameProcedure(gameForEnd, "HANGMAN_GAME_OVER_NO_WINNERS", "No participating players to start the turn.");
                }
            }
        }
    }, 1000);
};

export const guessLetter = async (ws, data) => {
  const { lobbyCode, letter } = data;
  let game = await getGameFromRedis(lobbyCode);
  if (!game || !game.gameStarted || game.gameEnded) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Game is not active." })); }
  if (game.currentPlayerId !== ws.userId) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Not your turn." })); }
  const player = game.players[ws.userId];
  if (!player || player.eliminated || player.won || (!game.isHostParticipant && ws.userId === game.host)) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "You cannot make a guess." })); }

  const normalizedLetter = letter.toLowerCase();
  const validLetterRegex = game.languageMode === 'tr' ? /^[a-zçğıöşü]$/ : /^[a-z]$/;
  if (!validLetterRegex.test(normalizedLetter)) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid letter entered." })); }
  const alreadyGuessed = player.correctGuesses.includes(normalizedLetter) || player.incorrectGuesses.includes(normalizedLetter);
  if (alreadyGuessed) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "This letter has already been guessed." })); }

  let correctGuess = false;
  if (game.word.includes(normalizedLetter)) {
    player.correctGuesses.push(normalizedLetter);
    correctGuess = true;
  } else {
    player.incorrectGuesses.push(normalizedLetter);
    player.remainingAttempts--;
    if(player.remainingAttempts <= 0) {
        player.eliminated = true;
    }
  }

  ws.send(JSON.stringify({
      type: "HANGMAN_MY_GUESS_RESULT",
      correct: correctGuess,
      letter: normalizedLetter,
      playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId),
      sharedMaskedWord: getSharedGameState(game).maskedWord
  }));

  await saveGameToRedis(game);
  timerManager.clearAndRemoveTimer(lobbyCode); // Clear timer after a guess

  const gameForBroadcast = hydrateGamePlayersWithWs(game);
  if (gameForBroadcast) {
    broadcastToGame(gameForBroadcast, {
        type: "HANGMAN_GUESS_MADE",
        playerId: ws.userId,
        userName: player.userName,
        letter: normalizedLetter,
        correct: correctGuess,
    });
    if (player.eliminated) {
        const gameAfterEliminationBroadcast = hydrateGamePlayersWithWs(await getGameFromRedis(lobbyCode)); // Get latest state
         if(gameAfterEliminationBroadcast) {
            broadcastToGame(gameAfterEliminationBroadcast, {
                type: "HANGMAN_PLAYER_ELIMINATED",
                playerId: ws.userId,
                userName: player.userName,
                reason: "no attempts left",
            });
         }
    }
  }

  const currentSharedState = getSharedGameState(game);
  if (!currentSharedState.maskedWord.includes('_')) {
    endGameProcedure(game, "HANGMAN_WORD_REVEALED_GAME_OVER", "Word fully revealed! Active players win.");
    return;
  }

  const activePlayersLeft = game.playerOrder.filter(pid => {
      const p = game.players[pid];
      return p && !p.eliminated && !p.won;
  });
  if (activePlayersLeft.length === 0 && !game.gameEnded) {
    endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "All players eliminated, no one won.");
    return;
  }

  if (!game.gameEnded) {
      await startNextTurn(lobbyCode);
  }
};

export const guessWord = async (ws, data) => {
  const { lobbyCode, word } = data;
  let game = await getGameFromRedis(lobbyCode);
  if (!game || !game.gameStarted || game.gameEnded) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Game is not active." })); }
  if (game.currentPlayerId !== ws.userId) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Not your turn." })); }
  const player = game.players[ws.userId];
  if (!player || player.eliminated || player.won || (!game.isHostParticipant && ws.userId === game.host)) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "You cannot make a guess." })); }

  const normalizedGuess = word.toLowerCase().trim();
  const normalizedAnswer = game.word.toLowerCase();

  if (normalizedGuess === normalizedAnswer) {
    player.won = true;
    Array.from(normalizedAnswer).forEach(char => {
        if (char !== ' ' && !player.correctGuesses.includes(char)) player.correctGuesses.push(char);
    });
    timerManager.clearAndRemoveTimer(lobbyCode); // Clear timer on correct word guess
    endGameProcedure(game, "HANGMAN_GAME_OVER_WINNER", `${player.userName} guessed the word correctly and won!`);
    return;
  } else {
    player.remainingAttempts--;
    if(player.remainingAttempts <= 0) {
        player.eliminated = true;
    }
    ws.send(JSON.stringify({
      type: "HANGMAN_WORD_GUESS_INCORRECT",
      message: "Word guess incorrect.",
      playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId),
      sharedMaskedWord: getSharedGameState(game).maskedWord
    }));

    await saveGameToRedis(game);
    timerManager.clearAndRemoveTimer(lobbyCode); // Clear timer on incorrect word guess

    const gameForBroadcast = hydrateGamePlayersWithWs(game);
    if (gameForBroadcast) {
        broadcastToGame(gameForBroadcast, {
          type: "HANGMAN_WORD_GUESS_ATTEMPT",
          playerId: ws.userId,
          userName: player.userName,
          guessedWord: normalizedGuess,
          correct: false,
        });
        if (player.eliminated) {
          const gameAfterEliminationBroadcast = hydrateGamePlayersWithWs(await getGameFromRedis(lobbyCode)); // Get latest state
          if(gameAfterEliminationBroadcast) {
            broadcastToGame(gameAfterEliminationBroadcast, {
                type: "HANGMAN_PLAYER_ELIMINATED",
                playerId: ws.userId,
                userName: player.userName,
                reason: "incorrect word guess and no attempts left",
            });
          }
        }
    }

    const activePlayersLeft = game.playerOrder.filter(pid => {
        const p = game.players[pid];
        return p && !p.eliminated && !p.won;
    });
    if (activePlayersLeft.length === 0 && !game.gameEnded) {
      endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "All players eliminated, no one won.");
      return;
    }
  }

  if (!game.gameEnded) {
      await startNextTurn(lobbyCode);
  }
};

export const endGame = async (ws, data) => {
  const { lobbyCode } = data;
  const game = await getGameFromRedis(lobbyCode);
  if (!game) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Hangman game not found." })); }
  if (game.host !== ws.userId) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Only the host can end the game." })); }
  if (game.gameEnded) { return ws.send(JSON.stringify({ type: "HANGMAN_INFO", message: "Game has already ended." })); }
  endGameProcedure(game, "HANGMAN_GAME_OVER_HOST_ENDED", "Game ended by host.");
};

export const addCustomCategory = (ws, data) => {
  const { language, category, words } = data;
  if (!language || !wordCategories[language]) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid language." })); }
  if (!category || !Array.isArray(words) || words.length === 0) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid category or word list." })); }
  const categoryKey = category.toLowerCase().trim();
  if (!categoryKey) { return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Category name cannot be empty." })); }
  wordCategories[language][categoryKey] = words
    .map(word => word.toLowerCase().trim())
    .filter(word => word.length > 0 && (language === 'tr' ? /^[a-zçğıöşü\s]+$/i : /^[a-z\s]+$/i).test(word));
  if (wordCategories[language][categoryKey].length === 0) {
     delete wordCategories[language][categoryKey];
     return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: `No valid words provided for category "${category}" in ${language.toUpperCase()}.` }));
  }
  ws.send(JSON.stringify({
    type: "HANGMAN_CATEGORY_ADDED",
    message: `Category "${category}" added/updated for ${language.toUpperCase()} language.`,
    language: language,
    category: categoryKey,
    newCategories: Object.keys(wordCategories[language])
  }));
};

export const getGameState = async (ws, data) => {
  const { lobbyCode } = data;
  const game = await getGameFromRedis(lobbyCode);
  if (!game) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Hangman game not found." }));
  }
  ws.send(JSON.stringify({
    type: "HANGMAN_CURRENT_GAME_STATE",
    sharedGameState: getSharedGameState(game),
    playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId)
  }));
};

export const getUsersHangmanStats = async (req, res) => {
  try {
    const stats = await HangmanGame.aggregate([
      { $unwind: "$players" },
      {
        $group: {
          _id: "$players.playerId",
          userName: { $first: "$players.userName" },
          totalGamesPlayed: { $sum: 1 },
          totalWins: {
            $sum: { $cond: ["$players.won", 1, 0] }
          },
          totalCorrectGuesses: { $sum: { $size: "$players.correctGuesses" } },
          totalIncorrectGuesses: { $sum: { $size: "$players.incorrectGuesses" } },
        }
      },
      {
        $addFields: {
          totalGuesses: { $add: ["$totalCorrectGuesses", "$totalIncorrectGuesses"] }
        }
      },
      {
        $addFields: {
          accuracy: {
            $cond: [
              { $eq: ["$totalGuesses", 0] },
              0,
              { $divide: ["$totalCorrectGuesses", "$totalGuesses"] }
            ]
          }
        }
      },
      {
        $sort: {
          totalWins: -1,
          accuracy: -1,
          userName: 1
        }
      },
      {
        $project: {
          _id: 0,
          playerId: "$_id",
          userName: 1,
          totalGamesPlayed: 1,
          totalWins: 1,
          accuracy: 1,
          totalCorrectGuesses: 1,
          totalIncorrectGuesses: 1,
        }
      }
    ]);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching Hangman user stats:", error);
    res.status(500).json({ message: "Sunucuda bir hata oluştu.", error: error.message });
  }
};

const formatMillisecondsToHHMMSS = (ms) => {
  if (ms === null || ms === undefined || ms <= 0) return "00:00:00";
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getPlayerStats = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Geçersiz kullanıcı IDsi." });
    }
    const objectIdUserId = new mongoose.Types.ObjectId(userId);
    const playerGames = await HangmanGame.find({ "players.playerId": objectIdUserId })
      .sort({ endedAt: -1 })
      .select("-word")
      .lean();
    let userNameFromDB = "";
    if (!playerGames || playerGames.length === 0) {
      try {
        const User = mongoose.model('User');
        const user = await User.findById(objectIdUserId).select('username').lean();
        if (user) {
            userNameFromDB = user.username;
        }
      } catch(e) {
        console.warn("Kullanıcı adı alınırken hata (oyun bulunamadı durumu):", e.message);
      }
      return res.status(200).json({
        message: "Bu kullanıcı için oyun istatistiği bulunamadı.",
        userName: userNameFromDB || "Bilinmiyor",
        totalGamesPlayed: 0,
        totalWins: 0,
        accuracy: 0,
        totalCorrectGuesses: 0,
        totalIncorrectGuesses: 0,
        totalPlayTimeMilliseconds: 0,
        totalPlayTimeFormatted: "00:00:00",
        bestRankOverall: null,
        gameHistory: []
      });
    }
    let totalWins = 0;
    let totalGamesPlayed = playerGames.length;
    let totalCorrectGuesses = 0;
    let totalIncorrectGuesses = 0;
    let userName = "";
    let totalPlayTimeMilliseconds = 0;
    let bestRankOverall = null;
    const gameHistory = playerGames.map(game => {
      const playerInfoInGame = game.players.find(p => p.playerId.equals(objectIdUserId));
      if (playerInfoInGame) {
        if (!userName && playerInfoInGame.userName) userName = playerInfoInGame.userName;
        if (playerInfoInGame.won) totalWins++;
        if (playerInfoInGame.correctGuesses && Array.isArray(playerInfoInGame.correctGuesses)) {
            totalCorrectGuesses += playerInfoInGame.correctGuesses.length;
        }
        if (playerInfoInGame.incorrectGuesses && Array.isArray(playerInfoInGame.incorrectGuesses)) {
            totalIncorrectGuesses += playerInfoInGame.incorrectGuesses.length;
        }
        if (playerInfoInGame.finalRank && typeof playerInfoInGame.finalRank === 'number' && playerInfoInGame.finalRank > 0) {
            if (bestRankOverall === null || playerInfoInGame.finalRank < bestRankOverall) {
                bestRankOverall = playerInfoInGame.finalRank;
            }
        }
        let durationMilliseconds = null;
        let durationFormatted = "N/A";
        if (game.startedAt && game.endedAt) {
            durationMilliseconds = game.endedAt.getTime() - game.startedAt.getTime();
            totalPlayTimeMilliseconds += durationMilliseconds;
            durationFormatted = formatMillisecondsToHHMMSS(durationMilliseconds);
        }
        return {
            gameId: game.gameId,
            lobbyCode: game.lobbyCode,
            category: game.category,
            won: playerInfoInGame.won,
            eliminated: playerInfoInGame.eliminated,
            correctGuessesCount: (playerInfoInGame.correctGuesses && Array.isArray(playerInfoInGame.correctGuesses)) ? playerInfoInGame.correctGuesses.length : 0,
            incorrectGuessesCount: (playerInfoInGame.incorrectGuesses && Array.isArray(playerInfoInGame.incorrectGuesses)) ? playerInfoInGame.incorrectGuesses.length : 0,
            correctGuesses: playerInfoInGame.correctGuesses,
            incorrectGuesses: playerInfoInGame.incorrectGuesses,
            finalRank: playerInfoInGame.finalRank,
            startedAt: game.startedAt,
            endedAt: game.endedAt,
            durationMilliseconds: durationMilliseconds,
            durationFormatted: durationFormatted,
        };
      }
      return null;
    }).filter(g => g !== null);
    const totalGuesses = totalCorrectGuesses + totalIncorrectGuesses;
    const accuracy = totalGuesses > 0 ? parseFloat((totalCorrectGuesses / totalGuesses).toFixed(4)) : 0;
    if (!userName && playerGames.length > 0) {
        try {
            const User = mongoose.model('User');
            const user = await User.findById(objectIdUserId).select('username').lean();
            if (user && user.username) {
                userName = user.username;
            } else {
                userName = "Bilinmiyor";
            }
        } catch(e) {
            console.warn("Kullanıcı adı alınırken hata (oyun bulundu durumu):", e.message);
            userName = "Bilinmiyor";
        }
    }
    res.status(200).json({
      playerId: userId,
      userName: userName,
      totalGamesPlayed,
      totalWins,
      accuracy,
      totalCorrectGuesses,
      totalIncorrectGuesses,
      totalPlayTimeMilliseconds,
      totalPlayTimeFormatted: formatMillisecondsToHHMMSS(totalPlayTimeMilliseconds),
      bestRankOverall,
      gameHistory
    });
  } catch (error) {
    console.error(`Error fetching stats for player ${req.params.userId}:`, error);
    res.status(500).json({ message: "Oyuncu istatistikleri alınırken bir hata oluştu.", error: error.message });
  }
};