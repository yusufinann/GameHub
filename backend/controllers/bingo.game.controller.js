import Lobby from "../models/lobby.model.js";
import mongoose from "mongoose";
import { BingoGame } from "../models/bingo.game.model.js";
import { shuffleArray } from "../utils/arrayUtils.js";
import { generateShuffledNumbers } from "../utils/numberUtils.js";
import { formatMillisecondsToHHMMSS } from "../utils/timeUtils.js";
import { getUserDetails } from "../services/userService.js";
import {
  generateBingoTicket,
  getCompletedPlayersList,
  getGameRankings,
  saveGameStatsToDB,
} from "../game_logic/bingo/bingoRules.js";
import {
  saveGameToRedis,getGameFromRedis,deleteBingoGameStateFromRedis 
} from "../game_logic/bingo/bingoStateManager.js";
import { PLAYER_COLORS } from "../game_logic/bingo/bingoConstants.js";

const activePlayerSockets = {};
const gameIntervals = {};


/**
 * Bingo oyununa ait tüm kaynakları (interval'lar, soketler) temizler
 * ve oyun durumunu Redis'ten siler.
 * @param {string} lobbyCode
 */
export async function cleanupAndRemoveBingoGame(lobbyCode) {
  if (typeof lobbyCode !== "string") {
    console.error(
      `[cleanupAndRemoveBingoGame] Invalid lobbyCode type: ${typeof lobbyCode}`,
      lobbyCode
    );
    return;
  }

  console.log(`[BingoController] Initiating cleanup for lobby: ${lobbyCode}`);

  if (gameIntervals[lobbyCode]) {
    const intervalId = gameIntervals[lobbyCode];
    clearInterval(intervalId);
    clearTimeout(intervalId); 
    delete gameIntervals[lobbyCode];
    console.log(`[BingoController] Main game interval for lobby ${lobbyCode} cleared.`);
  }

  const countdownIntervalIdKey = `countdown_${lobbyCode}`;
  if (gameIntervals[countdownIntervalIdKey]) {
    const countdownIntervalId = gameIntervals[countdownIntervalIdKey];
    clearInterval(countdownIntervalId);
    delete gameIntervals[countdownIntervalIdKey];
    console.log(`[BingoController] Countdown interval for lobby ${lobbyCode} cleared.`);
  }

  if (activePlayerSockets[lobbyCode]) {
    delete activePlayerSockets[lobbyCode];
    console.log(`[BingoController] Active player sockets for lobby ${lobbyCode} cleared from controller's map.`);
  }

  await deleteBingoGameStateFromRedis(lobbyCode);

  console.log(`[BingoController] Cleanup and removal for lobby ${lobbyCode} completed.`);
}

export function broadcastToGame(game, data) {
  if (!game || !game.lobbyCode) {
    console.error(
      "broadcastToGame: Yayın için geçersiz oyun nesnesi veya lobbyCode eksik.",
      game
    );
    return;
  }
  const lobbyCode = game.lobbyCode;
  const messageData = { ...data, lobbyCode: lobbyCode };
  const message = JSON.stringify(messageData);

  const playerSocketsInLobby = activePlayerSockets[lobbyCode];
  if (!playerSocketsInLobby) {
    return;
  }

  Object.keys(game.players).forEach((playerId) => {
    const playerSocket = playerSocketsInLobby[playerId];
    if (playerSocket && playerSocket.readyState === playerSocket.OPEN) {
      try {
        playerSocket.send(message);
      } catch (err) {
        console.error(
          `Bingo mesaj gönderme hatası (oyuncu ${playerId}, lobi ${lobbyCode}):`,
          err
        );
      }
    }
  });
}

function broadcastGameStatus(game) {
  const completedPlayersList = getCompletedPlayersList(game);
  broadcastToGame(game, {
    type: "BINGO_GAME_STATUS",
    completedPlayers: completedPlayersList,
  });
}

