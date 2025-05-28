import Lobby from "../models/lobby.model.js";
import { HangmanGame } from '../models/hangman.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const hangmanGames = {};

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

async function getUserInfo(userId) {
  try {
    const user = await User.findById(userId);
    return user ? {
      _id: user._id.toString(),
      username: user.username,
      name: user.name,
      avatar: user.avatar
    } : null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}

export const getCategories = (ws) => {
  if (typeof wordCategories === 'undefined') {
    console.error("[Hangman Controller] HATA: wordCategories tanımlı değil!");
    ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Sunucu hatası: Kelime kategorileri bulunamadı." }));
    return;
  }
  ws.send(JSON.stringify({
    type: "HANGMAN_CATEGORIES",
    categories: Object.keys(wordCategories)
  }));
};

function getRandomWord(category, language) {
  const langCategories = wordCategories[language] || wordCategories.en;
  const safeCategory = langCategories[category] ? category : Object.keys(langCategories)[0];
  const words = langCategories[safeCategory];
  return words[Math.floor(Math.random() * words.length)];
}

export const removePlayerFromHangmanPregame = (lobbyCode, userId) => {
  const game = hangmanGames[lobbyCode];
  if (game && !game.gameStarted && game.players[userId]) {
    const playerInfo = game.players[userId];
    delete game.players[userId];
    game.playerOrder = game.playerOrder.filter(pid => pid.toString() !== userId.toString());

    broadcastToGame(game, {
      type: "HANGMAN_PLAYER_LEFT_PREGAME",
      playerId: userId,
      playerName: playerInfo?.name,
    });
    return true;
  }
  return false;
};

export const handleHangmanPlayerLeaveMidGame = (lobbyCode, userId) => {
  const game = hangmanGames[lobbyCode];
  if (!game || !game.gameStarted || game.gameEnded || !game.players[userId]) {
    return;
  }

  const player = game.players[userId];
  const isParticipatingPlayer = game.playerOrder.includes(userId);

  if (player.eliminated && isParticipatingPlayer) {
      return;
  }

  const playerName = player.name || player.userName || `Player ${userId}`;

  broadcastToGame(game, {
    type: "HANGMAN_PLAYER_LEFT_MIDGAME",
    playerId: userId,
    playerName: playerName,
  });

  delete game.players[userId];
  game.playerOrder = game.playerOrder.filter(pid => pid.toString() !== userId.toString());

  if (game.currentPlayerId === userId && isParticipatingPlayer) {
    startNextTurn(lobbyCode);
  } else {
    const participatingPlayers = game.playerOrder.filter(pid => game.players[pid] && !game.players[pid].eliminated && !game.players[pid].won);
    if (participatingPlayers.length === 0 && isParticipatingPlayer && !game.gameEnded) {
        endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "All participating players left or were eliminated. No winners.");
    } else if (game.playerOrder.length === 0 && !game.gameEnded) {
         endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "No active players left. Game over.");
    }
  }
};

