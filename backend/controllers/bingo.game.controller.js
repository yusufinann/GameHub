import Lobby from "../models/lobby.model.js";
import { BingoGame } from '../models/bingo.game.model.js';
import { hangmanGames } from './hangman.controller.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
// Helper function to get user info from MongoDB
async function getUserInfo(userId) {
  try {
    const user = await User.findById(userId);
    return user ? {
      username: user.username,
      name: user.name,
      avatar:user.avatar
    } : null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}


// Tüm aktif bingo oyunlarını lobbyCode bazında saklıyoruz.
export const bingoGames = {};


const PLAYER_COLORS = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF',
  '#A0C4FF', '#BDB2FF', '#FFC6FF', '#FF8A80', '#FFD180',
  '#FFFF8D', '#B9F6CA', '#84FFFF', '#82B1FF', '#B388FF', '#FF80AB'
];

function shuffleArray(array) {
  const newArray = [...array]; // Orijinal diziyi değiştirmemek için kopya oluştur
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}
/**
 * Yardımcı: Belirtilen aralıktaki sayıları karıştırarak dizi olarak döner.
 */
function generateShuffledNumbers(min, max) {
  const numbers = [];
  for (let i = min; i <= max; i++) {
    numbers.push(i);
  }
  // Fisher-Yates algoritması ile karıştırma
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
}

function isValidSingleRow(rowLayout) {
    if (!rowLayout || rowLayout.length !== 9) return false;
    const trueCount = rowLayout.filter(Boolean).length;
    if (trueCount !== 5) return false;

    for (let i = 0; i < rowLayout.length - 1; i++) {
        if (rowLayout[i] && rowLayout[i+1]) {
            return false;
        }
    }
    return true;
}

function isValidDoubleRow(rowLayout) {
    if (!rowLayout || rowLayout.length !== 9) return false;
    const trueCount = rowLayout.filter(Boolean).length;
    if (trueCount !== 5) return false;

    let doubleTrueCount = 0;
    let doubleTrueStartIndex = -1;

    for (let i = 0; i < rowLayout.length - 1; i++) {
        if (rowLayout[i] && rowLayout[i+1]) {
            if (i > 0 && rowLayout[i-1] && rowLayout[i] && rowLayout[i+1]) return false;
            if (rowLayout[i] && rowLayout[i+1] && i + 2 < rowLayout.length && rowLayout[i+2]) return false;

            doubleTrueCount++;
            if (doubleTrueStartIndex === -1) {
                doubleTrueStartIndex = i;
            }
        }
    }

    if (doubleTrueCount !== 1) return false;

    for (let i = 0; i < rowLayout.length; i++) {
        if (rowLayout[i]) {
            if (i === doubleTrueStartIndex || i === doubleTrueStartIndex + 1) {
                continue;
            }
            if (i + 1 < rowLayout.length && rowLayout[i+1]) {
                if (!(i + 1 === doubleTrueStartIndex || i + 1 === doubleTrueStartIndex + 1)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function generateBingoTicket() {
    const MAX_MAIN_ATTEMPTS = 2000;
    const MAX_ROW_ATTEMPTS = 200;

    let mainAttempts = 0;

    while (mainAttempts < MAX_MAIN_ATTEMPTS) {
        mainAttempts++;
        const allShuffledNumbers = generateShuffledNumbers(1, 90);
        // Bilet için 15 sayı seç (henüz sıralama veya karıştırma yok)
        const chosenTicketNumbers = allShuffledNumbers.slice(0, 15);
        // Bu 15 sayıyı kendi içinde karıştır 
        const ticketNumbersForGrid = shuffleArray(chosenTicketNumbers);
        let numberSourceIdx = 0;

        let layout = Array(3).fill(null).map(() => Array(9).fill(false));
        const numbersGrid = Array(3).fill(null).map(() => Array(9).fill(null));

        const rowIndicesPool = [0, 1, 2];
        const shuffledRowIndices = shuffleArray(rowIndicesPool);

        const pairRowIndices = [shuffledRowIndices[0], shuffledRowIndices[1]];
        const singleRowIndex = shuffledRowIndices[2];

        let layoutGenerationSuccessful = true;

        for (const rowIndex of pairRowIndices) {
            let rowAttempt = 0;
            let validDoubleRowGenerated = false;
            while (rowAttempt < MAX_ROW_ATTEMPTS && !validDoubleRowGenerated) {
                rowAttempt++;
                let currentRowLayout = Array(9).fill(false);
                const allCols = Array.from({ length: 9 }, (_, i) => i);

                const pairStartCol = Math.floor(Math.random() * 8);
                currentRowLayout[pairStartCol] = true;
                currentRowLayout[pairStartCol + 1] = true;

                const availableColsForSingles = allCols.filter(
                    c => c !== pairStartCol && c !== pairStartCol + 1
                );

                if (availableColsForSingles.length < 3) continue;

                const shuffledAvailableCols = shuffleArray(availableColsForSingles);

                for (let i = 0; i < 3; i++) {
                    currentRowLayout[shuffledAvailableCols[i]] = true;
                }

                if (isValidDoubleRow(currentRowLayout)) {
                    layout[rowIndex] = currentRowLayout;
                    validDoubleRowGenerated = true;
                }
            }
            if (!validDoubleRowGenerated) {
                layoutGenerationSuccessful = false;
                break;
            }
        }

        if (!layoutGenerationSuccessful) continue;

        let singleRowAttempt = 0;
        let validSingleRowGenerated = false;
        while (singleRowAttempt < MAX_ROW_ATTEMPTS && !validSingleRowGenerated) {
            singleRowAttempt++;
            let currentRowLayout = Array(9).fill(false);
            const allCols = Array.from({ length: 9 }, (_, i) => i);
            const shuffledCols = shuffleArray(allCols);

            for (let i = 0; i < 5; i++) {
                currentRowLayout[shuffledCols[i]] = true;
            }

            if (isValidSingleRow(currentRowLayout)) {
                layout[singleRowIndex] = currentRowLayout;
                validSingleRowGenerated = true;
            }
        }

        if (!validSingleRowGenerated) {
            layoutGenerationSuccessful = false;
        }

        if (!layoutGenerationSuccessful) continue;

        let emptyColumnFound = false;
        for (let c = 0; c < 9; c++) {
            if (!layout[0][c] && !layout[1][c] && !layout[2][c]) {
                emptyColumnFound = true;
                break;
            }
        }

        if (!emptyColumnFound) {
            if (!isValidDoubleRow(layout[pairRowIndices[0]]) ||
                !isValidDoubleRow(layout[pairRowIndices[1]]) ||
                !isValidSingleRow(layout[singleRowIndex])) {
                continue;
            }

            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 9; c++) {
                    if (layout[r][c]) {
                       
                        if (numberSourceIdx < ticketNumbersForGrid.length) {
                            numbersGrid[r][c] = ticketNumbersForGrid[numberSourceIdx++];
                        } else {
                            layoutGenerationSuccessful = false; break;
                        }
                    }
                }
                if (!layoutGenerationSuccessful) break;
            }

            if (!layoutGenerationSuccessful) continue;

            return { numbersGrid, layout };
        }
    }
    // Hata durumunda (çok nadir de olsa) boş veya hata içeren bir nesne döner.
    return { numbersGrid: null, layout: null, error: "Failed to generate valid ticket layout under current constraints." };
}

function getGameRankings(game) {
  if (!game || !game.players) return [];
  const drawnNumbers = game.drawnNumbers || [];
  return Object.entries(game.players)
    .map(([playerId, player]) => {
        let score = 0;
        if (player.ticket && player.ticket.numbersGrid && player.markedNumbers) {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 9; c++) {
                    const num = player.ticket.numbersGrid[r][c];
                    if (num && player.markedNumbers.includes(num) && drawnNumbers.includes(num)) {
                        score++;
                    }
                }
            }
        }
        return {
            playerId,
            userName: player.userName,
            avatar: player.avatar,
            score: score,
            completedAt: player.completedAt || null
        };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.completedAt && b.completedAt) return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
      if (a.completedAt) return -1;
      if (b.completedAt) return 1;
      return 0;
    });
}