export async function autoDrawNumber(lobbyCode) {
  if (typeof lobbyCode !== "string") {
    console.error(`[AutoDraw] Invalid lobbyCode type: ${typeof lobbyCode}. Aborting auto-draw.`);
    return;
  }
  let game = await getGameFromRedis(lobbyCode);
  if (gameIntervals[lobbyCode] && (!game || game.gameEnded || !game.gameStarted || game.drawMode !== "auto")) {
    clearTimeout(gameIntervals[lobbyCode]);
    delete gameIntervals[lobbyCode];
  }

  if (!game || !game.gameStarted || game.gameEnded || game.drawMode !== "auto") {
    if (gameIntervals[lobbyCode]) {
      clearTimeout(gameIntervals[lobbyCode]);
      delete gameIntervals[lobbyCode];
    }
    if (game && game.nextDrawTimestamp) {
        delete game.nextDrawTimestamp;
        await saveGameToRedis(lobbyCode, game);
    }
    return;
  }

  if (game.numberPool.length === 0) {
    const rankings = getGameRankings(game); 
    game.gameEnded = true;
    game.gameStarted = false;
    game.rankings = rankings;
    delete game.nextDrawTimestamp; 
    broadcastToGame(game, { 
      type: "BINGO_GAME_OVER",
      message: "All numbers drawn - Final Rankings",
      finalRankings: rankings,
    });
    await saveGameStatsToDB(game); 
    if (gameIntervals[lobbyCode]) {
      clearTimeout(gameIntervals[lobbyCode]);
      delete gameIntervals[lobbyCode];
    }
    await saveGameToRedis(lobbyCode, game);
    return;
  }

  const number = game.numberPool.shift();
  game.drawnNumbers.push(number);
  game.lastDrawTime = new Date();

  let activeNumberTotalDuration = 5000;
  if (game.bingoMode === "extended") activeNumberTotalDuration = 10000;
  else if (game.bingoMode === "superfast") activeNumberTotalDuration = 3000;

  game.activeNumbers = [number];
  delete game.nextDrawTimestamp; 
                                
  await saveGameToRedis(lobbyCode, game); 

  broadcastToGame(game, {
    type: "BINGO_NUMBER_DRAWN",
    number,
    activeNumbers: game.activeNumbers,
  });

  setTimeout(async () => {
    let currentGameInTimeout = await getGameFromRedis(lobbyCode);
    if (!currentGameInTimeout || currentGameInTimeout.gameEnded || !currentGameInTimeout.activeNumbers || !currentGameInTimeout.activeNumbers.includes(number)) {
      if (currentGameInTimeout && currentGameInTimeout.gameEnded && gameIntervals[lobbyCode]) {
        clearTimeout(gameIntervals[lobbyCode]);
        delete gameIntervals[lobbyCode];
        if (currentGameInTimeout.nextDrawTimestamp) {
            delete currentGameInTimeout.nextDrawTimestamp;
            await saveGameToRedis(lobbyCode, currentGameInTimeout);
        }
      }
      return;
    }

    const clearedNumberValue = number;
    currentGameInTimeout.activeNumbers = [];
    await saveGameToRedis(lobbyCode, currentGameInTimeout); 

    broadcastToGame(currentGameInTimeout, {
      type: "BINGO_NUMBER_CLEAR",
      clearedNumber: clearedNumberValue,
      activeNumbers: currentGameInTimeout.activeNumbers,
    });


    const completedPlayersList = getCompletedPlayersList(currentGameInTimeout); 
    broadcastToGame(currentGameInTimeout, {
        type: "BINGO_GAME_STATUS",
        completedPlayers: completedPlayersList,
    });


    const rankingsAfterClear = getGameRankings(currentGameInTimeout);
    const completedPlayersCount = rankingsAfterClear.filter((r) => r.completedAt).length;
    const allPlayersInGame = Object.keys(currentGameInTimeout.players).length;

    let gameShouldEnd = false;
    let gameOverReason = "";

    if (allPlayersInGame > 0 && completedPlayersCount === allPlayersInGame && !currentGameInTimeout.gameEnded) {
      gameShouldEnd = true;
      gameOverReason = "All players completed - Final Rankings";
    } else if (currentGameInTimeout.numberPool.length === 0 && !currentGameInTimeout.gameEnded) {
      gameShouldEnd = true;
      gameOverReason = "All numbers drawn - Final Rankings";
    }

    if (gameShouldEnd) {
      currentGameInTimeout.gameEnded = true;
      currentGameInTimeout.gameStarted = false;
      currentGameInTimeout.rankings = rankingsAfterClear;
      delete currentGameInTimeout.nextDrawTimestamp;
      broadcastToGame(currentGameInTimeout, {
        type: "BINGO_GAME_OVER",
        message: gameOverReason,
        finalRankings: rankingsAfterClear,
      });
      await saveGameStatsToDB(currentGameInTimeout);
      if (gameIntervals[lobbyCode]) {
        clearTimeout(gameIntervals[lobbyCode]);
        delete gameIntervals[lobbyCode];
      }
    }
    await saveGameToRedis(lobbyCode, currentGameInTimeout);
  }, activeNumberTotalDuration);

  let nextDrawDelay = 5000;
  if (game.bingoMode === "superfast") nextDrawDelay = 3000;
  else if (game.bingoMode === "extended") nextDrawDelay = 10000;

  const gameForScheduling = await getGameFromRedis(lobbyCode);
  if (gameForScheduling && gameForScheduling.gameStarted && !gameForScheduling.gameEnded && gameForScheduling.drawMode === "auto") {
      gameForScheduling.nextDrawTimestamp = Date.now() + nextDrawDelay;
      await saveGameToRedis(lobbyCode, gameForScheduling);

      if (gameIntervals[lobbyCode]) {
          clearTimeout(gameIntervals[lobbyCode]);
      }

      gameIntervals[lobbyCode] = setTimeout(async () => {
          const gameForNextDrawAttempt = await getGameFromRedis(lobbyCode);
          autoDrawNumber(lobbyCode);
      }, nextDrawDelay);
  } else {
      if (gameIntervals[lobbyCode]) {
          clearTimeout(gameIntervals[lobbyCode]);
          delete gameIntervals[lobbyCode];
      }
   
      if (gameForScheduling && gameForScheduling.nextDrawTimestamp) {
          delete gameForScheduling.nextDrawTimestamp;
          await saveGameToRedis(lobbyCode, gameForScheduling);
      }
  }
}