export function broadcastToGame(game, dataToSend) {
  if (!game || !game.players) return;
  Object.values(game.players).forEach((player) => {
    if (player && player.ws && player.ws.readyState === player.ws.OPEN) {
      const messageForPlayer = { ...dataToSend };

      const relevantTypesForPlayerSpecificState = [
        "HANGMAN_PLAYER_JOINED",
        "HANGMAN_GAME_STARTED",
        "HANGMAN_TURN_CHANGE",
        "HANGMAN_GUESS_MADE",
        "HANGMAN_WORD_GUESS_ATTEMPT",
        "HANGMAN_PLAYER_ELIMINATED",
        "HANGMAN_PLAYER_TIMEOUT",
        "HANGMAN_GAME_OVER_WINNER",
        "HANGMAN_WORD_REVEALED_GAME_OVER",
        "HANGMAN_GAME_OVER_NO_WINNERS",
        "HANGMAN_GAME_OVER_HOST_ENDED",
        "HANGMAN_RECONNECTED",
        "HANGMAN_JOINED_SUCCESS",
        "HANGMAN_CURRENT_GAME_STATE",
      ];

      if (relevantTypesForPlayerSpecificState.includes(messageForPlayer.type)) {
        messageForPlayer.playerSpecificGameState = getPlayerSpecificGameState(game, player.userId);
      }

       const typesThatShouldHaveSharedState = [
          ...relevantTypesForPlayerSpecificState,
          "HANGMAN_PLAYER_LEFT_PREGAME",
          "HANGMAN_PLAYER_LEFT_MIDGAME"
        ];

      if (typesThatShouldHaveSharedState.includes(messageForPlayer.type)) {
        if (!messageForPlayer.sharedGameState) {
            messageForPlayer.sharedGameState = getSharedGameState(game);
        }
      }

      const message = JSON.stringify(messageForPlayer);
      player.ws.send(message, (err) => {
        if (err) console.error(`Hangman message (${messageForPlayer.type}) send error to ${player.userId}:`, err);
      });
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

function generateMaskedWord(word, collectiveCorrectGuesses, language = 'en') {
  const collectiveSet = new Set(collectiveCorrectGuesses.map(l => l.toLowerCase()));
  return Array.from(word).map(letter => {
    const lowerLetter = letter.toLowerCase();
    if (lowerLetter === ' ') return ' ';
    return collectiveSet.has(lowerLetter) ? letter : '_';
  }).join('');
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

export function getSharedGameState(game) {
  let allPlayersCorrectGuesses = new Set();
  Object.values(game.players).forEach(p => {
    if (game.isHostParticipant || p.userId !== game.host) {
        p.correctGuesses.forEach(g => allPlayersCorrectGuesses.add(g));
    }
  });
  const currentMaskedWord = game.word ? generateMaskedWord(game.word, Array.from(allPlayersCorrectGuesses), game.languageMode) : '';

  const activePlayersForTimerCheck = game.playerOrder.filter(playerId => {
    const p = game.players[playerId];
    return p && !p.eliminated && !p.won;
  });
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
    playerStates: Object.fromEntries(
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
    ),
    rankings: game.gameEnded ? (game.rankingsSnapshot || []) : [],
    wordLength: game.word ? game.word.length : 0,
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

function endGameProcedure(game, outcomeType, messageText) {
  if (game.gameEnded) return;
  game.gameEnded = true;
  game.gameStarted = false;
  clearTimeout(game.turnTimer);
  game.turnTimer = null;
  game.currentPlayerId = null;

  if (outcomeType === "HANGMAN_WORD_REVEALED_GAME_OVER") {
      Object.values(game.players).forEach(p => {
          if ((game.isHostParticipant || p.userId !== game.host) && !p.eliminated) {
              p.won = true;
          }
      });
  }
  game.rankingsSnapshot = getGameRankings(game);
  const finalSharedState = getSharedGameState(game);

  broadcastToGame(game, {
    type: outcomeType,
    message: messageText,
    word: game.word,
    sharedGameState: finalSharedState,
  });

  saveGameStatsToDB(game);
}

function startNextTurn(lobbyCode) {
  const game = hangmanGames[lobbyCode];
  if (!game || game.gameEnded || !game.gameStarted) {
    return;
  }

  clearTimeout(game.turnTimer);
  game.turnTimer = null;

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
  broadcastToGame(game, {
    type: "HANGMAN_TURN_CHANGE",
  });

  if (activePlayersInOrder.length > 1) {
    game.turnTimer = setTimeout(() => {
      handleTurnTimeout(lobbyCode);
    }, 12000);
  }
}

function handleTurnTimeout(lobbyCode) {
  const game = hangmanGames[lobbyCode];
  if (!game || game.gameEnded || !game.currentPlayerId || !game.gameStarted) return;

  const timedOutPlayerId = game.currentPlayerId;
  const player = game.players[timedOutPlayerId];

  if (player && !player.eliminated && !player.won && (game.isHostParticipant || player.userId !== game.host)) {
    broadcastToGame(game, {
      type: "HANGMAN_PLAYER_TIMEOUT",
      playerId: timedOutPlayerId,
      userName: player.userName,
      sharedGameState: getSharedGameState(game),
    });
  }
  startNextTurn(lobbyCode);
}

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

    const userInfo = await getUserInfo(ws.userId);
    if (!userInfo) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "User info could not be retrieved." }));
    }

    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });
    if (!lobby) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby not found." }));
    }

    if (!hangmanGames[lobbyCode]) {
        hangmanGames[lobbyCode] = {
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
            turnTimer: null,
            turnStartTime: null,
            maxAttempts: 6,
        };
    }
    const game = hangmanGames[lobbyCode];

    if (game.players[ws.userId]) {
        game.players[ws.userId].ws = ws;

        const playerState = getPlayerSpecificGameState(game, ws.userId);
        const sharedState = getSharedGameState(game);

        ws.send(JSON.stringify({
            type: "HANGMAN_RECONNECTED",
            message: "Reconnected to the game.",
            isHost: game.host === ws.userId,
            sharedGameState: sharedState,
            playerSpecificGameState: playerState
        }));
        return;
    }

    if (game.gameStarted && !game.gameEnded) {
      
        const playerState = getPlayerSpecificGameState(game, ws.userId); // Oyuncu oyunda olmadığı için bu null dönebilir veya varsayılan değerler içerebilir.
        const sharedState = getSharedGameState(game);
        ws.send(JSON.stringify({
            type: "HANGMAN_SPECTATOR_STATE", 
            message: "Game has already started. Joined as spectator.",
            isHost: game.host === ws.userId, 
            sharedGameState: sharedState,
            playerSpecificGameState: playerState 
        }));
        return;
    }

     if (Object.keys(game.players).length >= 10) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby is full." }));
    }

    game.players[ws.userId] = {
        ws,
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

    const playerStateForNewPlayer = getPlayerSpecificGameState(game, ws.userId);
    const sharedStateForNewPlayer = getSharedGameState(game);

    ws.send(JSON.stringify({
        type: "HANGMAN_JOINED_SUCCESS",
        message: "Joined the game.",
        isHost: game.host === ws.userId,
        sharedGameState: sharedStateForNewPlayer,
        playerSpecificGameState: playerStateForNewPlayer
    }));

    // Yeni oyuncu katıldığında diğer oyunculara da güncel durumu yayınla
    broadcastToGame(game, {
        type: "HANGMAN_PLAYER_JOINED",
        player: { id: ws.userId, userName: userInfo.username, name: userInfo.name, avatar: userInfo.avatar },
    });
};