function getCompletedPlayersList(game) {
  if (!game || !game.players) {
      return [];
  }
  return Object.entries(game.players)
      .filter(([, player]) => player && player.completedAt)
      .map(([id, player]) => ({
          id: id, 
          userId: player.userId, 
          userName: player.userName,
           avatar: player.avatar 
      }));
}


export function broadcastToGame(game, data) {
  const messageData = { ...data, lobbyCode: game.lobbyCode };
  const message = JSON.stringify(messageData);
  Object.values(game.players).forEach((player) => {
    if (player.ws && player.ws.readyState === player.ws.OPEN) {
      player.ws.send(message, (err) => {
        if (err) console.error("Bingo mesaj gönderme hatası:", err);
      });
    }
  });
}

// Helper function to calculate score for a player
function calculatePlayerScore(player, drawnNumbers) {
  // player.ticket.numbersGrid is a 3x9 matrix. We need to iterate through it.
  let score = 0;
  if (player.ticket && player.ticket.numbersGrid) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 9; c++) {
        const num = player.ticket.numbersGrid[r][c];
        if (num && player.markedNumbers.includes(num) && drawnNumbers.includes(num)) {
          score++;
        }
      }
    }
  }
  return score;
}

/**
 * Yardımcı: Belirtilen oyundaki tüm oyunculara mesaj gönderir.
 */

function broadcastGameStatus(game) {
  const completedPlayersList = getCompletedPlayersList(game);
  broadcastToGame(game, {
    type: "BINGO_GAME_STATUS",
    completedPlayers: completedPlayersList
  });
}
/**
 * Otomatik sayı çekimi için yardımcı fonksiyon.
 */
function autoDrawNumber(game) {
  if (game.numberPool.length === 0) {
      const rankings = getGameRankings(game);
      game.gameEnded = true;
      game.gameStarted = false; 
      broadcastToGame(game, {
          type: "BINGO_GAME_OVER",
          message: "All numbers drawn - Final Rankings",
          finalRankings: rankings
      });
      saveGameStatsToDB(game);
      game.gameStarted = false;
      clearInterval(game.autoDrawInterval);
      return;
  }

  const number = game.numberPool.shift();
  game.drawnNumbers.push(number);

  
  let numberDisplayDuration = 5000;    
  let activeNumberTotalDuration = 5000; 

  
  if (game.bingoMode === "extended") {
      activeNumberTotalDuration = 10000; // 10 seconds total active time
  } else if (game.bingoMode === "superfast") {
      numberDisplayDuration = 3000;
      activeNumberTotalDuration = 3000;
  }

  game.activeNumbers.push(number);


  const numbersToKeepActive = game.bingoMode === "extended" ? 2 : 1;
  if (game.activeNumbers.length > numbersToKeepActive) {
      game.activeNumbers = game.activeNumbers.slice(-numbersToKeepActive);
  }

 
  broadcastToGame(game, {
      type: "BINGO_NUMBER_DRAWN",
      number,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers
  });

 
  setTimeout(() => {
      if (game.bingoMode === "extended") {
      
          broadcastToGame(game, {
              type: "BINGO_NUMBER_DISPLAY_END",
              number: number,
              activeNumbers: game.activeNumbers
          });
      }
  }, numberDisplayDuration);

 
  setTimeout(() => {
      if (game.bingoMode === "extended") {
         
          if (game.activeNumbers.length > 1) {
              game.activeNumbers = game.activeNumbers.slice(1);
          } else {
              game.activeNumbers = [];
          }
      } else {
          game.activeNumbers = [];
      }

      broadcastToGame(game, {
          type: "BINGO_NUMBER_CLEAR",
          clearedNumber: number,
          activeNumbers: game.activeNumbers
      });

      broadcastGameStatus(game);

    
      const completedPlayersCount = getGameRankings(game).filter(r => r.completedAt).length;
      const allPlayersCompleted = completedPlayersCount === Object.keys(game.players).length;

      if (allPlayersCompleted && !game.gameEnded) {
          const rankings = getGameRankings(game);
          game.gameEnded = true;
          game.gameStarted = false; 
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: "All players completed - Final Rankings",
              finalRankings: rankings
          });
          saveGameStatsToDB(game);
          clearInterval(game.autoDrawInterval);
      } else if (game.numberPool.length === 0 && !game.gameEnded) {
          const rankings = getGameRankings(game);
          game.gameEnded = true;
          game.gameStarted = false; 
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: "All numbers drawn - Final Rankings",
              finalRankings: rankings
          });
          saveGameStatsToDB(game);
          clearInterval(game.autoDrawInterval);
      }
  }, activeNumberTotalDuration);
}

