import Lobby from "../models/lobby.model.js"; // Lobby modelini import et
import { BingoGame } from '../models/bingo.game.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose'; // bingo.game.controller.js dosyasının başında
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
      userName: player.userName, // Use stored userName,
      score: calculatePlayerScore(player, game.drawnNumbers),
      completedAt: player.completedAt || null
    }))
    .sort((a, b) => {
      // First sort by score (descending)
      if (b.score !== a.score) return b.score - a.score;
      // Then by completion time if available (ascending)
      if (a.completedAt && b.completedAt) return a.completedAt - b.completedAt;
      // Completed players come before incomplete ones
      if (a.completedAt) return -1;
      if (b.completedAt) return 1;
      return 0;
    });

  return rankings;
}
/**
 * Yardımcı: Belirtilen oyundaki tüm oyunculara mesaj gönderir.
 */
function broadcastToGame(game, data) {
  const message = JSON.stringify(data);
  Object.values(game.players).forEach((player) => {
    if (player.ws.readyState === player.ws.OPEN) {
      player.ws.send(message, (err) => {
        if (err) console.error("Bingo mesaj gönderme hatası:", err);
      });
    }
  });
}
// autoDrawNumber ve drawNumber fonksiyonlarına ekleme
function broadcastGameStatus(game) {
  // Tamamlayan oyuncuların listesini oluştur
  const completedPlayers = Object.entries(game.players)
    .filter(([, player]) => player.completedAt)
    .map(([id, player]) => ({
      id: id,
      userName: player.userName // Include userName
    }));

  // Güncel oyun durumunu gönder
  broadcastToGame(game, {
    type: "BINGO_GAME_STATUS",
    completedPlayers: completedPlayers
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
      saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
      game.gameStarted = false;
      clearInterval(game.autoDrawInterval); // Clear interval when no numbers left
      return;
  }

  const number = game.numberPool.shift();
  game.drawnNumbers.push(number);
  game.activeNumbers.push(number);

  broadcastToGame(game, {
      type: "BINGO_NUMBER_DRAWN",
      number,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers
  });

  setTimeout(() => {
      game.activeNumbers = game.activeNumbers.filter(n => n !== number);
      broadcastToGame(game, {
          type: "BINGO_NUMBER_CLEAR",
          clearedNumber: number,
          activeNumbers: game.activeNumbers
      });

         // Oyun durumunu yayınla
    broadcastGameStatus(game);

      // Check for game end condition after drawing each number in auto mode
      const completedPlayersCount = getGameRankings(game).filter(r => r.completedAt).length;
      const allPlayersCompleted = completedPlayersCount === Object.keys(game.players).length;

      if (allPlayersCompleted && !game.gameEnded) {
          const rankings = getGameRankings(game);
          game.gameEnded = true;
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: "All players completed - Final Rankings",
              finalRankings: rankings
          });
          saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
          clearInterval(game.autoDrawInterval); // Clear interval when all players completed
      } else if (game.numberPool.length === 0 && !game.gameEnded) { // Double check after timeout too if numbers finished during timeout
          const rankings = getGameRankings(game);
          game.gameEnded = true;
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: "All numbers drawn - Final Rankings",
              finalRankings: rankings
          });
          saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
          clearInterval(game.autoDrawInterval); // Clear interval if numbers finished during timeout
      }


  }, 5000);
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
  game.activeNumbers.push(number);

  broadcastToGame(game, {
      type: "BINGO_NUMBER_DRAWN",
      number,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers,
  });

  setTimeout(() => {
      game.activeNumbers = game.activeNumbers.filter(n => n !== number);
      broadcastToGame(game, {
          type: "BINGO_NUMBER_CLEAR",
          clearedNumber: number,
          activeNumbers: game.activeNumbers,
      });
       // Check for game end condition after manual draw
       const completedPlayersCount = getGameRankings(game).filter(r => r.completedAt).length;
       const allPlayersCompleted = completedPlayersCount === Object.keys(game.players).length;

       if (allPlayersCompleted && !game.gameEnded) {
           const rankings = getGameRankings(game);
           game.gameEnded = true;
           broadcastToGame(game, {
               type: "BINGO_GAME_OVER",
               message: "All players completed - Final Rankings",
               finalRankings: rankings
           });
           saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
           game.gameStarted = false; //  <----- ADD THIS LINE HERE
       } else if (game.numberPool.length === 0 && !game.gameEnded) { // Double check after timeout too if numbers finished during timeout
           const rankings = getGameRankings(game);
           game.gameEnded = true;
           broadcastToGame(game, {
               type: "BINGO_GAME_OVER",
               message: "All numbers drawn - Final Rankings",
               finalRankings: rankings
           });
           saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
           game.gameStarted = false; //  <----- ADD THIS LINE HERE
       }
  }, 5000);
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
        message: "Lobby kodu belirtilmedi.",
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
        message: "Lobby bulunamadı.",
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

  // Handle reconnection with updated user info
  if (game.players[ws.userId]) {
    const player = game.players[ws.userId];
    player.ws = ws;
    player.userName = userInfo.username;
    player.name = userInfo.name;

    return ws.send(JSON.stringify({
      type: "BINGO_JOIN",
      message: "Already in game",
      ticket: player.ticket,
      markedNumbers: player.markedNumbers || [],
      isHost: game.host === ws.userId,
      players: Object.keys(game.players),
      gameStarted: game.gameStarted,
      drawnNumbers: game.drawnNumbers,
      activeNumbers: game.activeNumbers,
      drawMode: game.drawMode,
      drawer: game.drawer
    }));
  }

  // Add new player with proper user info
  const ticket = generateTicket();
  game.players[ws.userId] = {
    ticket,
    ws,
    markedNumbers: [],
    userName: userInfo.username,
    name: userInfo.name,
    userId: ws.userId
  };

  // Broadcast new player joined with proper user info
  broadcastToGame(game, {
    type: "BINGO_PLAYER_JOINED",
    player: {
      id: ws.userId,
      name: userInfo.name,
      userName: userInfo.username
    }
  });

  // Send join confirmation with all necessary data
  ws.send(JSON.stringify({
    type: "BINGO_JOIN",
    message: "Joined the game",
    ticket,
    markedNumbers: [],
    isHost: game.host === ws.userId,
    players: Object.keys(game.players),
    gameStarted: game.gameStarted,
    drawnNumbers: game.drawnNumbers,
    activeNumbers: game.activeNumbers,
    drawMode: game.drawMode,
    drawer: game.drawer,
    userInfo: {
      name: userInfo.name,
      userName: userInfo.username
    },
    completedBingo: false, // Oyuncu henüz bingo yapmadı
    completedPlayers: Object.entries(game.players)
      .filter(([id, player]) => player.completedAt)
      .map(([id]) => id) // Tamamlayan oyuncuların ID'lerini gönder
  }));
};

