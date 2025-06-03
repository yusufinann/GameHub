import { BingoGame } from "../../models/bingo.game.model.js";
import { shuffleArray } from "../../utils/arrayUtils.js";
import { isValidDoubleRow, isValidSingleRow } from "./bingoTicket.js";

export function generateBingoTicket() {
  const MAX_MAIN_ATTEMPTS = 2000;
  const MAX_LAYOUT_ATTEMPTS = 200;

  for (let mainAttempt = 0; mainAttempt < MAX_MAIN_ATTEMPTS; mainAttempt++) {
    const ticket = Array(3)
      .fill(null)
      .map(() => Array(9).fill(null));
    const layout = Array(3)
      .fill(null)
      .map(() => Array(9).fill(false));

    let validLayout = false;
    for (
      let layoutAttempt = 0;
      layoutAttempt < MAX_LAYOUT_ATTEMPTS;
      layoutAttempt++
    ) {
      const tempLayout = Array(3)
        .fill(null)
        .map(() => Array(9).fill(false));
      const colCounts = Array(9).fill(0);
      const rowCellCounts = Array(3).fill(0);

      const rowIndices = shuffleArray([0, 1, 2]);
      const doubleRowIndices = [rowIndices[0], rowIndices[1]];
      const singleRowIndex = rowIndices[2];
      let possibleLayout = true;

      for (const r of doubleRowIndices) {
        let rowPlaced = false;
        for (let i = 0; i < MAX_LAYOUT_ATTEMPTS / 10; i++) {
          const testRow = Array(9).fill(false);
          const pairStartCol = Math.floor(Math.random() * 8);
          testRow[pairStartCol] = true;
          testRow[pairStartCol + 1] = true;
          const remainingCols = shuffleArray(
            Array.from({ length: 9 }, (_, k) => k).filter(
              (k) => k !== pairStartCol && k !== pairStartCol + 1
            )
          );
          if (remainingCols.length < 3) continue;
          for (let j = 0; j < 3; j++) testRow[remainingCols[j]] = true;
          if (isValidDoubleRow(testRow)) {
            tempLayout[r] = testRow;
            rowPlaced = true;
            break;
          }
        }
        if (!rowPlaced) {
          possibleLayout = false;
          break;
        }
      }
      if (!possibleLayout) continue;

      let singleRowPlaced = false;
      for (let i = 0; i < MAX_LAYOUT_ATTEMPTS / 10; i++) {
        const testRow = Array(9).fill(false);
        const chosenCols = shuffleArray(Array.from({ length: 9 }, (_, k) => k));
        for (let j = 0; j < 5; j++) testRow[chosenCols[j]] = true;
        if (isValidSingleRow(testRow)) {
          tempLayout[singleRowIndex] = testRow;
          singleRowPlaced = true;
          break;
        }
      }
      if (!singleRowPlaced) continue;

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 9; c++) {
          if (tempLayout[r][c]) {
            rowCellCounts[r]++;
            colCounts[c]++;
          }
        }
      }

      if (
        rowCellCounts.every((count) => count === 5) &&
        colCounts.every((count) => count >= 1 && count <= 3)
      ) {
        if (
          isValidDoubleRow(tempLayout[doubleRowIndices[0]]) &&
          isValidDoubleRow(tempLayout[doubleRowIndices[1]]) &&
          isValidSingleRow(tempLayout[singleRowIndex])
        ) {
          for (let r = 0; r < 3; r++) layout[r] = [...tempLayout[r]];
          validLayout = true;
          break;
        }
      }
    }

    if (!validLayout) continue;

    const numbersByCol = Array(9)
      .fill(null)
      .map((_, i) => {
        const min = i * 10 + (i === 0 ? 1 : 0);
        const max = i * 10 + (i === 8 ? 10 : 9);
        return shuffleArray(
          Array.from({ length: max - min + 1 }, (_, k) => min + k)
        );
      });

    for (let c = 0; c < 9; c++) {
      const colNumsToPlace = [];
      for (let r = 0; r < 3; r++) {
        if (layout[r][c]) {
          if (numbersByCol[c].length === 0)
            return {
              numbersGrid: null,
              layout: null,
              error: "Not enough numbers for column assignment.",
            };
          colNumsToPlace.push(numbersByCol[c].pop());
        }
      }
      colNumsToPlace.sort((a, b) => a - b);
      let currentNumIndex = 0;
      for (let r = 0; r < 3; r++) {
        if (layout[r][c]) {
          ticket[r][c] = colNumsToPlace[currentNumIndex++];
        }
      }
    }

    let finalCheckOk = true;
    for (let r = 0; r < 3; r++) {
      if (ticket[r].filter((n) => n !== null).length !== 5) {
        finalCheckOk = false;
        break;
      }
    }
    if (!finalCheckOk) continue;
    for (let c = 0; c < 9; c++) {
      let count = 0;
      for (let r = 0; r < 3; r++) if (ticket[r][c] !== null) count++;
      if (count === 0) {
        finalCheckOk = false;
        break;
      }
    }
    if (!finalCheckOk) continue;

    return { numbersGrid: ticket, layout };
  }
  console.error(
    "Failed to generate valid bingo ticket after MAX_MAIN_ATTEMPTS."
  );
  return {
    numbersGrid: null,
    layout: null,
    error: "Failed to generate valid ticket layout.",
  };
}
export function getGameRankings(game) {
  if (!game || !game.players) return [];
  const drawnNumbers = game.drawnNumbers || [];
  const playersWithScores = Object.entries(game.players).map(
    ([playerId, player]) => {
      let score = 0;
      if (player.ticket && player.ticket.numbersGrid && player.markedNumbers) {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 9; c++) {
            const num = player.ticket.numbersGrid[r][c];
            if (
              num &&
              player.markedNumbers.includes(num) &&
              drawnNumbers.includes(num)
            ) {
              score++;
            }
          }
        }
      }
      return {
        playerId,
        userId: player.userId,
        userName: player.userName,
        name: player.name,
        avatar: player.avatar,
        score: score,
        completedAt: player.completedAt ? new Date(player.completedAt) : null,
      };
    }
  );
  playersWithScores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aCompleted = !!a.completedAt;
    const bCompleted = !!b.completedAt;
    if (aCompleted && bCompleted) {
      return a.completedAt.getTime() - b.completedAt.getTime();
    }
    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;
    return (a.userName || "").localeCompare(b.userName || "");
  });
  const finalRankedPlayers = [];
  if (playersWithScores.length > 0) {
    let currentRank = 1;
    finalRankedPlayers.push({ ...playersWithScores[0], rank: currentRank });
    for (let i = 1; i < playersWithScores.length; i++) {
      const currentPlayer = playersWithScores[i];
      const previousPlayer = finalRankedPlayers[finalRankedPlayers.length - 1];
      let isEffectivelyTied = false;
      if (currentPlayer.score === previousPlayer.score) {
        const currentPlayerCompleted = !!currentPlayer.completedAt;
        const previousPlayerCompleted = !!previousPlayer.completedAt;
        if (currentPlayerCompleted && previousPlayerCompleted) {
          if (
            currentPlayer.completedAt.getTime() ===
            previousPlayer.completedAt.getTime()
          ) {
            isEffectivelyTied = true;
          }
        } else if (!currentPlayerCompleted && !previousPlayerCompleted) {
          isEffectivelyTied = true;
        }
      }
      if (!isEffectivelyTied) {
        currentRank = i + 1;
      }
      finalRankedPlayers.push({ ...currentPlayer, rank: currentRank });
    }
  }
  return finalRankedPlayers;
}
export function getCompletedPlayersList(game) {
  if (!game || !game.players) {
    return [];
  }
  return Object.entries(game.players)
    .filter(([, player]) => player && player.completedAt)
    .map(([id, player]) => ({
      id: id,
      userId: player.userId,
      userName: player.userName,
      avatar: player.avatar,
    }));
}

