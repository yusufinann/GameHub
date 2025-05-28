import Lobby from "../models/lobby.model.js";
import { HangmanGame } from '../models/hangman.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
import { bingoGames } from './bingo.game.controller.js';
export const hangmanGames = {};

const wordCategories = {
  animals: ['elephant', 'giraffe', 'penguin', 'dolphin', 'kangaroo', 'cheetah', 'crocodile', 'butterfly'],
  countries: ['turkey', 'germany', 'japan', 'brazil', 'australia', 'canada', 'sweden', 'egypt'],
  fruits: ['strawberry', 'pineapple', 'watermelon', 'blueberry', 'pomegranate', 'kiwi', 'apricot'],
  sports: ['basketball', 'football', 'swimming', 'volleyball', 'gymnastics', 'skateboarding', 'tennis'],
  movies: ['inception', 'avatar', 'titanic', 'interstellar', 'gladiator', 'frozen', 'jaws']
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

function getRandomWord(category) {
  const safeCategory = wordCategories[category] ? category : 'animals';
  const words = wordCategories[safeCategory];
  return words[Math.floor(Math.random() * words.length)];
}
export const removePlayerFromHangmanPregame = (lobbyCode, userId) => {
  const game = hangmanGames[lobbyCode];
  if (game && !game.gameStarted && game.players[userId]) {
    console.log(`[Hangman Controller] Kullanıcı ${userId}, ${lobbyCode} lobisindeki oyun başlamadan önce ayrılıyor.`);
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

  if (player.eliminated) {
      return;
  }

  const playerName = player.name || player.userName || `Oyuncu ${userId}`;
  console.log(`[Hangman Controller] Oyuncu ${playerName} (${userId}), ${lobbyCode} lobisindeki oyundan orta oyunda ayrılıyor.`);

  broadcastToGame(game, {
    type: "HANGMAN_PLAYER_LEFT_MIDGAME",
    playerId: userId,
    playerName: playerName,
  });

  delete game.players[userId];

  if (game.currentPlayerId === userId) {
    startNextTurn(lobbyCode);
  } else {
    const remainingPlayers = Object.keys(game.players).length;

    if (remainingPlayers === 0 && !game.gameEnded) {
        console.log(`[Hangman Controller] Lobi ${lobbyCode} - Oyundan kalan kimse yok, oyun bitiyor.`);
        endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "Aktif oyuncu kalmadı. Oyun sonlandı.");
    } else {
        console.log(`[Hangman Controller] Lobi ${lobbyCode} - Oyuncu ${userId} ayrıldı, ${remainingPlayers} oyuncu kaldı.`);
    }
  }
};

export  function broadcastToGame(game, dataToSend) { 
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
        if (err) console.error(`Hangman mesaj (${messageForPlayer.type}) gönderme hatası ${player.userId}:`, err);
      });
    }
  });
}
function getGameRankings(game) {
  return Object.values(game.players)
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

function generateMaskedWord(word, collectiveCorrectGuesses) {
  const collectiveSet = new Set(collectiveCorrectGuesses.map(l => l.toLowerCase()));
  return Array.from(word).map(letter =>
    collectiveSet.has(letter.toLowerCase()) ? letter : '_'
  ).join('');
}

function getPlayerSpecificGameState(game, playerId) {
    const player = game.players[playerId];
    if (!player) return null;

    return {
        correctGuesses: player.correctGuesses,
        incorrectGuesses: player.incorrectGuesses,
        remainingAttempts: player.remainingAttempts,
        isMyTurn: game.currentPlayerId === playerId && !game.gameEnded && !player.eliminated && !player.won,
        won: player.won || false,
        eliminated: player.eliminated || false,
    };
}

export function getSharedGameState(game) {
  let allPlayersCorrectGuesses = new Set();
  Object.values(game.players).forEach(p => {
    p.correctGuesses.forEach(g => allPlayersCorrectGuesses.add(g));
  });
  const currentMaskedWord = game.word ? generateMaskedWord(game.word, Array.from(allPlayersCorrectGuesses)) : '';

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
    turnEndsAt: (game.gameStarted && !game.gameEnded && game.turnStartTime && isMultiplayerTurnWithTimer)
                  ? game.turnStartTime + 10000
                  : null,
    playerStates: Object.fromEntries(
      Object.values(game.players).map(p => [p.userId, {
        userId: p.userId,
        userName: p.userName,
        name: p.name,
        avatar: p.avatar || null,
        remainingAttempts: p.remainingAttempts,
        won: p.won || false,
        eliminated: p.eliminated || false,
        isHost: game.host === p.userId,
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

    const playersForDB = Object.values(game.players).map(player => {
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
      winners: winnerIds.map(id => new mongoose.Types.ObjectId(id)),
      createdBy: new mongoose.Types.ObjectId(game.host),
      isActive: false, 
      maxIncorrectGuesses: 6, 
    });

    await newHangmanGame.save();
    console.log(`[Hangman Server] Game ${game.lobbyCode} stats saved to DB.`);
  } catch (error) {
    console.error("Hangman oyun istatistikleri kaydedilirken hata oluştu:", error);
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
          if (!p.eliminated) { 
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
   
      endGameProcedure(game, "HANGMAN_WORD_REVEALED_GAME_OVER", "Kelime açığa çıktı! Aktif oyuncular kazandı.");
    } else {
   
      endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "Aktif oyuncu kalmadı, kimse kazanamadı.");
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
    console.log(`[Hangman Controller] Lobi ${lobbyCode} - Çok oyunculu mod, ${game.currentPlayerId} için sunucu zamanlayıcısı başlatılıyor.`);
    game.turnTimer = setTimeout(() => {
      handleTurnTimeout(lobbyCode); 
    }, 10000); 
  } else {
    console.log(`[Hangman Controller] Lobi ${lobbyCode} - Tek oyunculu mod veya tek aktif oyuncu, sunucu zamanlayıcısı başlatılmıyor.`);
   
  }
}

function handleTurnTimeout(lobbyCode) {
  const game = hangmanGames[lobbyCode];
  if (!game || game.gameEnded || !game.currentPlayerId || !game.gameStarted) return;

  const timedOutPlayerId = game.currentPlayerId;
  const player = game.players[timedOutPlayerId];

  if (player && !player.eliminated && !player.won) {
    broadcastToGame(game, {
      type: "HANGMAN_PLAYER_TIMEOUT",
      playerId: timedOutPlayerId,
      userName: player.userName,
      sharedGameState: getSharedGameState(game), 
    });
  }
  startNextTurn(lobbyCode); 
}

export const getCategories = (ws) => {
  ws.send(JSON.stringify({
    type: "HANGMAN_CATEGORIES",
    categories: Object.keys(wordCategories)
  }));
};

export const getWordsForCategory = (ws, data) => {
  const { category } = data;
  if (!wordCategories[category]) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Geçersiz kategori" }));
  }
  ws.send(JSON.stringify({
    type: "HANGMAN_CATEGORY_WORDS",
    category,
    words: wordCategories[category]
  }));
};

export const joinGame = async (ws, data) => {
    const { lobbyCode } = data;
    if (!lobbyCode) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby kodu belirtilmedi." }));
    }

    const userInfo = await getUserInfo(ws.userId);
    if (!userInfo) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Kullanıcı bilgileri alınamadı." }));
    }

    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });
    if (!lobby) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Lobby bulunamadı." }));
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
            startedAt: null,
            gameId: null,
            currentPlayerId: null,
            playerOrder: [],
            rankingsSnapshot: [],
            turnTimer: null,
            turnStartTime: null,
        };
    }
    const game = hangmanGames[lobbyCode];

    if (game.players[ws.userId]) {
        game.players[ws.userId].ws = ws;
        game.players[ws.userId].userName = userInfo.username;
        game.players[ws.userId].name = userInfo.name;
        game.players[ws.userId].avatar = userInfo.avatar;
        const playerState = getPlayerSpecificGameState(game, ws.userId);
        const sharedState = getSharedGameState(game);

        ws.send(JSON.stringify({
            type: "HANGMAN_RECONNECTED",
            message: "Oyuna yeniden bağlandın",
            isHost: game.host === ws.userId,
            sharedGameState: sharedState,
            playerSpecificGameState: playerState
        }));
        return;
    }

    if (game.gameStarted && !game.gameEnded) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Oyun zaten başladı, katılamazsınız." }));
    }

    game.players[ws.userId] = {
        ws,
        userId: ws.userId,
        userName: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        correctGuesses: [],
        incorrectGuesses: [],
        remainingAttempts: 6,
        won: false,
        eliminated: false,
    };
    if (!game.playerOrder.includes(ws.userId)) {
        game.playerOrder.push(ws.userId);
    }

    broadcastToGame(game, {
        type: "HANGMAN_PLAYER_JOINED",
        player: { id: ws.userId, userName: userInfo.username, name: userInfo.name, avatar: userInfo.avatar },
        sharedGameState: getSharedGameState(game),
    });


    ws.send(JSON.stringify({
        type: "HANGMAN_JOINED_SUCCESS",
        message: "Oyuna katıldın",
        isHost: game.host === ws.userId,
        sharedGameState: getSharedGameState(game),
        playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId)
    }));
};