export const drawNumber = (ws, data) => {
  const { lobbyCode } = data;
  const game = bingoGames[lobbyCode];
  if (!game) {
      return ws.send(JSON.stringify({
          type: "BINGO_ERROR",
          message: "Bingo oyunu bulunamadı."
      }));
  }

  if (game.drawMode !== 'manual' || String(game.drawer) !== String(ws.userId)) {
      return ws.send(JSON.stringify({
          type: "BINGO_ERROR",
          message: "Sadece seçilen oyuncu sayı çekebilir."
      }));
  }

  if (game.numberPool.length === 0) {
      const rankings = getGameRankings(game);
      game.gameEnded = true;
      game.gameStarted = false; 
      broadcastToGame(game, {
          type: "BINGO_GAME_OVER",
          message: "Tüm numaralar çekildi.",
          finalRankings: rankings
      });
      game.gameStarted = false;
      return;
  }

  const number = game.numberPool.shift();
  game.drawnNumbers.push(number);

  
  let numberDisplayDuration = 5000; 
  let activeNumberTotalDuration = 5000; 

  if (game.bingoMode === "extended") {
      activeNumberTotalDuration = 10000;
  } else if (game.bingoMode === "superfast") {
      numberDisplayDuration = 3000;
      activeNumberTotalDuration = 3000;
  }

  game.activeNumbers.push(number);

  const numbersToKeepActive = game.bingoMode === "extended" ? 2 : 1;
  if (game.activeNumbers.length > numbersToKeepActive) {
      game.activeNumbers = game.activeNumbers.slice(-numbersToKeepActive);
  }

  broadcastToGame(game, {
      type: "BINGO_NUMBER_DRAWN",
      number,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers
  });


  setTimeout(() => {
      if (game.bingoMode === "extended") {
         
          broadcastToGame(game, {
              type: "BINGO_NUMBER_DISPLAY_END",
              number: number,
              activeNumbers: game.activeNumbers 
          });
      }
  }, numberDisplayDuration);

  setTimeout(() => {
      if (game.bingoMode === "extended") {
        
          if (game.activeNumbers.length > 1) {
              game.activeNumbers = game.activeNumbers.slice(1);
          } else {
              game.activeNumbers = [];
          }
      } else {
      
          game.activeNumbers = [];
      }

      
      broadcastToGame(game, {
          type: "BINGO_NUMBER_CLEAR",
          clearedNumber: number,
          activeNumbers: game.activeNumbers
      });

    
      const completedPlayersCount = getGameRankings(game).filter(r => r.completedAt).length;
      const allPlayersCompleted = completedPlayersCount === Object.keys(game.players).length;

      if (allPlayersCompleted && !game.gameEnded) {
          const rankings = getGameRankings(game);
          game.gameEnded = true;
          game.gameStarted = false; 
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: "All players completed - Final Rankings",
              finalRankings: rankings
          });
          saveGameStatsToDB(game);
          game.gameStarted = false;
      } else if (game.numberPool.length === 0 && !game.gameEnded) {
          const rankings = getGameRankings(game);
          game.gameEnded = true;
          game.gameStarted = false; 
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: "All numbers drawn - Final Rankings",
              finalRankings: rankings
          });
          saveGameStatsToDB(game);
          game.gameStarted = false;
      }
  }, activeNumberTotalDuration);
};