export const startGame = (ws, data) => {
    const { lobbyCode, languageMode, wordSourceMode, category, customWord,customCategory  } = data;
    const game = hangmanGames[lobbyCode];

    if (!game) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Hangman game not found." }));
    }
    if (game.host !== ws.userId) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Only the host can start the game." }));
    }
    if (game.gameStarted && !game.gameEnded) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Game in this lobby has already started." }));
    }

    if (!['en', 'tr'].includes(languageMode)) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid language mode selected." }));
    }
    if (!['server', 'host'].includes(wordSourceMode)) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid word source mode selected." }));
    }

    game.languageMode = languageMode;
    game.wordSourceMode = wordSourceMode;
    game.isHostParticipant = wordSourceMode === 'server';
    game.maxAttempts = 6;

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
         // customCategory kullanılıyor, eğer yoksa varsayılan atanıyor
        const finalCustomCategory = customCategory && customCategory.trim().length > 0 && customCategory.trim().length <= 30
                                      ? customCategory.trim()
                                      : (languageMode === 'tr' ? "Özel Kategori" : "Custom Category");
        game.category = finalCustomCategory;
        game.word = customWord.toLowerCase().trim();
    }

    const playersToStartGameWith = {};
    Object.keys(game.players).forEach(playerId => {
        const player = game.players[playerId];
        if (player && player.ws) {
            playersToStartGameWith[playerId] = player;
        }
    });

    let participatingPlayerCount = 0;
    if (game.isHostParticipant) {
        participatingPlayerCount = Object.keys(playersToStartGameWith).length;
    } else {
        participatingPlayerCount = Object.keys(playersToStartGameWith).filter(id => id !== game.host).length;
    }

    if (participatingPlayerCount === 0) {
         return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "At least one participating player is required to start." }));
    }

    game.gameEnded = false;
    game.rankingsSnapshot = [];
    game.gameId = new mongoose.Types.ObjectId();

    if (game.isHostParticipant) {
        game.playerOrder = Object.keys(playersToStartGameWith).sort(() => Math.random() - 0.5);
    } else {
        game.playerOrder = Object.keys(playersToStartGameWith).filter(id => id !== game.host).sort(() => Math.random() - 0.5);
    }

    Object.values(playersToStartGameWith).forEach(player => {
        if (game.isHostParticipant || player.userId !== game.host) {
            player.correctGuesses = [];
            player.incorrectGuesses = [];
            player.remainingAttempts = game.maxAttempts;
            player.won = false;
            player.eliminated = false;
        } else {
            player.correctGuesses = [];
            player.incorrectGuesses = [];
            player.remainingAttempts = 0;
            player.won = false;
            player.eliminated = true;
        }
    });

    ws.send(JSON.stringify({ type: 'ACKNOWLEDGEMENT', messageType: 'HANGMAN_START', timestamp: new Date().toISOString() }));

    let countdown = 3;
    const countdownInterval = setInterval(() => {
        broadcastToGame(game, { type: "HANGMAN_COUNTDOWN", countdown, lobbyCode: game.lobbyCode });
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            game.startedAt = new Date();
            game.gameStarted = true;
            game.gameEnded = false;

            broadcastToGame(game, {
                type: "HANGMAN_GAME_STARTED",
                message: "Hangman game started!",
            });
            if (game.playerOrder.length > 0) {
                 startNextTurn(lobbyCode);
            } else if (!game.gameEnded) {
                 endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "No participating players to start the turn.");
            }
        }
    }, 1000);
};