export async function restoreActiveBingoTimers(redisClientInstance) {
  console.log("[BingoController] Restoring active Bingo game timers (SLOW CONTINUE STRATEGY)...");
  try {
    const keyPattern = "bingo:game:*"; 
    const gameKeys = await redisClientInstance.keys(keyPattern);

    if (!gameKeys || gameKeys.length === 0) {
      console.log("[RestoreTimers] No active game keys found in Redis matching pattern.");
      return;
    }


    for (const fullKey of gameKeys) {
      const lobbyCodePrefix = "bingo:game:"; 
      const lobbyCode = fullKey.startsWith(lobbyCodePrefix) ? fullKey.substring(lobbyCodePrefix.length) : null;
      
      if (!lobbyCode) {
        console.warn(`[RestoreTimers] Could not extract lobbyCode from key: ${fullKey}. Skipping.`);
        continue;
      }

      let game = await getGameFromRedis(lobbyCode);
      if (!game) {
        console.log(`[RestoreTimers] Game data for ${lobbyCode}: Not Found in Redis. Skipping.`);
        continue;
      }

      const oldTimestampLog = game.nextDrawTimestamp ? new Date(game.nextDrawTimestamp).toISOString() : 'N/A';
     
      if (game.gameStarted && !game.gameEnded && game.drawMode === "auto") {
        console.log(`[RestoreTimers] Game ${lobbyCode}: Active and auto mode. Applying SLOW CONTINUE.`);
        
        let nextDrawDelayNormal = 5000; 
        if (game.bingoMode === "superfast") nextDrawDelayNormal = 3000;
        else if (game.bingoMode === "extended") nextDrawDelayNormal = 10000;

        if (game.nextDrawTimestamp) {
            console.log(`[RestoreTimers] Game ${lobbyCode}: Clearing obsolete nextDrawTimestamp (${oldTimestampLog}).`);
            delete game.nextDrawTimestamp;
            await saveGameToRedis(lobbyCode, game); 
        }
        
        console.log(`[RestoreTimers] Game ${lobbyCode}: Scheduling first draw with delay: ${nextDrawDelayNormal}ms.`);
        
        if (gameIntervals[lobbyCode]) {
            clearTimeout(gameIntervals[lobbyCode]);
            delete gameIntervals[lobbyCode];
        }
        
        gameIntervals[lobbyCode] = setTimeout(async () => {
          console.log(`[RestoreTimers] Timeout triggered for ${lobbyCode}. Calling autoDrawNumber.`);
          autoDrawNumber(lobbyCode); 
        }, nextDrawDelayNormal); 

      } else if (game.nextDrawTimestamp) {
        console.log(`[RestoreTimers] Game ${lobbyCode}: Has nextDrawTimestamp but not eligible for auto-restore. Clearing timestamp.`);
        delete game.nextDrawTimestamp;
        await saveGameToRedis(lobbyCode, game);
      } else {
        // console.log(`[RestoreTimers] Game ${lobbyCode}: Not eligible for timer restore or no timestamp to clear.`); 
      }
    }
  } catch (error) {
    console.error("[BingoController] Critical error during restoreActiveBingoTimers:", error);
  }
}
export const drawNumber = async (ws, data) => {
  const { lobbyCode } = data;
  let game = await getGameFromRedis(lobbyCode);

  if (!game) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Bingo oyunu bulunamadı.",
      })
    );
  }
  if (game.gameEnded) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Oyun zaten bitti. Yeni sayı çekilemez.",
      })
    );
  }
  if (!game.gameStarted) {
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Oyun henüz başlamadı." })
    );
  }
  if (game.drawMode !== "manual" || String(game.drawer) !== String(ws.userId)) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Sadece seçilen oyuncu sayı çekebilir.",
      })
    );
  }

  if (
    game.activeNumbers &&
    game.activeNumbers.length > 0 &&
    game.lastDrawTime
  ) {
    const now = Date.now();
    let minInterval = 5000;
    if (game.bingoMode === "extended") minInterval = 10000;
    else if (game.bingoMode === "superfast") minInterval = 3000;

    if (now - new Date(game.lastDrawTime).getTime() < minInterval) {
      return ws.send(
        JSON.stringify({
          type: "BINGO_ERROR",
          message: `Yeni sayı çekmek için ${
            minInterval / 1000
          } saniye beklemelisiniz.`,
        })
      );
    }
  }

  if (game.numberPool.length === 0) {
    const rankings = getGameRankings(game);
    game.gameEnded = true;
    game.gameStarted = false;
    game.rankings = rankings;
    broadcastToGame(game, {
      type: "BINGO_GAME_OVER",
      message: "Tüm numaralar çekildi.",
      finalRankings: rankings,
    });
    await saveGameStatsToDB(game);
    await saveGameToRedis(lobbyCode, game);
    return;
  }

  const number = game.numberPool.shift();
  game.drawnNumbers.push(number);
  game.lastDrawTime = new Date();

  let activeNumberTotalDuration = 5000;
  if (game.bingoMode === "extended") activeNumberTotalDuration = 10000;
  else if (game.bingoMode === "superfast") activeNumberTotalDuration = 3000;

  game.activeNumbers = [number];
  broadcastToGame(game, {
    type: "BINGO_NUMBER_DRAWN",
    number,
    activeNumbers: game.activeNumbers,
  });
  await saveGameToRedis(lobbyCode, game);

  setTimeout(async () => {
    let currentGame = await getGameFromRedis(lobbyCode);
    if (
      !currentGame ||
      currentGame.gameEnded ||
      !currentGame.activeNumbers ||
      !currentGame.activeNumbers.includes(number)
    ) {
      return;
    }
    const clearedNumberValue = number;
    currentGame.activeNumbers = [];
    broadcastToGame(currentGame, {
      type: "BINGO_NUMBER_CLEAR",
      clearedNumber: clearedNumberValue,
      activeNumbers: currentGame.activeNumbers,
    });

    broadcastGameStatus(currentGame);

    const rankingsAfterClear = getGameRankings(currentGame);
    const completedPlayersCount = rankingsAfterClear.filter(
      (r) => r.completedAt
    ).length;
    const allPlayersInGame = Object.keys(currentGame.players).length;

    let gameShouldEnd = false;
    let gameOverReason = "";

    if (
      allPlayersInGame > 0 &&
      completedPlayersCount === allPlayersInGame &&
      !currentGame.gameEnded
    ) {
      gameShouldEnd = true;
      gameOverReason = "All players completed - Final Rankings";
    } else if (currentGame.numberPool.length === 0 && !currentGame.gameEnded) {
      gameShouldEnd = true;
      gameOverReason = "All numbers drawn - Final Rankings";
    }

    if (gameShouldEnd) {
      currentGame.gameEnded = true;
      currentGame.gameStarted = false;
      currentGame.rankings = rankingsAfterClear;
      broadcastToGame(currentGame, {
        type: "BINGO_GAME_OVER",
        message: gameOverReason,
        finalRankings: rankingsAfterClear,
      });
      await saveGameStatsToDB(currentGame);
    }
    await saveGameToRedis(lobbyCode, currentGame);
  }, activeNumberTotalDuration);
};