// Yeni fonksiyon: Numaraları işaretleme
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

  // Numarayı oyuncunun işaretlediği numaralar listesine ekle
  if (!player.markedNumbers.includes(number)) {
    player.markedNumbers.push(number);

    // Broadcast the marked number to all players
    broadcastToGame(game, {
      type: "BINGO_NUMBER_MARKED",
      playerId: ws.userId,
      number,
      markedNumbers: player.markedNumbers
    });
  }
};
/**
 * Oyunu başlatma: Genellikle host tarafından tetiklenir.
 * Beklenen data örneği: { lobbyCode: "ABC123" }
 */
export const startGame = (ws, data) => {
  const { lobbyCode, drawMode, drawer } = data;
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

   // **Yeni oyun başlamadan önce oyun verilerini sıfırla**
   game.drawnNumbers = [];
   game.activeNumbers = [];
   game.numberPool = generateShuffledNumbers(1, 90); // Yeni numara havuzu oluştur
   game.gameEnded = false;
   game.gameStarted = false; // Garanti olsun diye tekrar false olarak ayarla
   game.gameId = new mongoose.Types.ObjectId(); // Her yeni oyun başladığında yeni gameId oluşturulur

   if (game.autoDrawInterval) {
    clearInterval(game.autoDrawInterval); // Önceki interval'ı temizle
    game.autoDrawInterval = null; // Interval referansını sıfırla
  }

  // **Oyuncuların işaretli numaralarını ve biletlerini sıfırla - EKLE**
  for (const playerId in game.players) {
    game.players[playerId].markedNumbers = [];
    game.players[playerId].ticket = generateTicket(); // **Yeni bilet oluştur**
    delete game.players[playerId].completedAt; // Reset completedAt status
    delete game.players[playerId].completedBingo; // Reset completedBingo status
  }
  // Seçilen çekim modunu ve (manuel ise) çekici oyuncuyu kaydediyoruz.
  game.drawMode = drawMode; // "auto" veya "manual"
  if (drawMode === "manual") {
    game.drawer = drawer; // seçilen oyuncu ID'si
  }

  // 5 saniyelik geri sayım
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
        gameId: game.gameId, // Başlangıç mesajına gameId eklendi
        players: Object.keys(game.players).map(playerId => ({ // Yeni biletleri oyunculara gönder
          playerId: playerId,
          ticket: game.players[playerId].ticket
      }))
      });
      if (drawMode === "auto") {
        // Otomatik çekim interval'ı (5 saniyede bir)
        const autoDrawInterval = setInterval(() => {
          if (game.gameEnded) {
            clearInterval(autoDrawInterval);
            return;
          }
          autoDrawNumber(game);
        }, 5000);
        game.autoDrawInterval = autoDrawInterval;
      }
    }
  }, 1000);
};