export const guessLetter = (ws, data) => {
  const { lobbyCode, letter } = data;
  const game = hangmanGames[lobbyCode];

  if (!game || !game.gameStarted || game.gameEnded) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Game is not active." }));
  }
  if (game.currentPlayerId !== ws.userId) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Not your turn." }));
  }

  const player = game.players[ws.userId];
  if (!player || player.eliminated || player.won || (!game.isHostParticipant && ws.userId === game.host)) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "You cannot make a guess." }));
  }

  const normalizedLetter = letter.toLowerCase();
  const validLetterRegex = game.languageMode === 'tr' ? /^[a-zçğıöşü]$/ : /^[a-z]$/;
  if (!validLetterRegex.test(normalizedLetter)) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid letter entered." }));
  }

  const alreadyGuessed = player.correctGuesses.includes(normalizedLetter) || player.incorrectGuesses.includes(normalizedLetter);
  if (alreadyGuessed) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "This letter has already been guessed." }));
  }

  let correctGuess = false;
  if (game.word.includes(normalizedLetter)) {
    player.correctGuesses.push(normalizedLetter);
    correctGuess = true;
  } else {
    player.incorrectGuesses.push(normalizedLetter);
    player.remainingAttempts--;
  }

  const currentSharedState = getSharedGameState(game);

  broadcastToGame(game, {
    type: "HANGMAN_GUESS_MADE",
    playerId: ws.userId,
    userName: player.userName,
    letter: normalizedLetter,
    correct: correctGuess,
  });

  ws.send(JSON.stringify({
      type: "HANGMAN_MY_GUESS_RESULT",
      correct: correctGuess,
      letter: normalizedLetter,
      playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId), // Oyuncuya kendi güncel durumunu gönder
      sharedMaskedWord: currentSharedState.maskedWord // Ve güncel maskeli kelimeyi
  }));

  if (!correctGuess && player.remainingAttempts <= 0) {
    player.eliminated = true;
    broadcastToGame(game, {
      type: "HANGMAN_PLAYER_ELIMINATED",
      playerId: ws.userId,
      userName: player.userName,
      reason: "no attempts left",
    });
  }

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
      startNextTurn(lobbyCode);
  }
};