export const startGame = (ws, data) => {
    const { lobbyCode, drawMode, drawer, bingoMode, competitionMode } = data;
    const game = bingoGames[lobbyCode];

    if (!game) {
        console.warn(`[Bingo Server] Oyun başlatma hatası (${lobbyCode}): İn-memory oyun state'i bulunamadı.`);
        return ws.send(JSON.stringify({
            type: "BINGO_ERROR",
            message: "Oyun başlatılamadı: Lobi bilgisi sunucuda mevcut değil veya hazır değil.",
        }));
    }

    if (game.host !== ws.userId) {
        return ws.send(JSON.stringify({
            type: "BINGO_ERROR",
            error: {
                key: "errors.hostOnlyStart",
                message: "Sadece host oyunu başlatabilir.",
            }
        }));
    }
    if (game.gameStarted && !game.gameEnded) {
        return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Oyun zaten başladı." }));
    }
    if (Object.keys(game.players).length === 0) {
        return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Oyunu başlatmak için lobide en az bir oyuncu olmalı." }));
    }

    const playersToStartGameWith = {};
    Object.keys(game.players).forEach(playerId => {
        const player = game.players[playerId];
        if (player && player.ws) {
            playersToStartGameWith[playerId] = player;
        }
    });

    if (Object.keys(playersToStartGameWith).length === 0) {
        return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Oyunu başlatmak için en az bir aktif (bağlı) oyuncu olmalı." }));
    }

    ws.send(JSON.stringify({ type: 'ACKNOWLEDGEMENT', messageType: 'BINGO_START', timestamp: new Date().toISOString() }));

    game.players = playersToStartGameWith;
    game.drawnNumbers = [];
    game.activeNumbers = [];
    game.numberPool = generateShuffledNumbers(1, 90);
    game.gameEnded = false;
    game.drawMode = drawMode || 'auto';
    game.drawer = (game.drawMode === "manual" && game.players[drawer]) ? drawer : null;
    game.bingoMode = bingoMode || 'classic';
    game.gameId = new mongoose.Types.ObjectId();
    game.competitionMode = competitionMode || 'competitive';

    if (game.autoDrawInterval) {
        clearInterval(game.autoDrawInterval);
        game.autoDrawInterval = null;
    }

    for (const playerId in game.players) {
        if (Object.prototype.hasOwnProperty.call(game.players, playerId)) {
            const player = game.players[playerId];
            player.markedNumbers = [];
            player.ticket = generateBingoTicket();
            delete player.completedAt;
            delete player.completedBingo;
        }
    }

    let countdown = 5;
    const countdownInterval = setInterval(() => {
        broadcastToGame(game, {
            type: "BINGO_COUNTDOWN",
            countdown,
        });
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            game.startedAt = new Date();
            game.gameStarted = true;
            game.gameEnded = false;
            broadcastToGame(game, {
                type: "BINGO_STARTED",
                message: "Oyun başladı!",
                drawMode: game.drawMode,
                drawer: game.drawMode === "manual" ? game.drawer : undefined,
                bingoMode: game.bingoMode,
                gameId: game.gameId,
                players: Object.keys(game.players).map(playerId => {
                    const currentPlayer = game.players[playerId];
                    return {
                        playerId: playerId,
                        name: currentPlayer.name || currentPlayer.userName,
                        avatar: currentPlayer.avatar,
                        ticket: currentPlayer.ticket,
                        markedNumbers: currentPlayer.markedNumbers,
                        color: currentPlayer.color
                    };
                }),
                competitionMode: game.competitionMode,
                completedPlayers: []
            });

            if (game.drawMode === "auto") {
                let drawInterval = 5000;
                if (game.bingoMode === "superfast") {
                    drawInterval = 3000;
                }

                const autoDrawInterval = setInterval(() => {
                    if (game.gameEnded || !game.gameStarted) {
                        clearInterval(autoDrawInterval);
                        game.autoDrawInterval = null;
                        return;
                    }
                    autoDrawNumber(game);
                }, drawInterval);
                game.autoDrawInterval = autoDrawInterval;
            }
            if (game.drawMode === "manual" && game.drawer && game.players[game.drawer] && game.players[game.drawer].ws) {
                game.players[game.drawer].ws.send(JSON.stringify({ type: "BINGO_YOUR_TURN_TO_DRAW", message: "Sıradaki sayıyı çekebilirsiniz.", lobbyCode: game.lobbyCode }));
            }
        }
    }, 1000);
};

export const joinGame = async (ws, data) => {
    const { lobbyCode } = data;

    if (!lobbyCode) {
        return ws.send(
            JSON.stringify({
                type: "BINGO_ERROR",
                message: "Lobi kodu belirtilmedi.",
            })
        );
    }

    const userInfo = await getUserInfo(ws.userId);
    if (!userInfo) {
        return ws.send(
            JSON.stringify({
                type: "BINGO_ERROR",
                message: "Kullanıcı bilgileri alınamadı.",
            })
        );
    }

    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });
    if (!lobby) {
        return ws.send(
            JSON.stringify({
                type: "BINGO_ERROR",
                message: "Lobi bulunamadı.",
            })
        );
    }

    if (!bingoGames[lobbyCode]) {
        const shuffledColorsForGame = shuffleArray(PLAYER_COLORS);
        bingoGames[lobbyCode] = {
            lobbyCode,
            players: {},
            drawnNumbers: [],
            activeNumbers: [],
            numberPool: generateShuffledNumbers(1, 90),
            gameStarted: false,
            gameEnded: false,
            host: lobby.createdBy.toString(),
            drawMode: 'auto',
            drawer: null,
            bingoMode: 'classic',
            competitionMode: 'competitive',
            rankings: [],
            _availableColors: shuffledColorsForGame,
            _colorIndex: 0
        };
    }

    const game = bingoGames[lobbyCode];

    if (game.gameStarted && !game.gameEnded && !game.players[ws.userId]) {
        return ws.send(JSON.stringify({
            type: "BINGO_ERROR",
            message: "Bu lobide aktif bir oyun devam ediyor. Lütfen oyunun bitmesini bekleyin veya başka bir lobiye katılın."
        }));
    }

    const mapPlayerToClient = (player) => ({
        id: player.userId,
        userName: player.userName,
        name: player.name,
        avatar: player.avatar,
        completed: player.completedBingo || false,
        color: player.color
    });

    if (game.players[ws.userId]) {
        const player = game.players[ws.userId];
        player.ws = ws;
        player.userName = userInfo.username;
        player.name = userInfo.name;
        player.avatar = userInfo.avatar;

        return ws.send(JSON.stringify({
            type: "BINGO_JOIN",
            message: "Oyuna başarıyla yeniden bağlandınız.",
            ticket: player.ticket,
            markedNumbers: player.markedNumbers || [],
            isHost: String(game.host) === String(ws.userId),
            players: Object.values(game.players).map(mapPlayerToClient),
            gameStarted: game.gameStarted,
            drawnNumbers: game.drawnNumbers,
            activeNumbers: game.activeNumbers,
            drawMode: game.drawMode,
            drawer: game.drawer,
            completedBingo: player.completedBingo || false,
            completedPlayers: getCompletedPlayersList(game),
            bingoMode: game.bingoMode,
            competitionMode: game.competitionMode,
            gameId: game.gameId,
            rankings: game.rankings || (game.gameStarted ? getGameRankings(game) : []),
            playerColor: player.color
        }));
    }

    let playerColorToAssign;
    if (game._availableColors && game._availableColors.length > 0) {
        playerColorToAssign = game._availableColors[game._colorIndex % game._availableColors.length];
        game._colorIndex++;
    } else {
        playerColorToAssign = PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
        console.warn(`[Bingo Server] Lobi ${lobbyCode} için karıştırılmış renkler tükendi veya bulunamadı. Rastgele renk atandı: ${playerColorToAssign}`);
        if (!game._availableColors || game._availableColors.length === 0) {
            game._availableColors = shuffleArray(PLAYER_COLORS);
            game._colorIndex = 0;
            if (game._availableColors.length > 0) {
                playerColorToAssign = game._availableColors[game._colorIndex % game._availableColors.length];
                game._colorIndex++;
            }
        }
    }

    const newTicket = generateBingoTicket();

    game.players[ws.userId] = {
        ticket: newTicket,
        ws,
        markedNumbers: [],
        userName: userInfo.username,
        name: userInfo.name,
        avatar: userInfo.avatar,
        userId: ws.userId,
        completedBingo: false,
        color: playerColorToAssign
    };

    broadcastToGame(game, {
        type: "BINGO_PLAYER_JOINED",
        player: {
            id: ws.userId,
            name: userInfo.name,
            userName: userInfo.username,
            avatar: userInfo.avatar,
            color: playerColorToAssign
        },
        notification: {
            key: "notifications.playerJoined",
            params: { playerName: userInfo.name || userInfo.username }
        }
    });

    ws.send(JSON.stringify({
        type: "BINGO_JOIN",
        message: "Oyuna başarıyla katıldınız.",
        ticket: newTicket,
        markedNumbers: [],
        isHost: String(game.host) === String(ws.userId),
        players: Object.values(game.players).map(mapPlayerToClient),
        gameStarted: game.gameStarted,
        drawnNumbers: game.drawnNumbers,
        activeNumbers: game.activeNumbers,
        drawMode: game.drawMode,
        drawer: game.drawer,
        userInfo: {
            name: userInfo.name,
            userName: userInfo.username,
            avatar: userInfo.avatar
        },
        completedBingo: false,
        completedPlayers: getCompletedPlayersList(game),
        bingoMode: game.bingoMode,
        competitionMode: game.competitionMode,
        gameId: game.gameId,
        rankings: game.rankings || [],
        playerColor: playerColorToAssign
    }));
};