export const startGame = async (ws, data) => {
  const { lobbyCode, drawMode, drawer, bingoMode, competitionMode } = data;
  let game = await getGameFromRedis(lobbyCode);

  if (!game) {
    console.warn(
      `[Bingo Server] Oyun başlatma hatası (${lobbyCode}): Redis'te oyun state'i bulunamadı.`
    );
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message:
          "Oyun başlatılamadı: Lobi bilgisi sunucuda mevcut değil veya hazır değil.",
      })
    );
  }
  if (String(game.host) !== String(ws.userId)) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        error: {
          key: "errors.hostOnlyStart",
          message: "Sadece host oyunu başlatabilir.",
        },
      })
    );
  }
  if (game.gameStarted && !game.gameEnded) {
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Oyun zaten başladı." })
    );
  }

  const playerSocketsInLobby = activePlayerSockets[lobbyCode] || {};
  const activePlayersForGame = {};
  Object.keys(game.players).forEach((playerId) => {
    if (playerSocketsInLobby[playerId]) {
      activePlayersForGame[playerId] = game.players[playerId];
    } else {
      console.log(
        `[startGame-${lobbyCode}] Player ${playerId} is in game.players but not in activePlayerSockets. Excluding from new game.`
      );
    }
  });

  if (Object.keys(activePlayersForGame).length === 0) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Oyunu başlatmak için en az bir aktif (bağlı) oyuncu olmalı.",
      })
    );
  }
  ws.send(
    JSON.stringify({
      type: "ACKNOWLEDGEMENT",
      messageType: "BINGO_START",
      timestamp: new Date().toISOString(),
    })
  );

  game.players = activePlayersForGame;
  game.drawnNumbers = [];
  game.activeNumbers = [];
  game.numberPool = generateShuffledNumbers(1, 90);
  game.gameEnded = false;
  game.gameStarted = false;
  game.drawMode = drawMode || "auto";
  game.drawer =
    game.drawMode === "manual" && game.players[drawer] ? drawer : null;
  game.bingoMode = bingoMode || "classic";
  game.gameId = new mongoose.Types.ObjectId();
  game.competitionMode = competitionMode || "competitive";
  game.rankings = [];
  game.startedAt = null;

  if (gameIntervals[lobbyCode]) {
    clearTimeout(gameIntervals[lobbyCode]);
    delete gameIntervals[lobbyCode];
  }
  const countdownIntervalId = `countdown_${lobbyCode}`;
  if (gameIntervals[countdownIntervalId]) {
    clearInterval(gameIntervals[countdownIntervalId]);
    delete gameIntervals[countdownIntervalId];
  }

  for (const playerId in game.players) {
    if (Object.prototype.hasOwnProperty.call(game.players, playerId)) {
      const player = game.players[playerId];
      player.markedNumbers = [];
      const ticketResult = generateBingoTicket();
      if (ticketResult.error) {
        console.error(
          `[startGame-${lobbyCode}] Failed to generate ticket for player ${playerId}: ${ticketResult.error}`
        );
        ws.send(
          JSON.stringify({
            type: "BINGO_ERROR",
            message: "Bilet oluşturulurken hata oluştu. Oyun başlatılamadı.",
          })
        );
        return;
      }
      player.ticket = ticketResult;
      delete player.completedAt;
      delete player.completedBingo;
    }
  }

  await saveGameToRedis(lobbyCode, game);

  let countdown = 5;
  gameIntervals[countdownIntervalId] = setInterval(async () => {
    const currentCountdownGame = await getGameFromRedis(lobbyCode);
    if (
      !currentCountdownGame ||
      currentCountdownGame.gameStarted ||
      currentCountdownGame.gameEnded
    ) {
      clearInterval(gameIntervals[countdownIntervalId]);
      delete gameIntervals[countdownIntervalId];
      console.log(
        `[Countdown-${lobbyCode}] Countdown stopped early. Game state: started=${currentCountdownGame?.gameStarted}, ended=${currentCountdownGame?.gameEnded}`
      );
      return;
    }

    broadcastToGame(currentCountdownGame, {
      type: "BINGO_COUNTDOWN",
      countdown,
    });
    countdown--;

    if (countdown < 0) {
      clearInterval(gameIntervals[countdownIntervalId]);
      delete gameIntervals[countdownIntervalId];

      let gameAtStart = await getGameFromRedis(lobbyCode);
      if (!gameAtStart || gameAtStart.gameStarted || gameAtStart.gameEnded) {
        console.log(
          `[Countdown-${lobbyCode}] Final check: Game already started/ended or removed. Aborting BINGO_STARTED.`
        );
        return;
      }

      gameAtStart.startedAt = new Date();
      gameAtStart.gameStarted = true;
      gameAtStart.gameEnded = false;

      const clientPlayers = Object.keys(gameAtStart.players).map((playerId) => {
        const p = gameAtStart.players[playerId];
        return {
          id: playerId,
          userId: p.userId,
          name: p.name,
          userName: p.userName,
          avatar: p.avatar,
          ticket: p.ticket,
          markedNumbers: p.markedNumbers || [],
          color: p.color,
          completedBingo: p.completedBingo || false,
        };
      });

      broadcastToGame(gameAtStart, {
        type: "BINGO_STARTED",
        message: "Oyun başladı!",
        drawMode: gameAtStart.drawMode,
        drawer:
          gameAtStart.drawMode === "manual" ? gameAtStart.drawer : undefined,
        bingoMode: gameAtStart.bingoMode,
        gameId: gameAtStart.gameId.toString(),
        players: clientPlayers,
        competitionMode: gameAtStart.competitionMode,
        completedPlayers: [],
      });

      await saveGameToRedis(lobbyCode, gameAtStart);

      if (gameAtStart.drawMode === "auto") {
        if (gameIntervals[lobbyCode]) clearTimeout(gameIntervals[lobbyCode]);
        gameIntervals[lobbyCode] = setTimeout(() => {
          autoDrawNumber(lobbyCode);
        }, 1000);
      } else if (
        gameAtStart.drawMode === "manual" &&
        gameAtStart.drawer &&
        activePlayerSockets[lobbyCode] &&
        activePlayerSockets[lobbyCode][gameAtStart.drawer]
      ) {
        const drawerSocket = activePlayerSockets[lobbyCode][gameAtStart.drawer];
        if (drawerSocket && drawerSocket.readyState === drawerSocket.OPEN) {
          drawerSocket.send(
            JSON.stringify({
              type: "BINGO_YOUR_TURN_TO_DRAW",
              message: "Sıradaki sayıyı çekebilirsiniz.",
              lobbyCode: gameAtStart.lobbyCode,
            })
          );
        }
      }
    }
  }, 1000);
};