export const guessWord = (ws, data) => {
  const { lobbyCode, word } = data;
  const game = hangmanGames[lobbyCode];

  if (!game || !game.gameStarted || game.gameEnded) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Game is not active." }));
  }
  if (game.currentPlayerId !== ws.userId) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Not your turn." }));
  }

  const player = game.players[ws.userId];
  if (!player || player.eliminated || player.won || (!game.isHostParticipant && ws.userId === game.host)) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "You cannot make a guess." }));
  }

  const normalizedGuess = word.toLowerCase().trim();
  const normalizedAnswer = game.word.toLowerCase();

  if (normalizedGuess === normalizedAnswer) {
    player.won = true;
    Array.from(normalizedAnswer).forEach(char => {
        if (char !== ' ' && !player.correctGuesses.includes(char)) player.correctGuesses.push(char);
    });

    endGameProcedure(game, "HANGMAN_GAME_OVER_WINNER", `${player.userName} guessed the word correctly and won!`);
    return;

  } else {
    player.remainingAttempts--;

    ws.send(JSON.stringify({
      type: "HANGMAN_WORD_GUESS_INCORRECT",
      message: "Word guess incorrect.",
      playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId),
      sharedMaskedWord: getSharedGameState(game).maskedWord
    }));

    broadcastToGame(game, {
      type: "HANGMAN_WORD_GUESS_ATTEMPT",
      playerId: ws.userId,
      userName: player.userName,
      guessedWord: normalizedGuess,
      correct: false,
    });

    if (player.remainingAttempts <= 0) {
      player.eliminated = true;
      broadcastToGame(game, {
        type: "HANGMAN_PLAYER_ELIMINATED",
        playerId: ws.userId,
        userName: player.userName,
        reason: "incorrect word guess and no attempts left",
      });

      const activePlayersLeft = game.playerOrder.filter(pid => {
          const p = game.players[pid];
          return p && !p.eliminated && !p.won;
      });
      if (activePlayersLeft.length === 0 && !game.gameEnded) {
        endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "All players eliminated, no one won.");
        return;
      }
    }
  }

  if (!game.gameEnded) {
      startNextTurn(lobbyCode);
  }
};

export const endGame = (ws, data) => {
  const { lobbyCode } = data;
  const game = hangmanGames[lobbyCode];

  if (!game) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Hangman game not found." }));
  }
  if (game.host !== ws.userId) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Only the host can end the game." }));
  }
  if (game.gameEnded) {
    return ws.send(JSON.stringify({ type: "HANGMAN_INFO", message: "Game has already ended." }));
  }

  endGameProcedure(game, "HANGMAN_GAME_OVER_HOST_ENDED", "Game ended by host.");
};

export const addCustomCategory = (ws, data) => {
  const { language, category, words } = data;
  if (!language || !wordCategories[language]) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid language." }));
  }
  if (!category || !Array.isArray(words) || words.length === 0) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Invalid category or word list." }));
  }

  const categoryKey = category.toLowerCase().trim();
  if (!categoryKey) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Category name cannot be empty." }));
  }

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

export const getGameState = (ws, data) => {
  const { lobbyCode } = data;
  const game = hangmanGames[lobbyCode];

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

    let userNameFromDB = ""; // Initialize userNameFromDB
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
      return res.status(200).json({ // Return 200 with empty stats instead of 404 to allow profile page to load
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
    let bestRankOverall = null; // En iyi genel sıralamayı tutmak için

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

        // En iyi genel sıralamayı güncelle
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
      totalCorrectGuesses, // Bu genel toplam doğru tahmin sayısı
      totalIncorrectGuesses,
      totalPlayTimeMilliseconds,
      totalPlayTimeFormatted: formatMillisecondsToHHMMSS(totalPlayTimeMilliseconds), // Bu genel toplam oyun süresi
      bestRankOverall, // Bu yeni eklenen genel en iyi sıralama
      gameHistory
    });

  } catch (error) {
    console.error(`Error fetching stats for player ${req.params.userId}:`, error);
    res.status(500).json({ message: "Oyuncu istatistikleri alınırken bir hata oluştu.", error: error.message });
  }
};