export const handleBingoPlayerLeavePreGame = (lobbyCode, playerId) => {
    const game = bingoGames[lobbyCode];
    if (!game || !game.players[playerId]) {
        return;
    }

    if (game.gameStarted) {
       
        return;
    }

    const playerInfo = game.players[playerId];
    delete game.players[playerId];

    if (Object.keys(game.players).length > 0) {
        broadcastToGame(game, {
            type: "BINGO_PLAYER_LEFT_PREGAME",
            playerId: playerId,
            playerName: playerInfo?.name,
            userName: playerInfo?.userName,
            players: Object.values(game.players).map(p => ({
                id: p.userId,
                userName: p.userName,
                name: p.name,
                completed: p.completedBingo || false
            }))
        });
    } else {
        
        delete bingoGames[lobbyCode];
    }
};
export const handleBingoPlayerLeaveMidGame = (lobbyCode, playerId) => {
    const game = bingoGames[lobbyCode];

    if (!game) {
        console.warn(`[Bingo Leave MidGame] Game not found for lobby: ${lobbyCode}`);
        return;
    }

    if (!game.gameStarted || game.gameEnded) {
        console.warn(`[Bingo Leave MidGame] Game not started or already ended for lobby: ${lobbyCode}`);
        return;
    }

    const playerLeaving = game.players[playerId];
    if (!playerLeaving) {
        console.warn(`[Bingo Leave MidGame] Player ${playerId} not found in game for lobby: ${lobbyCode}`);
        return;
    }

    const playerName = playerLeaving.name || playerLeaving.userName || `Oyuncu ${playerId}`;
    console.log(`[Bingo Leave MidGame] Player ${playerName} (${playerId}) is leaving mid-game from lobby: ${lobbyCode}`);

    delete game.players[playerId];

    const remainingPlayerCount = Object.keys(game.players).length;

    if (remainingPlayerCount > 0) {
        broadcastToGame(game, {
            type: "BINGO_PLAYER_LEFT_MID_GAME",
            playerId: playerId,
            playerName: playerName,
        });

        if (game.drawMode === 'manual' && String(game.drawer) === String(playerId)) {
            console.log(`[Bingo Leave MidGame] Manual drawer ${playerName} left. Switching to AUTO draw mode for lobby: ${lobbyCode}`);
            
            if (game.autoDrawInterval) {
                clearInterval(game.autoDrawInterval);
                game.autoDrawInterval = null;
            }

            game.drawMode = 'auto';
            game.drawer = null;

            broadcastToGame(game, {
                type: "BINGO_DRAW_MODE_CHANGED",
                newDrawMode: 'auto',
                message: `Sayıyı çeken oyuncu (${playerName}) oyundan ayrıldığı için oyun otomatik sayı çekme moduna geçirildi.`,
            });

            let drawInterval = 5000; 
            if (game.bingoMode === "superfast") {
                drawInterval = 3000;
            } else if (game.bingoMode === "fast") {
                drawInterval = 4000;
            }

            if (typeof autoDrawNumber === 'function') {
                game.autoDrawInterval = setInterval(() => {
                    if (game.gameEnded || !game.gameStarted) {
                        clearInterval(game.autoDrawInterval);
                        game.autoDrawInterval = null;
                        return;
                    }
                    autoDrawNumber(game);
                }, drawInterval);
            } else {
                console.error(`[Bingo Leave MidGame] autoDrawNumber function is not defined for lobby: ${lobbyCode}. Cannot start auto draw.`);
            }
        }

        const currentRankings = getGameRankings(game);
        const completedPlayersCount = currentRankings.filter(r => r.completedAt).length;
        const allRemainingPlayersCompleted = completedPlayersCount === remainingPlayerCount;

        if (allRemainingPlayersCompleted && !game.gameEnded) {
            console.log(`[Bingo Leave MidGame] All remaining players completed. Ending game for lobby: ${lobbyCode}`);
            game.gameEnded = true;
            game.gameStarted = false;
            
            if (game.autoDrawInterval) {
                clearInterval(game.autoDrawInterval);
                game.autoDrawInterval = null;
            }
            
            broadcastToGame(game, {
                type: "BINGO_GAME_OVER",
                message: "Kalan tüm oyuncular tamamladı (bir oyuncu ayrıldıktan sonra). Final Sıralaması:",
                finalRankings: currentRankings
            });
            saveGameStatsToDB(game);
        }

    } else {
        console.log(`[Bingo Leave MidGame] No players left. Ending and deleting game for lobby: ${lobbyCode}`);
        game.gameEnded = true;
        game.gameStarted = false;
        
        if (game.autoDrawInterval) {
            clearInterval(game.autoDrawInterval);
            game.autoDrawInterval = null;
        }
        
        delete bingoGames[lobbyCode];
    }
};
export const markNumber = (ws, data) => {
  const { lobbyCode, number } = data;
  const game = bingoGames[lobbyCode];

  if (!game || !game.players[ws.userId]) {
    return ws.send(JSON.stringify({
      type: "BINGO_ERROR",
      message: "Invalid game or player"
    }));
  }

  const player = game.players[ws.userId];

  // Check if the number is actually on the player's ticket
  let numberFoundOnTicket = false;
  if (player.ticket && player.ticket.numbersGrid) {
      for(let r=0; r < 3; r++) {
          if (player.ticket.numbersGrid[r].includes(number)) {
              numberFoundOnTicket = true;
              break;
          }
      }
  }

  if (!numberFoundOnTicket) {
     return ws.send(JSON.stringify({
      type: "BINGO_ERROR",
      message: "Number not on your ticket."
    }));
  }
  
  // Check if the number has been drawn and is active (or was drawn)
  if (!game.drawnNumbers.includes(number)) {
      return ws.send(JSON.stringify({
      type: "BINGO_ERROR",
      message: "This number has not been drawn yet."
    }));
  }


  if (!player.markedNumbers.includes(number)) {
    player.markedNumbers.push(number);

    // Check for BINGO (all 15 numbers on ticket marked AND drawn)
    const allTicketNumbers = [];
    if (player.ticket && player.ticket.numbersGrid) {
        player.ticket.numbersGrid.forEach(row => {
            row.forEach(num => {
                if (num !== null) allTicketNumbers.push(num);
            });
        });
    }
    
    const correctlyMarkedCount = player.markedNumbers.filter(mn => game.drawnNumbers.includes(mn) && allTicketNumbers.includes(mn)).length;

    if (correctlyMarkedCount === 15 && !player.completedBingo) {
        player.completedBingo = true;
        player.completedAt = new Date(); 
        
        broadcastToGame(game, {
            type: "BINGO_PLAYER_COMPLETED",
            playerId: ws.userId,
            playerName: player.name || player.userName,
            avatar: player.avatar,
            completedAt: player.completedAt,
            notification: {
                 key: "notifications.playerCompletedBingo",
                 params: { playerName: player.name || player.userName }
            }
        });
        broadcastGameStatus(game); // Update completed players list for everyone

        // Check if all players have completed
        const rankings = getGameRankings(game);
        const completedPlayersInGame = rankings.filter(r => r.completedAt).length;
        if (completedPlayersInGame === Object.keys(game.players).length && !game.gameEnded) {
            game.gameEnded = true;
            game.gameStarted = false;
            broadcastToGame(game, {
                type: "BINGO_GAME_OVER",
                message: "All players completed! Final Rankings",
                finalRankings: rankings
            });
            saveGameStatsToDB(game); 
            if (game.autoDrawInterval) {
                clearInterval(game.autoDrawInterval);
                game.autoDrawInterval = null;
            }
        }
    }


    ws.send(JSON.stringify({
        type: "BINGO_NUMBER_MARKED_CONFIRMED",
        playerId: ws.userId,
        number,
        markedNumbers: player.markedNumbers,
        completedBingo: player.completedBingo || false
    }));
  }
};