export const joinGame = async (ws, data) => {
  const { lobbyCode } = data;
  const joiningPlayerId = ws.userId;

  if (!lobbyCode)
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Lobi kodu belirtilmedi.",
      })
    );

  const userInfo = await getUserDetails(joiningPlayerId);
  if (!userInfo)
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Kullanıcı bilgileri alınamadı.",
      })
    );

  const dbLobby = await Lobby.findOne({ lobbyCode: lobbyCode });
  if (!dbLobby)
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Lobi bulunamadı." })
    );

  let game = await getGameFromRedis(lobbyCode);
  let isNewGameInstance = false;

  if (!game) {
    const shuffledColorsForGame = shuffleArray(PLAYER_COLORS);
    game = {
      lobbyCode,
      players: {},
      drawnNumbers: [],
      activeNumbers: [],
      numberPool: [],
      gameStarted: false,
      gameEnded: false,
      host: dbLobby.createdBy.toString(),
      drawMode: "auto",
      drawer: null,
      bingoMode: "classic",
      lastDrawTime: null,
      competitionMode: "competitive",
      rankings: [],
      gameId: null,
      _availableColors: shuffledColorsForGame,
      _colorIndex: 0,
    };
    isNewGameInstance = true;
  }

  if (game.gameEnded) {
 
    if (!activePlayerSockets[lobbyCode]) {
      activePlayerSockets[lobbyCode] = {};
    }
    activePlayerSockets[lobbyCode][joiningPlayerId] = ws;

    const mapPlayerToClient = (player) => ({
        id: player.userId,
        userName: player.userName,
        name: player.name,
        avatar: player.avatar,
        completed: player.completedBingo || !!player.completedAt,
        color: player.color,
    });

    ws.send(
      JSON.stringify({
        type: "BINGO_JOIN",
        message: "Oyun bitti. Sonuçlar:",
        lobbyCode,
        ticket: game.players[joiningPlayerId] ? game.players[joiningPlayerId].ticket : null,
        markedNumbers: game.players[joiningPlayerId] ? game.players[joiningPlayerId].markedNumbers || [] : [],
        isHost: String(game.host) === String(joiningPlayerId),
        players: Object.values(game.players).map(mapPlayerToClient),
        gameStarted: game.gameStarted,
        gameEnded: game.gameEnded,
        drawnNumbers: game.drawnNumbers,
        activeNumbers: game.activeNumbers,
        drawMode: game.drawMode,
        drawer: game.drawer,
        completedBingo: game.players[joiningPlayerId] ? (game.players[joiningPlayerId].completedBingo || !!game.players[joiningPlayerId].completedAt) : false,
        completedPlayers: getCompletedPlayersList(game),
        bingoMode: game.bingoMode,
        competitionMode: game.competitionMode,
        gameId: game.gameId ? game.gameId.toString() : null,
        rankings: game.rankings || (game.gameStarted || game.gameEnded ? getGameRankings(game) : []),
        playerColor: game.players[joiningPlayerId] ? game.players[joiningPlayerId].color : undefined,
      })
    );
    return;
  }

  if (game.gameStarted && !game.gameEnded && !game.players[joiningPlayerId] && !isNewGameInstance) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message:
          "Bu lobide aktif bir oyun devam ediyor. Lütfen oyunun bitmesini bekleyin veya başka bir lobiye katılın.",
      })
    );
  }

  if (!activePlayerSockets[lobbyCode]) {
    activePlayerSockets[lobbyCode] = {};
  }
  activePlayerSockets[lobbyCode][joiningPlayerId] = ws;

  const mapPlayerToClient = (player) => ({
    id: player.userId,
    userName: player.userName,
    name: player.name,
    avatar: player.avatar,
    completed: player.completedBingo || !!player.completedAt,
    color: player.color,
  });

  let playerColor;
  let playerJustAdded = false;

  if (game.players[joiningPlayerId]) {
    const player = game.players[joiningPlayerId];
    player.userName = userInfo.username;
    player.name = userInfo.name;
    player.avatar = userInfo.avatar;
    playerColor = player.color;

    ws.send(
      JSON.stringify({
        type: "BINGO_JOIN",
        message: "Oyuna başarıyla yeniden bağlandınız.",
        lobbyCode,
        ticket: player.ticket,
        markedNumbers: player.markedNumbers || [],
        isHost: String(game.host) === String(joiningPlayerId),
        players: Object.values(game.players).map(mapPlayerToClient),
        gameStarted: game.gameStarted,
        gameEnded: game.gameEnded,
        drawnNumbers: game.drawnNumbers,
        activeNumbers: game.activeNumbers,
        drawMode: game.drawMode,
        drawer: game.drawer,
        completedBingo: player.completedBingo || !!player.completedAt,
        completedPlayers: getCompletedPlayersList(game),
        bingoMode: game.bingoMode,
        competitionMode: game.competitionMode,
        gameId: game.gameId ? game.gameId.toString() : null,
        rankings:
          game.rankings ||
          (game.gameStarted || game.gameEnded ? getGameRankings(game) : []),
        playerColor: player.color,
      })
    );
  } else {
    if (
      !game._availableColors ||
      game._availableColors.length === 0 ||
      game._colorIndex >= game._availableColors.length
    ) {
      const usedColors = Object.values(game.players).map((p) => p.color);
      game._availableColors = shuffleArray(
        PLAYER_COLORS.filter((c) => !usedColors.includes(c))
      );
      if (game._availableColors.length === 0)
        game._availableColors = shuffleArray(PLAYER_COLORS);
      game._colorIndex = 0;
    }
    if (game._availableColors.length > 0) {
      playerColor =
        game._availableColors[game._colorIndex % game._availableColors.length];
      game._colorIndex++;
    } else {
      playerColor =
        PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
    }

    game.players[joiningPlayerId] = {
      userId: joiningPlayerId,
      userName: userInfo.username,
      name: userInfo.name,
      avatar: userInfo.avatar,
      markedNumbers: [],
      ticket: null,
      completedBingo: false,
      completedAt: null,
      color: playerColor,
    };
    playerJustAdded = true;

    broadcastToGame(game, {
      type: "BINGO_PLAYER_JOINED",
      player: mapPlayerToClient(game.players[joiningPlayerId]),
      notification: {
        key: "notifications.playerJoined",
        params: { playerName: userInfo.name || userInfo.username },
      },
    });

    ws.send(
      JSON.stringify({
        type: "BINGO_JOIN",
        message: "Oyuna başarıyla katıldınız.",
        lobbyCode,
        ticket: null,
        markedNumbers: [],
        isHost: String(game.host) === String(joiningPlayerId),
        players: Object.values(game.players).map(mapPlayerToClient),
        gameStarted: game.gameStarted,
        gameEnded: game.gameEnded,
        drawnNumbers: game.drawnNumbers,
        activeNumbers: game.activeNumbers,
        drawMode: game.drawMode,
        drawer: game.drawer,
        completedBingo: false,
        completedPlayers: getCompletedPlayersList(game),
        bingoMode: game.bingoMode,
        competitionMode: game.competitionMode,
        gameId: game.gameId ? game.gameId.toString() : null,
        rankings: game.rankings || [],
        playerColor: playerColor,
      })
    );
  }

  if (isNewGameInstance || playerJustAdded || !game.players[joiningPlayerId].ticket) {
    await saveGameToRedis(lobbyCode, game);
  } else {
    console.log(`[joinGame-${lobbyCode}] No critical state change for player ${joiningPlayerId} that requires immediate save, or game was already handled (e.g., ended). Game ended: ${game.gameEnded}.`);
  }
};

