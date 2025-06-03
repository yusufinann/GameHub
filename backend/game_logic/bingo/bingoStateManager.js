import redisClient from "../../redisClient.js";
import { ENDED_GAME_EXPIRY_SECONDS, GAME_EXPIRY_SECONDS, GAME_KEY_PREFIX } from "./bingoConstants.js";

export async function getGameFromRedis(lobbyCode) {
  if (typeof lobbyCode !== "string") {
    console.error(
      `[getGameFromRedis] Invalid lobbyCode type: ${typeof lobbyCode}`,
      lobbyCode
    );
    return null;
  }
  const gameJSON = await redisClient.get(`${GAME_KEY_PREFIX}${lobbyCode}`);
  if (!gameJSON) return null;
  const game = JSON.parse(gameJSON);
  if (game.startedAt) game.startedAt = new Date(game.startedAt);
  if (game.lastDrawTime) game.lastDrawTime = new Date(game.lastDrawTime);
  if (game.players) {
    Object.values(game.players).forEach((p) => {
      if (p.completedAt) p.completedAt = new Date(p.completedAt);
    });
  }
  return game;
}

export async function saveGameToRedis(lobbyCode, game) {

   if (typeof lobbyCode !== "string") {
    console.error(
      `[saveGameToRedis] Invalid lobbyCode type: ${typeof lobbyCode} for game:`,
      game
    );
    if (game && typeof game.lobbyCode === "string") {
      lobbyCode = game.lobbyCode;
    } else {
      console.error(
        "[saveGameToRedis] Cannot determine a valid lobbyCode string to save the game."
      );
      return;
    }
  }
  if (!game) {
    await redisClient.del(`${GAME_KEY_PREFIX}${lobbyCode}`);
    return;
  }
  if (typeof lobbyCode !== "string") {
    console.error(
      `[saveGameToRedis] Invalid lobbyCode type: ${typeof lobbyCode} for game:`,
      game
    );
    if (game && typeof game.lobbyCode === "string") {
      lobbyCode = game.lobbyCode;
    } else {
      console.error(
        "[saveGameToRedis] Cannot determine a valid lobbyCode string to save the game."
      );
      return;
    }
  }

  const gameToSave = { ...game };
  delete gameToSave.autoDrawInterval;

  if (gameToSave.players) {
    const playersCopy = { ...gameToSave.players };
    Object.keys(playersCopy).forEach((playerId) => {
      const playerCopy = { ...playersCopy[playerId] };
      delete playerCopy.ws;
      playersCopy[playerId] = playerCopy;
    });
    gameToSave.players = playersCopy;
  }
   
  const expirySeconds = gameToSave.gameEnded
    ? ENDED_GAME_EXPIRY_SECONDS  
    : GAME_EXPIRY_SECONDS;      

  try {
    await redisClient.set(
      `${GAME_KEY_PREFIX}${lobbyCode}`,
      JSON.stringify(gameToSave),
      {
        EX: expirySeconds, 
      }
    );
    console.log(`[saveGameToRedis] Game for lobby ${lobbyCode} saved to Redis with TTL: ${expirySeconds}s. Game ended: ${gameToSave.gameEnded}`);
  } catch (error) {
    console.error(`[saveGameToRedis] Error saving game to Redis for lobby ${lobbyCode}:`, error);
  }
}

/**
 * @param {string} lobbyCode 
 * @returns {Promise<void>}
 */
export async function deleteBingoGameStateFromRedis(lobbyCode) {
  if (typeof lobbyCode !== "string") {
    console.error(
      `[deleteBingoGameStateFromRedis] Invalid lobbyCode type: ${typeof lobbyCode}`,
      lobbyCode
    );
    return;
  }
  if (!redisClient || !redisClient.isOpen) { 
    console.error(
      `[deleteBingoGameStateFromRedis] Redis client is not connected or available. Cannot delete game for lobby: ${lobbyCode}`
    );
    return;
  }
  try {
    await redisClient.del(`${GAME_KEY_PREFIX}${lobbyCode}`);
    console.log(`[BingoStateManager] Game state for lobby ${lobbyCode} deleted from Redis.`);
  } catch (error) {
    console.error(`[BingoStateManager] Error deleting game state for lobby ${lobbyCode} from Redis:`, error);
  }
}