async function saveGameStatsToDB(game) {
  console.log('saveGameStatsToDB fonksiyonu çağrıldı - Başlangıç Zamanı:', game.startedAt, 'Bitiş Zamanı:', new Date());
  try {
    const rankings = getGameRankings(game);

    rankings.forEach((rankInfo, index) => {
      const player = game.players[rankInfo.playerId];
      if (player) {
        player.finalRank = index + 1;
      }
    });

    const winnerRankInfo = rankings.find(rankInfo => rankInfo.rank === 1);

    let winner = null;
    if (winnerRankInfo) {
      const winnerPlayer = game.players[winnerRankInfo.playerId];
      if (winnerPlayer) { // Check if winnerPlayer exists
        winner = {
          playerId: winnerPlayer.userId,
          userName: winnerPlayer.userName,
          completedAt: winnerPlayer.completedAt
        };
      } else {
        console.warn("Winner player not found in game.players:", winnerRankInfo.playerId); // Warn if player not found
      }
    }
    game.winner = winner;

 const playersForDB = Object.values(game.players).map(player => {
    let ticketNumbersForDB = [];
    if (player.ticket && player.ticket.numbersGrid) {
        player.ticket.numbersGrid.forEach(row => {
            row.forEach(num => {
                if (num !== null) {
                    ticketNumbersForDB.push(num);
                }
            });
        });
    }
    return {
        playerId: player.userId,
        userName: player.userName,
        score: calculatePlayerScore(player, game.drawnNumbers),
        ticket: ticketNumbersForDB.sort((a,b) => a-b), // Modelin beklediği sayı dizisi
        completedAt: player.completedAt,
        finalRank: player.finalRank
    };
});

    const newBingoGame = new BingoGame({
      gameId: game.gameId,
      lobbyCode: game.lobbyCode,
      startedAt: game.startedAt,
      endedAt: new Date(),
      players: playersForDB,
      drawnNumbers: game.drawnNumbers,
      drawMode: game.drawMode,
      winner: game.winner,
      createdBy: game.host
    });

    await newBingoGame.save();
    console.log('Oyun istatistikleri kaydedildi - Başlangıç Zamanı:', game.startedAt, 'Bitiş Zamanı:', new Date());
  } catch (error) {
    console.error("Oyun istatistikleri kaydedilirken hata oluştu:", error);
  }
}