export const startGame = (ws, data) => {
    const { lobbyCode, category } = data;
    const game = hangmanGames[lobbyCode];

    if (!game) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Hangman oyunu bulunamadı." }));
    }
    if (game.host !== ws.userId) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Sadece host oyunu başlatabilir." }));
    }
    if (game.gameStarted && !game.gameEnded) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Bu lobideki oyun zaten başladı." }));
    }
    if (Object.keys(game.players).length === 0) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Oyunu başlatmak için lobide en az bir oyuncu olmalı." }));
    }
    if (!category || !wordCategories[category]) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Geçerli bir kategori seçmelisiniz." }));
    }

    const playersToStartGameWith = {};
    Object.keys(game.players).forEach(playerId => {
        const player = game.players[playerId];
        if (player && player.ws) {
            playersToStartGameWith[playerId] = player;
        }
    });

    if (Object.keys(playersToStartGameWith).length === 0) {
        return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Oyunu başlatmak için en az bir aktif (bağlı) oyuncu olmalı." }));
    }

    ws.send(JSON.stringify({ type: 'ACKNOWLEDGEMENT', messageType: 'HANGMAN_START', timestamp: new Date().toISOString() }));

    game.gameEnded = false;
    game.rankingsSnapshot = [];
    game.category = category;
    game.word = getRandomWord(category).toLowerCase();
    game.gameId = new mongoose.Types.ObjectId();
    game.playerOrder = Object.keys(playersToStartGameWith).sort(() => Math.random() - 0.5);

    Object.values(playersToStartGameWith).forEach(player => {
        player.correctGuesses = [];
        player.incorrectGuesses = [];
        player.remainingAttempts = 6;
        player.won = false;
        player.eliminated = false;
    });

    let countdown = 5;
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
                message: "Adam Asmaca oyunu başladı!",
                sharedGameState: getSharedGameState(game)
            });

            startNextTurn(lobbyCode);
        }
    }, 1000);
};