/**
 * Bingo kontrolü: Oyuncu "BINGO" dediğinde, ticket’ındaki tüm numaraların
 * çekilmiş numaralar arasında olup olmadığını kontrol eder.
 * Beklenen data örneği: { lobbyCode: "ABC123" }
 **/

// bingo.game.controller.js dosyasına ekleyin

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
export const checkBingo = (ws, data) => {
  const { lobbyCode } = data;
  const game = bingoGames[lobbyCode];

  if (!game || !game.players[ws.userId]) {
      return ws.send(JSON.stringify({
          type: "BINGO_ERROR",
          message: "Invalid game or player"
      }));
  }

  const player = game.players[ws.userId];
  const { ticket } = player;

  // Check if all numbers in ticket are drawn
  const isAllTicketNumbersDrawn = ticket.every((num) => game.drawnNumbers.includes(num));

  // **Yeni Kontrol:** Check if all numbers in ticket are marked by the player
  const isAllTicketNumbersMarked = ticket.every(num => player.markedNumbers.includes(num));

  if (isAllTicketNumbersDrawn && isAllTicketNumbersMarked) { // **Kombine kontrol**
      // Record completion time if not already recorded
      if (!player.completedAt) {
          player.completedAt = Date.now();
          player.completedBingo = true; // Bingo tamamlandı işaretleme
      }

      // Calculate current rankings
      const rankings = getGameRankings(game);
      const playerRank = rankings.findIndex(r => r.playerId === ws.userId) + 1;

        // Tamamlayan oyuncuların listesini oluştur
        const completedPlayers = Object.entries(game.players)
  .filter(([, player]) => player.completedAt)
  .map(([id, player]) => ({
    id: id,
    userName: player.userName // Kullanıcı adını ekle
  }));
  console.log("checkBingo - completedPlayers:", completedPlayers);

      // Broadcast the bingo call and current rankings
      broadcastToGame(game, {
          type: "BINGO_CALL_SUCCESS",
          playerId: ws.userId,
          playerName: player.userName, // Use stored userName
          rank: playerRank,
          rankings: rankings,
          ticket: player.ticket,
          gameEnded: false, // Default olarak false, oyun henüz bitmedi
          completedPlayers: completedPlayers ,// Tamamlayan oyuncuların listesini gönder
          gameId: game.gameId // gameId eklendi
      });

      // Two player game scenario - end game immediately after first bingo
      if (Object.keys(game.players).length <= 2) {
          const finalRankings = getGameRankings(game);
          game.gameEnded = true;
          broadcastToGame(game, {
              type: "BINGO_GAME_OVER",
              message: "Game Over - Final Rankings",
              finalRankings: finalRankings,
              gameId: game.gameId // gameId eklendi
          });
          saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
      } else {
          // For 3+ players, check if all players have completed or numbers are finished
          const completedPlayersCount = rankings.filter(r => r.completedAt).length;
          const allNumbersDrawn = game.numberPool.length === 0;
          const allPlayersCompleted = completedPlayersCount === Object.keys(game.players).length;


          if (allNumbersDrawn || allPlayersCompleted) {
              const finalRankings = getGameRankings(game);
              game.gameEnded = true;
              broadcastToGame(game, {
                  type: "BINGO_GAME_OVER",
                  message: "Game Over - Final Rankings",
                  finalRankings: finalRankings,
                  gameId: game.gameId // gameId eklendi
              });
              saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
          } else if (completedPlayersCount === 1) {
              // First bingo in a multi-player game, update rankings but game continues
              broadcastToGame(game, {
                  type: "BINGO_CALL_SUCCESS",
                  playerId: ws.userId,
                  playerName: player.userName,
                  rank: playerRank,
                  rankings: rankings,
                  ticket: player.ticket,
                  gameEnded: false ,// Oyun devam ediyor
                  gameId: game.gameId ,// gameId eklendi
              });
          } else {
               // Subsequent bingo calls in multi-player, update rankings and check game end again if needed.
               broadcastToGame(game, {
                  type: "BINGO_CALL_SUCCESS",
                  playerId: ws.userId,
                  playerName: player.userName,
                  rank: playerRank,
                  rankings: rankings,
                  ticket: player.ticket,
                  gameEnded: false ,// Oyun devam ediyor
                  gameId: game.gameId // gameId eklendi
              });
               const completedPlayersCountAfterCall = rankings.filter(r => r.completedAt).length;
               const allPlayersCompletedAfterCall = completedPlayersCountAfterCall === Object.keys(game.players).length;
               if(allPlayersCompletedAfterCall) {
                  const finalRankings = getGameRankings(game);
                  game.gameEnded = true;
                  broadcastToGame(game, {
                      type: "BINGO_GAME_OVER",
                      message: "Game Over - Final Rankings",
                      finalRankings: finalRankings,
                      gameId: game.gameId // gameId eklendi
                  });
                  saveGameStatsToDB(game); // <--- BURAYA EKLEDİ
               }
          }
      }


  } else {
      ws.send(JSON.stringify({
          type: "BINGO_INVALID",
          message: "Invalid bingo call - Biletindeki tüm numaraları işaretlemelisin." // Updated message
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

export const getPlayerStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all games where this user was a player
    const games = await BingoGame.find({ "players.playerId": userId });

    let totalGames = games.length;
    let wins = 0;
    let totalScore = 0;

    const gamesDetails = games.map(game => {
      const playerInfo = game.players.find(p => p.playerId === userId);
      let isWin = false;
      if (playerInfo && playerInfo.finalRank === 1) {
        wins++;
        isWin = true;
      }
      totalScore += playerInfo ? playerInfo.score : 0;

      let duration = null;
      if (game.startedAt && game.endedAt) {
        duration = game.endedAt.getTime() - game.startedAt.getTime(); // Duration in milliseconds
      }

      return {
        gameId: game.gameId,
        lobbyCode: game.lobbyCode,
        startedAt: game.startedAt,
        endedAt: game.endedAt,
        duration: duration, // Oyun süresini ekle
        score: playerInfo ? playerInfo.score : 0,
        finalRank: playerInfo ? playerInfo.finalRank : null,
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
    console.error('Error fetching player stats:', error);
    res.status(500).json({ message: 'Internal server error' });
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