export const checkBingo = (ws, data) => {
  const { lobbyCode } = data;
  const game = bingoGames[lobbyCode];

  if (!game) {
      console.error(`checkBingo Hatası: ${lobbyCode} için oyun bulunamadı.`);
      return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Oyun bulunamadı." }));
  }

  if (!game.gameStarted || game.gameEnded) {
       console.warn(`checkBingo Uyarısı: ${lobbyCode} için oyun aktif değil (başlamadı veya bitti).`);
       return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Oyun aktif değil."}));
  }

  const player = game.players[ws.userId];

  if (!player) {
      console.error(`checkBingo Hatası: Oyuncu (${ws.userId}) ${lobbyCode} oyununda bulunamadı.`);
      return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Oyuncu bilgisi bulunamadı." }));
  }

  if (player.completedBingo) {
       console.log(`checkBingo Bilgi: Oyuncu (${player.userName}) zaten Bingo yapmış.`);
       return ws.send(JSON.stringify({ type: "BINGO_INVALID", message: "Zaten Bingo yaptınız." }));
  }

  if (!player.ticket || !player.ticket.numbersGrid || !player.ticket.layout) {
      console.error(`checkBingo Hatası: Oyuncu (${player.userName}) için bilet geçersiz veya eksik.`);
      return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Bilet bilgisi geçersiz." }));
  }

  const playerTicketNumbers = [];
  player.ticket.numbersGrid.forEach(row => {
      row.forEach(num => {
          if (num !== null) {
              playerTicketNumbers.push(num);
          }
      });
  });

  if (playerTicketNumbers.length !== 15) {
      console.error(`checkBingo Hatası: Oyuncu (${player.userName}) için biletteki sayı adedi (${playerTicketNumbers.length}) geçersiz.`);
      return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: `Biletinizde beklenenden farklı sayıda (${playerTicketNumbers.length}) numara var.` }));
  }

  if (!Array.isArray(game.drawnNumbers)) {
       console.error(`checkBingo Hatası: ${lobbyCode} için çekilen sayılar listesi geçersiz.`);
       game.drawnNumbers = [];
  }
   if (!Array.isArray(player.markedNumbers)) {
       player.markedNumbers = [];
       console.warn(`checkBingo Uyarısı: Oyuncu (${player.userName}) için işaretlenen sayılar listesi yoktu, oluşturuldu.`);
  }

  const isAllTicketNumbersDrawn = playerTicketNumbers.every((num) => game.drawnNumbers.includes(num));
  const isAllTicketNumbersMarked = playerTicketNumbers.every(num => player.markedNumbers.includes(num));

  if (isAllTicketNumbersDrawn && isAllTicketNumbersMarked) {
      if (!player.completedAt) {
          player.completedAt = new Date().toISOString();
          player.completedBingo = true;
      }

      const currentRankings = getGameRankings(game);
      const playerRankInfo = currentRankings.find(r => String(r.playerId) === String(ws.userId));
      const playerRank = playerRankInfo ? playerRankInfo.rank : null;
      const currentCompletedPlayers = getCompletedPlayersList(game);
      const numberOfPlayers = Object.keys(game.players).length;
      const allNumbersDrawn = game.numberPool && game.numberPool.length === 0;
      const allConnectedPlayersCompleted = currentCompletedPlayers.length === numberOfPlayers;

      let shouldGameEnd = false;
      let gameOverReason = "";

      if (game.competitionMode === 'non-competitive') {
          shouldGameEnd = true;
          gameOverReason = `${player.name || player.userName} BINGO! Oyunu Kazandı!`;
      } else {
          if (numberOfPlayers <= 1) {
              shouldGameEnd = true;
              gameOverReason = "Oyun Bitti - Final Sıralaması";
          } else if (allConnectedPlayersCompleted) {
              shouldGameEnd = true;
              gameOverReason = "Oyun Bitti - Tüm Oyuncular Tamamladı";
          } else if (allNumbersDrawn) {
              shouldGameEnd = true;
              gameOverReason = "Oyun Bitti - Tüm Numaralar Çekildi";
          }
      }

      broadcastToGame(game, {
          type: "BINGO_PLAYER_COMPLETED",
          playerId: ws.userId,
          playerName: player.name || player.userName,
          avatar: player.avatar,
          color: player.color,
          completedAt: player.completedAt,
          rank: playerRank,
          notification: {
               key: "notifications.playerCompletedBingo",
               params: { playerName: player.name || player.userName }
          }
      });

      if (shouldGameEnd && !game.gameEnded) {
          game.gameEnded = true;
          game.gameStarted = false;
          if (game.autoDrawInterval) {
              clearInterval(game.autoDrawInterval);
              game.autoDrawInterval = null;
          }

          const finalRankingsForGameOver = getGameRankings(game);
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: gameOverReason,
              finalRankings: finalRankingsForGameOver,
              gameId: game.gameId,
              completedPlayers: getCompletedPlayersList(game)
          });
          saveGameStatsToDB(game).catch(err => console.error("saveGameStatsToDB Hatası (Oyun Sonu):", err));

      } else if (!game.gameEnded) {
           broadcastToGame(game, {
               type: "BINGO_GAME_STATUS",
               rankings: currentRankings,
               completedPlayers: currentCompletedPlayers,
           });
      }

  } else {
      ws.send(JSON.stringify({
          type: "BINGO_INVALID",
          message: "Geçersiz Bingo çağrısı."
      }));
  }
};


/**
 * GET /api/bingo/stats
 * Giriş yapmış kullanıcının oynadığı oyunların ilerleyiş istatistiklerini döner.
 */