export const handleBingoPlayerLeavePreGame = async (lobbyCode, playerId) => {
  let game = await getGameFromRedis(lobbyCode);

  if (!game) {
    console.log(`[Bingo Leave PreGame-${lobbyCode}] No Bingo game state to update for player ${playerId}. Lobby notified separately.`);
    return;
  }

  if (game.gameStarted && !game.gameEnded) {
    console.warn(`[Bingo Leave PreGame-${lobbyCode}] Called for an active game for player ${playerId}. MidGame handler should be used.`);
    return;
  }

  const playerWasFormallyInBingoPlayersList = !!game.players[playerId];
  let playerNameForNotification = `Player ${playerId.substring(0, 6)}`;

  if (playerWasFormallyInBingoPlayersList) {
    playerNameForNotification = game.players[playerId]?.name || game.players[playerId]?.userName || playerNameForNotification;
    delete game.players[playerId];

    if (activePlayerSockets[lobbyCode] && activePlayerSockets[lobbyCode][playerId]) {
      delete activePlayerSockets[lobbyCode][playerId];
      if (Object.keys(activePlayerSockets[lobbyCode]).length === 0) {
        delete activePlayerSockets[lobbyCode];
      }
    }
  }

  if (Object.keys(game.players).length === 0 && playerWasFormallyInBingoPlayersList) {
    console.log(`[Bingo Leave PreGame-${lobbyCode}] Last formal player ${playerNameForNotification} left. Deleting Bingo game state from Redis.`);
    await deleteBingoGameStateFromRedis(lobbyCode);
  } else {
    await saveGameToRedis(lobbyCode, game);
  }

  const clientPlayersList = Object.values(game.players).map((p) => ({
    id: p.userId,
    userId: p.userId,
    name: p.name,
    userName: p.userName,
    avatar: p.avatar,
    color: p.color,
  }));

  broadcastToGame(game, {
    type: "BINGO_GAME_STATE_UPDATED",
    lobbyCode: lobbyCode,
    gameId: game.gameId,
    players: clientPlayersList,
    host: game.host,
    gameStarted: game.gameStarted,
    gameEnded: game.gameEnded,
    drawMode: game.drawMode,
    drawer: game.drawer,
    bingoMode: game.bingoMode,
    competitionMode: game.competitionMode,
    kickedPlayerId: playerId,
    messagePlayerName: playerNameForNotification, // Oyuncu adını da gönderelim
  });
};

export const handleBingoPlayerLeaveMidGame = async (lobbyCode, playerId) => {
  let game = await getGameFromRedis(lobbyCode);
  if (!game) {
    console.warn(`[Bingo Leave MidGame-${lobbyCode}] Game not found.`);
    return;
  }
  if (!game.gameStarted || game.gameEnded) {
    console.warn(
      `[Bingo Leave MidGame-${lobbyCode}] Game not active (started: ${game.gameStarted}, ended: ${game.gameEnded}). Player: ${playerId}`
    );
    return;
  }

  const playerLeaving = game.players[playerId];
  if (!playerLeaving) {
    console.warn(
      `[Bingo Leave MidGame-${lobbyCode}] Player ${playerId} not found in active game.`
    );
    return;
  }

  const playerName =
    playerLeaving.name ||
    playerLeaving.userName ||
    `Player ${playerId.substring(0, 6)}`;
  console.log(
    `[Bingo Leave MidGame-${lobbyCode}] Player ${playerName} (${playerId}) is leaving.`
  );
  delete game.players[playerId]; 

  if (
    activePlayerSockets[lobbyCode] &&
    activePlayerSockets[lobbyCode][playerId]
  ) {
    delete activePlayerSockets[lobbyCode][playerId];
    if (Object.keys(activePlayerSockets[lobbyCode]).length === 0) {
      delete activePlayerSockets[lobbyCode];
    }
  }

  const remainingPlayerCount = Object.keys(game.players).length;
  let modeChangedToAuto = false;

  // Güncellenmiş oyuncu listesini map'le (frontend'in beklediği formatta)
  const updatedPlayersForFrontend = Object.values(game.players).map(p => ({
    id: p.userId, // veya sadece p.id, frontend nasıl bekliyorsa
    userId: p.userId,
    name: p.name,
    userName: p.userName,
    avatar: p.avatar,
    color: p.color,
    completedBingo: p.completedBingo || !!p.completedAt, // Frontend'in kullandığı diğer alanlar
  }));

  if (remainingPlayerCount > 0) {
    // Diğer oyunculara ayrılma bilgisini ve GÜNCELLENMİŞ OYUNCU LİSTESİNİ gönder
    broadcastToGame(game, { // 'game' objesi broadcastToGame'e lobbyCode vs. için gönderiliyor
      type: "BINGO_PLAYER_LEFT_MID_GAME",
      lobbyCode: lobbyCode, // lobbyCode'u ekleyelim
      playerId: playerId, // Ayrılan oyuncunun ID'si
      playerName: playerName, // Ayrılan oyuncunun adı
      players: updatedPlayersForFrontend, // GÜNCELLENMİŞ OYUNCU LİSTESİ
      notification: {
        key: "notifications.playerLeftMidGame",
        params: { playerName: playerName },
      },
      // Gerekirse güncellenmiş host veya drawer bilgisi de gönderilebilir
      host: game.host,
      drawer: game.drawer,
      drawMode: game.drawMode,
    });

    if (
      game.drawMode === "manual" &&
      String(game.drawer) === String(playerId)
    ) {
      console.log(
        `[Bingo Leave MidGame-${lobbyCode}] Manual drawer ${playerName} left. Switching to AUTO draw mode.`
      );
      if (gameIntervals[lobbyCode]) {
        clearTimeout(gameIntervals[lobbyCode]);
        delete gameIntervals[lobbyCode];
      }
      game.drawMode = "auto";
      game.drawer = null;
      modeChangedToAuto = true;
      // Draw mode değişikliğini de tüm oyunculara bildir
      broadcastToGame(game, {
        type: "BINGO_DRAW_MODE_CHANGED",
        lobbyCode: lobbyCode,
        newDrawMode: "auto",
        drawer: null, // Artık drawer yok
        players: updatedPlayersForFrontend, // Oyuncu listesini tekrar gönder
        message: `The drawing player (${playerName}) left the game. Switched to automatic drawing mode.`,
      });
      await saveGameToRedis(lobbyCode, game);

      if (typeof autoDrawNumber === "function") {
        autoDrawNumber(lobbyCode);
      } else {
        console.error(
          `[Bingo Leave MidGame-${lobbyCode}] autoDrawNumber function is not defined. Cannot start auto draw.`
        );
      }
    }

    const currentRankings = getGameRankings(game); // Güncellenmiş game.players ile sıralama al
    const completedPlayersCount = currentRankings.filter(
      (r) => r.completedAt
    ).length;

    if (
      remainingPlayerCount > 0 &&
      completedPlayersCount === remainingPlayerCount &&
      !game.gameEnded // Oyun zaten bitmemişse
    ) {
      game.gameEnded = true;
      game.gameStarted = false; // Oyunu sonlandır
      game.rankings = currentRankings;
      if (gameIntervals[lobbyCode]) {
        clearTimeout(gameIntervals[lobbyCode]);
        delete gameIntervals[lobbyCode];
      }
      broadcastToGame(game, {
        type: "BINGO_GAME_OVER",
        lobbyCode: lobbyCode,
        message:
          "All remaining players have completed Bingo after a player left. Final Rankings:",
        finalRankings: currentRankings,
        players: updatedPlayersForFrontend, // Son oyuncu listesini gönder
      });
      await saveGameStatsToDB(game); // Oyun bittiği için DB'ye kaydet
      // Oyun bitti, Redis'ten silmek yerine son durumu koruyabiliriz (ended: true ile)
      // veya bir süre sonra temizlenecek şekilde TTL ayarlanabilir.
      // Şimdilik son durumu kaydediyoruz.
      await saveGameToRedis(lobbyCode, game);
      return; // Oyun bittiği için fonksiyondan çık
    }

    // Oyun bitmediyse, güncellenmiş game state'ini Redis'e kaydet
    if (!game.gameEnded) {
      await saveGameToRedis(lobbyCode, game);
    }

  } else { // Kalan oyuncu yoksa oyunu bitir ve Redis'ten sil
    console.log(`[Bingo Leave MidGame-${lobbyCode}] Last player ${playerName} left. Ending and removing game.`);
    game.gameEnded = true;
    game.gameStarted = false;
    if (gameIntervals[lobbyCode]) {
      clearTimeout(gameIntervals[lobbyCode]);
      delete gameIntervals[lobbyCode];
    }
    // Oyunculara oyunun bittiğini (oyuncu kalmadığı için) bildir.
    // Bu mesajı göndermek için broadcastToGame'in `game` objesini alması ve
    // içinde lobbyCode olması gerekir. activePlayerSockets[lobbyCode] artık boş olacağı için
    // bu mesaj kimseye gitmeyebilir eğer o an bağlı kimse yoksa.
    // Ancak yine de durumu loglamak ve Redis'i temizlemek önemli.
    broadcastToGame({ lobbyCode: lobbyCode, players: {} }, { // Dummy game objesi
        type: "BINGO_GAME_OVER",
        lobbyCode: lobbyCode,
        message: "The last player left the game. Game over.",
        finalRankings: [], // Oyuncu kalmadığı için boş sıralama
        players: [],
    });
    await deleteBingoGameStateFromRedis(lobbyCode); // Redis'ten oyun durumunu sil
    return; // Fonksiyondan çık
  }

  // Bu satır artık yukarıdaki `if (!game.gameEnded)` bloğu içinde
  // if (remainingPlayerCount > 0 && !game.gameEnded && !modeChangedToAuto) {
  //   await saveGameToRedis(lobbyCode, game);
  // }
};