export async function saveGameStatsToDB(game) {
  if (!game || !game.gameId) {
    console.error("[saveGameStatsToDB] Geçersiz oyun nesnesi veya gameId eksik.");
    return;
  }

  try {
    const rankings = getGameRankings(game);
    const winnerRankInfo = rankings.find((rankInfo) => rankInfo.rank === 1);
    let winner = null;
    if (winnerRankInfo) {
      winner = {
        playerId: winnerRankInfo.playerId,
        userName: winnerRankInfo.userName,
        completedAt: winnerRankInfo.completedAt,
      };
    }

    const playersForDB = rankings.map((rankInfo) => {
      const player = game.players[rankInfo.playerId];
      let ticketNumbersForDB = [];
      if (player && player.ticket && player.ticket.numbersGrid) {
        player.ticket.numbersGrid.forEach((row) =>
          row.forEach((num) => {
            if (num !== null) ticketNumbersForDB.push(num);
          })
        );
      }
      return {
        playerId: rankInfo.playerId,
        userName: rankInfo.userName,
        score: rankInfo.score,
        ticket: ticketNumbersForDB.sort((a, b) => a - b),
        completedAt: rankInfo.completedAt,
        finalRank: rankInfo.rank,
      };
    });

    const filter = { gameId: game.gameId };

    const updateOperation = {
      $setOnInsert: {
        gameId: game.gameId,
        lobbyCode: game.lobbyCode,
        startedAt: game.startedAt,
        players: playersForDB,
        drawnNumbers: game.drawnNumbers,
        drawMode: game.drawMode,
        winner: winner,
        createdBy: game.host,
      },
      $set: {
        endedAt: new Date(),
      }
    };

    const options = {
      upsert: true,
      new: true,
      runValidators: true,
    };

    const savedGameStats = await BingoGame.findOneAndUpdate(filter, updateOperation, options);

    if (savedGameStats) {
      console.log(`[saveGameStatsToDB] Oyun istatistikleri ${savedGameStats.gameId} için başarıyla kaydedildi/güncellendi.`);
    } else {
      console.error(`[saveGameStatsToDB] Oyun istatistikleri kaydedilirken bir sorun oluştu (gameId: ${game.gameId}).`);
    }

  } catch (error) {
    console.error(`[saveGameStatsToDB] Oyun istatistikleri kaydedilirken/güncellenirken hata oluştu (gameId: ${game.gameId}):`, error);
  }
}