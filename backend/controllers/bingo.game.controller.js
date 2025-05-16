import Lobby from "../models/lobby.model.js";
import { BingoGame } from '../models/bingo.game.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';
// Helper function to get user info from MongoDB
async function getUserInfo(userId) {
  try {
    const user = await User.findById(userId);
    return user ? {
      username: user.username,
      name: user.name
    } : null;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
}


// Tüm aktif bingo oyunlarını lobbyCode bazında saklıyoruz.
export const bingoGames = {};

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

/**
 * Yardımcı: Basit bir ticket oluşturur.
 * Örneğin, 15 benzersiz numaradan oluşan bir ticket.
 */
function generateTicket() {
  const shuffledNumbers = generateShuffledNumbers(1, 90);
  return shuffledNumbers.slice(0, 15).sort((a, b) => a - b);
}

// Helper function to calculate score for a player
function calculatePlayerScore(player, drawnNumbers) {
  return player.markedNumbers.filter(num =>
    player.ticket.includes(num) && drawnNumbers.includes(num)
  ).length;
}

// Helper function to get player rankings
function getGameRankings(game) {
  const rankings = Object.entries(game.players)
    .map(([playerId, player]) => ({
      playerId,
      userName: player.userName,
      score: calculatePlayerScore(player, game.drawnNumbers),
      completedAt: player.completedAt || null
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.completedAt && b.completedAt) return a.completedAt - b.completedAt;
      if (a.completedAt) return -1;
      if (b.completedAt) return 1;
      return 0;
    });

  return rankings;
}
/**
 * Yardımcı: Belirtilen oyundaki tüm oyunculara mesaj gönderir.
 */
export function broadcastToGame(game, data) {
  const message = JSON.stringify(data);
  Object.values(game.players).forEach((player) => {
    if (player.ws.readyState === player.ws.OPEN) {
      player.ws.send(message, (err) => {
        if (err) console.error("Bingo mesaj gönderme hatası:", err);
      });
    }
  });
}
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
      game.gameStarted = false; // <----- EKLEDİ: Oyun bittiğinde gameStarted'ı false yap
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

  // Configuration based on game mode
  let numberDisplayDuration = 5000;    // Display time for current number
  let activeNumberTotalDuration = 5000; // Total time number stays active (including display time)

  // Extended mode: numbers remain active for 10 seconds total (5s display + 5s active only)
  if (game.bingoMode === "extended") {
      activeNumberTotalDuration = 10000; // 10 seconds total active time
  } else if (game.bingoMode === "superfast") {
      numberDisplayDuration = 3000;
      activeNumberTotalDuration = 3000;
  }

  // Add the new number to active numbers
  game.activeNumbers.push(number);

  // For extended mode, keep the current and one previous number
  // For other modes, keep only the current number
  const numbersToKeepActive = game.bingoMode === "extended" ? 2 : 1;
  if (game.activeNumbers.length > numbersToKeepActive) {
      game.activeNumbers = game.activeNumbers.slice(-numbersToKeepActive);
  }

  // Broadcast the drawn number to all players
  broadcastToGame(game, {
      type: "BINGO_NUMBER_DRAWN",
      number,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers
  });

  // First timeout: After display duration, clear number from display but keep in active numbers
  setTimeout(() => {
      if (game.bingoMode === "extended") {
          // For extended mode, we don't remove from activeNumbers yet,
          // but we notify clients that the number is no longer being displayed
          broadcastToGame(game, {
              type: "BINGO_NUMBER_DISPLAY_END",
              number: number,
              activeNumbers: game.activeNumbers
          });
      }
  }, numberDisplayDuration);

  // Second timeout: After total active duration, clear number from active numbers
  setTimeout(() => {
      if (game.bingoMode === "extended") {
          // Remove oldest number from active numbers if there's more than one
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

      // Game end checks
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

  // Configuration based on game mode
  let numberDisplayDuration = 5000; // Display time for current number
  let activeNumberTotalDuration = 5000; // Total time number stays active (including display time)

  // Extended mode: numbers remain active for 10 seconds total (5s display + 5s active only)
  if (game.bingoMode === "extended") {
      activeNumberTotalDuration = 10000; // 10 seconds total active time
  } else if (game.bingoMode === "superfast") {
      numberDisplayDuration = 3000;
      activeNumberTotalDuration = 3000;
  }

  // Add the new number to active numbers
  game.activeNumbers.push(number);

  // For extended mode, keep the current and one previous number
  // For other modes, keep only the current number
  const numbersToKeepActive = game.bingoMode === "extended" ? 2 : 1;
  if (game.activeNumbers.length > numbersToKeepActive) {
      game.activeNumbers = game.activeNumbers.slice(-numbersToKeepActive);
  }

  // Broadcast the drawn number to all players
  broadcastToGame(game, {
      type: "BINGO_NUMBER_DRAWN",
      number,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers
  });

  // First timeout: After display duration, clear number from display but keep in active numbers
  setTimeout(() => {
      if (game.bingoMode === "extended") {
          // For extended mode, we don't remove from activeNumbers yet,
          // but we notify clients that the number is no longer being displayed
          broadcastToGame(game, {
              type: "BINGO_NUMBER_DISPLAY_END",
              number: number,
              activeNumbers: game.activeNumbers 
          });
      }
  }, numberDisplayDuration);

  setTimeout(() => {
      if (game.bingoMode === "extended") {
          // Remove oldest number from active numbers if there's more than one
          if (game.activeNumbers.length > 1) {
              game.activeNumbers = game.activeNumbers.slice(1);
          } else {
              game.activeNumbers = [];
          }
      } else {
          // For other modes, clear all active numbers
          game.activeNumbers = [];
      }

      // Broadcast the updated active numbers
      broadcastToGame(game, {
          type: "BINGO_NUMBER_CLEAR",
          clearedNumber: number,
          activeNumbers: game.activeNumbers
      });

      // Game end checks
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

// Adjust startGame to set correct interval for auto draw mode
export const startGame = (ws, data) => {
  const { lobbyCode, drawMode, drawer, bingoMode,competitionMode  } = data;
  const game = bingoGames[lobbyCode];
  if (!game) {
      return ws.send(
          JSON.stringify({
              type: "BINGO_ERROR",
              message: "Bingo oyunu bulunamadı.",
          })
      );
  }

  if (game.host !== ws.userId) {
      return ws.send(JSON.stringify({
          type: "BINGO_ERROR",
          message: "Sadece host oyunu başlatabilir."
      }));
  }
  if (game.gameStarted) {
      return ws.send(
          JSON.stringify({
              type: "BINGO_ERROR",
              message: "Oyun zaten başladı.",
          })
      );
  }

  // Reset game data
  game.drawnNumbers = [];
  game.activeNumbers = [];
  game.numberPool = generateShuffledNumbers(1, 90);
  game.gameEnded = false;
  game.gameStarted = false;
  game.gameId = new mongoose.Types.ObjectId();
  game.competitionMode = competitionMode || 'competitive'; 

  if (game.autoDrawInterval) {
      clearInterval(game.autoDrawInterval);
      game.autoDrawInterval = null;
  }

  for (const playerId in game.players) {
      game.players[playerId].markedNumbers = [];
      game.players[playerId].ticket = generateTicket();
      delete game.players[playerId].completedAt;
      delete game.players[playerId].completedBingo;
  }

  game.drawMode = drawMode;
  game.drawer = drawMode === "manual" ? drawer : null;
  game.bingoMode = bingoMode;

  // 5 second countdown
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
          console.log('Oyun başladı - Başlangıç Zamanı:', game.startedAt);
          broadcastToGame(game, {
              type: "BINGO_STARTED",
              message: "Oyun başladı!",
              drawMode,
              drawer: drawMode === "manual" ? drawer : undefined,
              bingoMode: game.bingoMode,
              gameId: game.gameId,
              players: Object.keys(game.players).map(playerId => ({
                  playerId: playerId,
                  ticket: game.players[playerId].ticket
              })),
              competitionMode: game.competitionMode,
              completedPlayers: []
          });

          if (drawMode === "auto") {
              let drawInterval = 5000; // Default for all modes
              if (game.bingoMode === "superfast") {
                  drawInterval = 3000;
              }

              const autoDrawInterval = setInterval(() => {
                  if (game.gameEnded) {
                      clearInterval(autoDrawInterval);
                      return;
                  }
                  autoDrawNumber(game);
              }, drawInterval);

              game.autoDrawInterval = autoDrawInterval;
          }
      }
  }, 1000);
};
/**
 * Oyuna katılma: Oyuncu, lobby bazlı bingo oyununa katılır ve kendine bir ticket alır.
 * Beklenen data örneği: { lobbyCode: "ABC123" }
 */
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

  // Fetch user information from database
  const userInfo = await getUserInfo(ws.userId);
  if (!userInfo) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Kullanıcı bilgileri alınamadı.",
      })
    );
  }

  // Find lobby from MongoDB
  const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });
  if (!lobby) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Lobi bulunamadı.",
      })
    );
  }

  // Create game if it doesn't exist
  if (!bingoGames[lobbyCode]) {
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
      drawer: null
    };
  }

  const game = bingoGames[lobbyCode];

  if (game.gameStarted && !game.gameEnded && !game.players[ws.userId]) {
    return ws.send(JSON.stringify({
      type: "BINGO_ERROR",
      message: "Bu lobide aktif bir oyun devam ediyor. Lütfen oyunun bitmesini bekleyin veya başka bir lobiye katılın."
    }));
  }

  if (game.players[ws.userId]) {
    const player = game.players[ws.userId];
    player.ws = ws; 
    player.userName = userInfo.username;
    player.name = userInfo.name;

    const hasCompleted = player.completedBingo || false;

    return ws.send(JSON.stringify({
      type: "BINGO_JOIN", 
      message: "Oyuna başarıyla yeniden bağlandınız.",
      ticket: player.ticket,
      markedNumbers: player.markedNumbers || [],
      isHost: game.host === ws.userId,
      players: Object.values(game.players).map(p => ({
           id: p.userId,
           userName: p.userName,
           name: p.name,
           completed: p.completedBingo || false
       })),
      gameStarted: game.gameStarted,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers,
      drawMode: game.drawMode,
      drawer: game.drawer,
      completedBingo: hasCompleted,
      completedPlayers: getCompletedPlayersList(game),
      bingoMode: game.bingoMode,
      competitionMode: game.competitionMode,
      gameId: game.gameId,
      rankings: game.rankings || (game.gameStarted ? getGameRankings(game) : []), 
    }));
  }

  const ticket = generateTicket();
  game.players[ws.userId] = {
    ticket,
    ws,
    markedNumbers: [],
    userName: userInfo.username,
    name: userInfo.name,
    userId: ws.userId,
    completedBingo: false
  };

  broadcastToGame(game, {
    type: "BINGO_PLAYER_JOINED",
    player: {
      id: ws.userId,
      name: userInfo.name,
      userName: userInfo.username
    }
  });

  ws.send(JSON.stringify({
    type: "BINGO_JOIN",
    message: "Oyuna başarıyla katıldınız.",
    ticket,
    markedNumbers: [],
    isHost: game.host === ws.userId,
    players: Object.values(game.players).map(p => ({
        id: p.userId,
        userName: p.userName,
        name: p.name,
        completed: p.completedBingo || false
    })),
    gameStarted: game.gameStarted, 
    drawnNumbers: game.drawnNumbers, 
    activeNumbers: game.activeNumbers, 
    drawMode: game.drawMode,
    drawer: game.drawer,
    userInfo: { 
      name: userInfo.name,
      userName: userInfo.username
    },
    completedBingo: false,
    completedPlayers: getCompletedPlayersList(game), 
    bingoMode: game.bingoMode, 
    competitionMode: game.competitionMode, 
    gameId: game.gameId, 
    rankings: game.rankings || [], 
  }));
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

  if (!player.markedNumbers.includes(number)) {
    player.markedNumbers.push(number);

    broadcastToGame(game, {
      type: "BINGO_NUMBER_MARKED",
      playerId: ws.userId,
      number,
      markedNumbers: player.markedNumbers
    });
  }
};