export const markNumber = async (ws, data) => {
  const { lobbyCode, number } = data;
  let game = await getGameFromRedis(lobbyCode);

  if (!game || !game.players[ws.userId]) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Geçersiz oyun veya oyuncu.",
      })
    );
  }
  if (!game.gameStarted) {
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Oyun henüz başlamadı." })
    );
  }
  if (game.gameEnded) {
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Oyun zaten bitti." })
    );
  }

  const player = game.players[ws.userId];
  if (!player.ticket || !player.ticket.numbersGrid) {
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Biletiniz bulunamadı." })
    );
  }

  if (player.completedBingo) {
    ws.send(
      JSON.stringify({
        type: "BINGO_NUMBER_MARKED_CONFIRMED",
        playerId: ws.userId,
        number,
        markedNumbers: player.markedNumbers,
        completedBingo: true,
        completedAt: player.completedAt
          ? player.completedAt.toISOString()
          : null,
        message: "Zaten Bingo yaptınız, tekrar işaretleme yapılamaz.",
      })
    );
    return;
  }

  let numberFoundOnTicket = false;
  player.ticket.numbersGrid.forEach((row) => {
    if (row.includes(number)) numberFoundOnTicket = true;
  });

  if (!numberFoundOnTicket) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Bu numara biletinizde yok.",
      })
    );
  }

  const isNumberCurrentlyActive =
    game.activeNumbers && game.activeNumbers.includes(number);
  const isNumberDrawn = game.drawnNumbers.includes(number);

  if (
    game.competitionMode === "competitive" &&
    !isNumberCurrentlyActive &&
    !isNumberDrawn
  ) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Bu numara henüz çekilmedi veya aktif değil.",
      })
    );
  } else if (!isNumberDrawn) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Bu numara henüz çekilmedi.",
      })
    );
  }

  if (!player.markedNumbers.includes(number)) {
    player.markedNumbers.push(number);
    await saveGameToRedis(lobbyCode, game);
  }

  ws.send(
    JSON.stringify({
      type: "BINGO_NUMBER_MARKED_CONFIRMED",
      playerId: ws.userId,
      number,
      markedNumbers: player.markedNumbers,
      completedBingo: player.completedBingo,
    })
  );
};