export const getUserBingoStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Kullanıcının katıldığı tüm oyun kayıtlarını çekiyoruz ve playerId'si userId olan oyuncuları filtreliyoruz.
    const games = await BingoGame.find({ "players.playerId": userId });

    let totalGames = games.length; // Directly use games.length
    let wins = 0;
    let totalScore = 0;

    const gamesDetails = games.map(game => { // Directly map over games
      // İlgili oyuncu bilgilerini buluyoruz
      const playerInfo = game.players.find(p => p.playerId === userId);
      let isWin = false;
      if (playerInfo && playerInfo.finalRank === 1) {
        wins++;
        isWin = true;
      }
      totalScore += playerInfo ? playerInfo.score : 0;

      return {
        gameId: game.gameId,
        lobbyCode: game.lobbyCode,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        score: playerInfo ? playerInfo.score : 0,
        finalRank: playerInfo ? playerInfo.finalRank : null,
        ticket: playerInfo ? playerInfo.ticket : [],
        isWin: isWin
      };
    });

    const averageScore = totalGames > 0 ? totalScore / totalGames : 0;

    res.json({
      totalGames,
      wins,
      averageScore,
      games: gamesDetails
    });
  } catch (error) {
    console.error('Bingo user stats error:', error);
    res.status(500).json({ message: 'İç sunucu hatası' });
  }
};

const formatMillisecondsToHHMMSS = (ms) => {
  if (ms === null || ms === undefined || ms <= 0) return "00:00:00";
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24; // Günleri göstermiyoruz, sadece saat kısmı

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getPlayerStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // ObjectId geçerliliğini kontrol etmek iyi bir pratik
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Geçersiz kullanıcı IDsi." });
    }

    // startedAt ve endedAt alanlarını da seçtiğimizden emin olalım
    const games = await BingoGame.find({ "players.playerId": userId })
        .select("lobbyCode gameId players startedAt endedAt") // Gerekli alanları seç
        .sort({ endedAt: -1 }) // En son oynanan oyunlar üste gelsin
        .lean(); // Performans için

    if (!games || games.length === 0) {
      // Opsiyonel: Kullanıcı adını User modelinden çekip döndürebilirsiniz
      return res.status(404).json({ message: "Bu kullanıcı için Bingo oyun istatistiği bulunamadı." });
    }

    let totalGamesPlayed = games.length;
    let totalWins = 0;
    let totalScore = 0;
    let totalPlayTimeMilliseconds = 0;
    let userName = ""; // Kullanıcı adını oyunlardan veya User modelinden alabiliriz

    const gamesDetails = games.map(game => {
      const playerInfo = game.players.find(p => p.playerId === userId); // Bingo modelinizde playerId String ise
      // const playerInfo = game.players.find(p => p.playerId.equals(new mongoose.Types.ObjectId(userId))); // playerId ObjectId ise

      let isWin = false;
      let playerScore = 0;
      let playerFinalRank = null;

      if (playerInfo) {
        if (!userName && playerInfo.userName) userName = playerInfo.userName; // İlk bulduğumuz userName'i alalım
        if (playerInfo.finalRank === 1) {
          totalWins++;
          isWin = true;
        }
        playerScore = playerInfo.score || 0;
        playerFinalRank = playerInfo.finalRank;
      }
      totalScore += playerScore;

      let durationMilliseconds = null;
      let durationFormatted = "00:00:00"; // veya "N/A"

      if (game.startedAt && game.endedAt) {
        durationMilliseconds = game.endedAt.getTime() - game.startedAt.getTime();
        totalPlayTimeMilliseconds += durationMilliseconds;
        durationFormatted = formatMillisecondsToHHMMSS(durationMilliseconds);
      }

      return {
        gameId: game.gameId,
        lobbyCode: game.lobbyCode,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        durationMilliseconds: durationMilliseconds,
        durationFormatted: durationFormatted,
        score: playerScore,
        finalRank: playerFinalRank,
        isWin: isWin
      };
    });

    const averageScore = totalGamesPlayed > 0 ? parseFloat((totalScore / totalGamesPlayed).toFixed(2)) : 0;

    // Eğer oyunlardan userName alınamadıysa User modelinden çekmeyi deneyebiliriz
    if (!userName && totalGamesPlayed > 0) {
        try {
            const User = mongoose.model('User'); // User modelinizin adını ve importunu kontrol edin
            const user = await User.findById(userId).select('username').lean(); // 'username' alanını kendi modelinize göre ayarlayın
            if (user && user.username) {
                userName = user.username;
            }
        } catch (e) {
            console.warn("Bingo stats: Kullanıcı adı User modelinden alınırken hata:", e.message);
        }
    }


    res.status(200).json({
      userId: userId,
      userName: userName || "Bilinmiyor",
      totalGames: totalGamesPlayed,
      wins: totalWins,
      averageScore,
      totalPlayTimeMilliseconds,
      totalPlayTimeFormatted: formatMillisecondsToHHMMSS(totalPlayTimeMilliseconds),
      games: gamesDetails
    });
  } catch (error) {
    console.error('Error fetching Bingo player stats:', error);
    res.status(500).json({ message: 'Bingo istatistikleri alınırken sunucuda bir hata oluştu.', error: error.message });
  }
};

export const getAllPlayerBingoStats = async (req, res) => {
  try {
    const playerStats = await BingoGame.aggregate([
    
      {
        $unwind: "$players"
      },
    
      {
        $group: {
          _id: "$players.playerId", 
          userName: { $first: "$players.userName" }, 
          totalGames: { $sum: 1 }, 
          totalScore: { $sum: "$players.score" }, 
          wins: {
            $sum: {
              $cond: [{ $eq: ["$players.finalRank", 1] }, 1, 0] 
            }
          }
        }
      },
  
      {
        $addFields: {
          averageScore: {
            $cond: [
              { $eq: ["$totalGames", 0] },
              0, 
              { $divide: ["$totalScore", "$totalGames"] } 
            ]
          }
        }
      },
   
      {
        $sort: {
          averageScore: -1, 
          userName: 1     
        }
      },
      
      {
        $project: {
          _id: 0, 
          playerId: "$_id", 
          userName: 1,
          totalGames: 1,
          totalScore: 1,
          wins: 1,
          averageScore: 1
        }
      }
    ]);

    res.status(200).json({ playerOverallStats: playerStats });
  } catch (error) {
    console.error("Error aggregating player bingo stats:", error);
    res.status(500).json({ message: "Sunucuda bir hata oluştu.", error: error.message });
  }
};