// Yardımcı fonksiyon: Oyun istatistiklerini MongoDB'ye kaydeder
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

    const playersForDB = Object.values(game.players).map(player => ({
      playerId: player.userId,
      userName: player.userName,
      score: calculatePlayerScore(player, game.drawnNumbers),
      ticket: player.ticket,
      completedAt: player.completedAt,
      finalRank: player.finalRank
    }));

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

function getCompletedPlayersList(game) {
  if (!game || !game.players) {
      return [];
  }
  return Object.entries(game.players)
      .filter(([, player]) => player && player.completedAt)
      .map(([id, player]) => ({
          id: id, 
          userId: player.userId, 
          userName: player.userName
      }));
}


export const checkBingo = (ws, data) => {
  const { lobbyCode } = data;
  const game = bingoGames[lobbyCode];

  if (!game) {
      console.error(`checkBingo Hatası: ${lobbyCode} için oyun bulunamadı.`);
      return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Oyun bulunamadı." }));
  }

  if (!game.gameStarted) {
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
       // İsteğe bağlı olarak tekrar Bingo yapmaya çalışanlara hata yerine mevcut durumu gönderebilirsiniz.
       // Örneğin, kişisel sıralama bilgisi tekrar gönderilebilir.
       // Şimdilik geçersiz sayıyoruz:
       return ws.send(JSON.stringify({ type: "BINGO_INVALID", message: "Zaten Bingo yaptınız." }));
  }

  const { ticket } = player;

  if (!Array.isArray(ticket) || ticket.length === 0) {
      console.error(`checkBingo Hatası: Oyuncu (${player.userName}) için bilet geçersiz.`);
      return ws.send(JSON.stringify({ type: "BINGO_ERROR", message: "Bilet bilgisi geçersiz." }));
  }
  if (!Array.isArray(game.drawnNumbers)) {
       console.error(`checkBingo Hatası: ${lobbyCode} için çekilen sayılar listesi geçersiz.`);
       game.drawnNumbers = []; // Güvenlik için boş dizi ata
  }
   if (!Array.isArray(player.markedNumbers)) {
       player.markedNumbers = [];
       console.warn(`checkBingo Uyarısı: Oyuncu (${player.userName}) için işaretlenen sayılar listesi yoktu, oluşturuldu.`);
  }

  const isAllTicketNumbersDrawn = ticket.every((num) => game.drawnNumbers.includes(num));
  const isAllTicketNumbersMarked = ticket.every(num => player.markedNumbers.includes(num));

  if (isAllTicketNumbersDrawn && isAllTicketNumbersMarked) {
      if (!player.completedAt) {
          player.completedAt = Date.now();
          player.completedBingo = true;
      }

      const currentRankings = getGameRankings(game);
      const playerRankInfo = currentRankings.find(r => r.playerId === ws.userId);
      const playerRank = playerRankInfo ? playerRankInfo.rank : null;

      const currentCompletedPlayers = getCompletedPlayersList(game);

      const numberOfPlayers = Object.keys(game.players).length;
      const allNumbersDrawn = game.numberPool && game.numberPool.length === 0;
      const allPlayersCompleted = currentCompletedPlayers.length === numberOfPlayers;

      let shouldGameEnd = false;
      let gameOverReason = "";

      if (game.competitionMode === 'non-competitive') {
          shouldGameEnd = true;
          gameOverReason = `${player.userName} BINGO! Oyunu Kazandı!`;
      } else {
          if (numberOfPlayers <= 2) {
              shouldGameEnd = true;
              gameOverReason = "Oyun Bitti - Final Sıralaması";
          } else if (allPlayersCompleted) {
              shouldGameEnd = true;
              gameOverReason = "Oyun Bitti - Tüm Oyuncular Tamamladı";
          } else if (allNumbersDrawn) {
              shouldGameEnd = true;
              gameOverReason = "Oyun Bitti - Tüm Numaralar Çekildi";
          }
      }

      if (shouldGameEnd) {
          game.gameEnded = true;
          game.gameStarted = false;
          if (game.autoDrawInterval) {
              clearInterval(game.autoDrawInterval);
              game.autoDrawInterval = null;
          }

          const finalRankings = getGameRankings(game);
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: gameOverReason,
              finalRankings: finalRankings,
              gameId: game.gameId,
              completedPlayers: currentCompletedPlayers
          });
          saveGameStatsToDB(game).catch(err => console.error("saveGameStatsToDB Hatası (Oyun Sonu):", err));

      } else {
          broadcastToGame(game, {
              type: "BINGO_CALL_SUCCESS",
              playerId: ws.userId,
              playerName: player.userName,
              rank: playerRank,
              rankings: currentRankings,
              gameEnded: false,
              gameId: game.gameId,
              completedPlayers: currentCompletedPlayers
          });
      }

  } else {
      let invalidReason = "Geçersiz Bingo çağrısı.";
      if (!isAllTicketNumbersDrawn) {
          invalidReason = "Biletinizdeki tüm numaralar henüz çekilmedi.";
      } else if (!isAllTicketNumbersMarked) {
          invalidReason = "Biletinizdeki tüm numaraları işaretlemediniz.";
      }

      ws.send(JSON.stringify({
          type: "BINGO_INVALID",
          message: invalidReason
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
    // Tüm oyunları çekiyoruz.
    const games = await BingoGame.find({});


    // Oyunları oynanma tarihine göre artan sıralıyoruz.
    games.sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt)); // Directly sort games

    // Her oyuncunun kümülatif istatistiklerini tutacak nesne.
    const cumulativeStats = {};
    // Her oyuna ait oyuncu istatistiklerinin tutulacağı dizi.
    const detailedStats = [];

    games.forEach(game => { // Directly forEach over games
      const gameTime = game.startedAt;
      // Her oyunda yer alan oyuncular için:
      game.players.forEach(player => {
        const id = player.playerId;
        const userName = player.userName;

        // İlk defa karşılaşıyorsak oyuncu için kümülatif bilgileri initialize ediyoruz.
        if (!cumulativeStats[id]) {
          cumulativeStats[id] = {
            totalGames: 0,
            totalScore: 0,
            wins: 0,
            userName: userName
          };
        }

        // Oyun bazında kümülatif istatistikleri güncelliyoruz.
        cumulativeStats[id].totalGames += 1;
        cumulativeStats[id].totalScore += player.score;
        if (player.finalRank === 1) {
          cumulativeStats[id].wins += 1;
        }

        // O ana kadar alınan ortalama puanı hesaplıyoruz.
        const averageScore =
          cumulativeStats[id].totalScore / cumulativeStats[id].totalGames;

        const rank = player.finalRank === 1 ? 1 : player.finalRank;
        const isWinForGame = rank === 1;

        // Her oyun için detaylı istatistik kaydını oluşturuyoruz.
        detailedStats.push({
          gameId: game.gameId,
          playerId: id,
          userName: userName || cumulativeStats[id].userName || 'Unknown Player',
          score: player.score,
          averageScore: averageScore,
          wins: cumulativeStats[id].wins,
          rank: rank,
          gameTime: gameTime,
          isWin: isWinForGame,
        });
      });
    });

    res.json({ playerGameStats: detailedStats });
  } catch (error) {
    console.error("Error aggregating detailed player stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};