export const checkBingo = async (ws, data) => {
  const { lobbyCode } = data;

  let game = await getGameFromRedis(lobbyCode);

  if (!game) {
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Oyun bulunamadı." })
    );
  }

  if (!game.gameStarted || game.gameEnded) {
    return ws.send(
      JSON.stringify({ type: "BINGO_ERROR", message: "Oyun aktif değil." })
    );
  }

  const player = game.players[ws.userId];
  if (!player) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Oyuncu bilgisi bulunamadı.",
      })
    );
  }

  if (player.completedBingo) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_INVALID",
        message: "Zaten Bingo yaptınız.",
      })
    );
  }

  if (!player.ticket || !player.ticket.numbersGrid || !player.ticket.layout) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: "Bilet bilgisi geçersiz.",
      })
    );
  }

  const playerTicketNumbers = [];
  player.ticket.numbersGrid.forEach((row) =>
    row.forEach((num) => {
      if (num !== null) playerTicketNumbers.push(num);
    })
  );

  if (playerTicketNumbers.length !== 15) {
    return ws.send(
      JSON.stringify({
        type: "BINGO_ERROR",
        message: `Biletinizde beklenenden farklı sayıda (${playerTicketNumbers.length}) numara var.`,
      })
    );
  }

  if (!Array.isArray(game.drawnNumbers)) game.drawnNumbers = [];
  if (!Array.isArray(player.markedNumbers)) player.markedNumbers = [];

  const isAllTicketNumbersDrawn = playerTicketNumbers.every((num) =>
    game.drawnNumbers.includes(num)
  );
  const isAllTicketNumbersMarked = playerTicketNumbers.every((num) =>
    player.markedNumbers.includes(num)
  );

  if (isAllTicketNumbersDrawn && isAllTicketNumbersMarked) {
    if (!player.completedAt) {
      player.completedAt = new Date();
      player.completedBingo = true;
    }

    const currentRankings = getGameRankings(game);

    const playerRankInfo = currentRankings.find(
      (r) => String(r.playerId) === String(ws.userId)
    );
    const playerRank = playerRankInfo ? playerRankInfo.rank : null;

    const currentCompletedPlayers = getCompletedPlayersList(game);

    const numberOfPlayers = Object.keys(game.players).length;
    const allNumbersDrawn = game.numberPool && game.numberPool.length === 0;
    const allConnectedPlayersCompleted =
      currentCompletedPlayers.length === numberOfPlayers && numberOfPlayers > 0;

    let shouldGameEnd = false;
    let gameOverReason = "";

    if (game.competitionMode === "non-competitive") {
      shouldGameEnd = true;
      gameOverReason = `${
        player.name || player.userName
      } BINGO! Oyunu Kazandı!`;
    } else {
      if (numberOfPlayers <= 1 && numberOfPlayers > 0) {
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
      completedAt: player.completedAt.toISOString(),
      rank: playerRank,
      notification: {
        key: "notifications.playerCompletedBingo",
        params: { playerName: player.name || player.userName },
      },
    });

    if (shouldGameEnd && !game.gameEnded) {
      game.gameEnded = true;
      game.gameStarted = false;
      if (gameIntervals[lobbyCode]) {
        clearInterval(gameIntervals[lobbyCode]);
        delete gameIntervals[lobbyCode];
      }

      const finalRankingsForGameOver = getGameRankings(game);

      broadcastToGame(game, {
        type: "BINGO_GAME_OVER",
        message: gameOverReason,
        finalRankings: finalRankingsForGameOver,
        gameId: game.gameId,
        completedPlayers: getCompletedPlayersList(game),
      });

      await saveGameStatsToDB(game);

    } else if (!game.gameEnded) {
      broadcastToGame(game, {
        type: "BINGO_GAME_STATUS",
        rankings: currentRankings,
        completedPlayers: currentCompletedPlayers,
      });
    }

    await saveGameToRedis(lobbyCode, game);

  } else {
    ws.send(
      JSON.stringify({
        type: "BINGO_INVALID",
        message: "Geçersiz Bingo çağrısı. Tüm numaralarınız çekilmemiş veya işaretlenmemiş.",
      })
    );
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

    const gamesDetails = games.map((game) => {
      // Directly map over games
      // İlgili oyuncu bilgilerini buluyoruz
      const playerInfo = game.players.find((p) => p.playerId === userId);
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
        isWin: isWin,
      };
    });

    const averageScore = totalGames > 0 ? totalScore / totalGames : 0;

    res.json({
      totalGames,
      wins,
      averageScore,
      games: gamesDetails,
    });
  } catch (error) {
    console.error("Bingo user stats error:", error);
    res.status(500).json({ message: "İç sunucu hatası" });
  }
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
      return res.status(404).json({
        message: "Bu kullanıcı için Bingo oyun istatistiği bulunamadı.",
      });
    }

    let totalGamesPlayed = games.length;
    let totalWins = 0;
    let totalScore = 0;
    let totalPlayTimeMilliseconds = 0;
    let userName = ""; // Kullanıcı adını oyunlardan veya User modelinden alabiliriz

    const gamesDetails = games.map((game) => {
      const playerInfo = game.players.find((p) => p.playerId === userId); // Bingo modelinizde playerId String ise
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
        durationMilliseconds =
          game.endedAt.getTime() - game.startedAt.getTime();
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
        isWin: isWin,
      };
    });

    const averageScore =
      totalGamesPlayed > 0
        ? parseFloat((totalScore / totalGamesPlayed).toFixed(2))
        : 0;

    // Eğer oyunlardan userName alınamadıysa User modelinden çekmeyi deneyebiliriz
    if (!userName && totalGamesPlayed > 0) {
      try {
        const User = mongoose.model("User"); // User modelinizin adını ve importunu kontrol edin
        const user = await User.findById(userId).select("username").lean(); // 'username' alanını kendi modelinize göre ayarlayın
        if (user && user.username) {
          userName = user.username;
        }
      } catch (e) {
        console.warn(
          "Bingo stats: Kullanıcı adı User modelinden alınırken hata:",
          e.message
        );
      }
    }

    res.status(200).json({
      userId: userId,
      userName: userName || "Bilinmiyor",
      totalGames: totalGamesPlayed,
      wins: totalWins,
      averageScore,
      totalPlayTimeMilliseconds,
      totalPlayTimeFormatted: formatMillisecondsToHHMMSS(
        totalPlayTimeMilliseconds
      ),
      games: gamesDetails,
    });
  } catch (error) {
    console.error("Error fetching Bingo player stats:", error);
    res.status(500).json({
      message: "Bingo istatistikleri alınırken sunucuda bir hata oluştu.",
      error: error.message,
    });
  }
};

export const getAllPlayerBingoStats = async (req, res) => {
  try {
    const playerStats = await BingoGame.aggregate([
      {
        $unwind: "$players",
      },

      {
        $group: {
          _id: "$players.playerId",
          userName: { $first: "$players.userName" },
          totalGames: { $sum: 1 },
          totalScore: { $sum: "$players.score" },
          wins: {
            $sum: {
              $cond: [{ $eq: ["$players.finalRank", 1] }, 1, 0],
            },
          },
        },
      },

      {
        $addFields: {
          averageScore: {
            $cond: [
              { $eq: ["$totalGames", 0] },
              0,
              { $divide: ["$totalScore", "$totalGames"] },
            ],
          },
        },
      },

      {
        $sort: {
          averageScore: -1,
          userName: 1,
        },
      },

      {
        $project: {
          _id: 0,
          playerId: "$_id",
          userName: 1,
          totalGames: 1,
          totalScore: 1,
          wins: 1,
          averageScore: 1,
        },
      },
    ]);

    res.status(200).json({ playerOverallStats: playerStats });
  } catch (error) {
    console.error("Error aggregating player bingo stats:", error);
    res
      .status(500)
      .json({ message: "Sunucuda bir hata oluştu.", error: error.message });
  }
};