export const guessLetter = (ws, data) => {
  const { lobbyCode, letter } = data;
  const game = hangmanGames[lobbyCode];

  if (!game || !game.gameStarted || game.gameEnded) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Oyun aktif değil." }));
  }
  if (game.currentPlayerId !== ws.userId) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Sıra sende değil." }));
  }
  
  const player = game.players[ws.userId];
  if (!player || player.eliminated || player.won) { 
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Tahmin yapamazsınız." }));
  }

  const normalizedLetter = letter.toLowerCase();
  if (!/^[a-zçğıöşü]$/.test(normalizedLetter)) { 
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Geçerli bir harf girmelisiniz." }));
  }
  
  const alreadyGuessed = player.correctGuesses.includes(normalizedLetter) || player.incorrectGuesses.includes(normalizedLetter);
  if (alreadyGuessed) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Bu harfi zaten tahmin ettiniz." }));
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
    sharedGameState: currentSharedState,
  });
  
  ws.send(JSON.stringify({ 
      type: "HANGMAN_MY_GUESS_RESULT",
      correct: correctGuess,
      letter: normalizedLetter,
      playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId),
      sharedMaskedWord: currentSharedState.maskedWord 
  }));

  if (!correctGuess && player.remainingAttempts <= 0) {
    player.eliminated = true;
    broadcastToGame(game, {
      type: "HANGMAN_PLAYER_ELIMINATED",
      playerId: ws.userId,
      userName: player.userName,
      reason: "no attempts left",
      sharedGameState: getSharedGameState(game), 
    });
  }

  if (!currentSharedState.maskedWord.includes('_')) {
    endGameProcedure(game, "HANGMAN_WORD_REVEALED_GAME_OVER", "Kelime tamamen açığa çıktı! Aktif kalanlar kazandı.");
    return;
  }

  const activePlayersLeft = game.playerOrder.filter(pid => {
      const p = game.players[pid];
      return p && !p.eliminated && !p.won;
  });

  if (activePlayersLeft.length === 0 && !game.gameEnded) { 
    endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "Tüm oyuncular elendi, kimse kazanamadı.");
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
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Oyun aktif değil." }));
  }
  if (game.currentPlayerId !== ws.userId) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Sıra sende değil." }));
  }
  
  const player = game.players[ws.userId];
  if (!player || player.eliminated || player.won) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Tahmin yapamazsınız." }));
  }

  const normalizedGuess = word.toLowerCase();
  const normalizedAnswer = game.word.toLowerCase();

  if (normalizedGuess === normalizedAnswer) {
    player.won = true;
    normalizedAnswer.split('').forEach(char => {
        if (!player.correctGuesses.includes(char)) player.correctGuesses.push(char);
    });
    
    endGameProcedure(game, "HANGMAN_GAME_OVER_WINNER", `${player.userName} kelimeyi doğru tahmin etti ve kazandı!`);
    return; 

  } else { 
    player.remainingAttempts--; 
    
    ws.send(JSON.stringify({ 
      type: "HANGMAN_WORD_GUESS_INCORRECT",
      message: "Kelime tahmini yanlış.",
      playerSpecificGameState: getPlayerSpecificGameState(game, ws.userId),
      sharedMaskedWord: getSharedGameState(game).maskedWord
    }));

    broadcastToGame(game, { 
      type: "HANGMAN_WORD_GUESS_ATTEMPT",
      playerId: ws.userId,
      userName: player.userName,
      guessedWord: normalizedGuess, 
      correct: false,
      sharedGameState: getSharedGameState(game), 
    });

    if (player.remainingAttempts <= 0) {
      player.eliminated = true;
      broadcastToGame(game, {
        type: "HANGMAN_PLAYER_ELIMINATED",
        playerId: ws.userId,
        userName: player.userName,
        reason: "incorrect word guess and no attempts left",
        sharedGameState: getSharedGameState(game), 
      });

      const activePlayersLeft = game.playerOrder.filter(pid => {
          const p = game.players[pid];
          return p && !p.eliminated && !p.won;
      });
      if (activePlayersLeft.length === 0 && !game.gameEnded) {
        endGameProcedure(game, "HANGMAN_GAME_OVER_NO_WINNERS", "Tüm oyuncular elendi, kimse kazanamadı.");
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
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Hangman oyunu bulunamadı." }));
  }
  if (game.host !== ws.userId) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Sadece host oyunu sonlandırabilir." }));
  }
  if (game.gameEnded) {
    return ws.send(JSON.stringify({ type: "HANGMAN_INFO", message: "Oyun zaten bitmiş." }));
  }

  endGameProcedure(game, "HANGMAN_GAME_OVER_HOST_ENDED", "Oyun host tarafından sonlandırıldı.");
};

export const addCustomCategory = (ws, data) => {
  const { category, words } = data;
  if (!category || !Array.isArray(words) || words.length === 0) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Geçersiz kategori veya kelime listesi." }));
  }
  wordCategories[category.toLowerCase()] = words.map(word => word.toLowerCase().trim()).filter(word => word.length > 0);
  ws.send(JSON.stringify({
    type: "HANGMAN_CATEGORY_ADDED",
    message: `"${category}" kategorisi eklendi/güncellendi.`,
    category: category.toLowerCase(),
    newCategories: Object.keys(wordCategories) 
  }));
};

export const getGameState = (ws, data) => {
  const { lobbyCode } = data;
  const game = hangmanGames[lobbyCode];

  if (!game) {
    return ws.send(JSON.stringify({ type: "HANGMAN_ERROR", message: "Hangman oyunu bulunamadı." }));
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
