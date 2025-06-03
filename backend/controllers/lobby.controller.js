import bcrypt from "bcrypt";
import Lobby from "../models/lobby.model.js";
import {
  cleanupAndRemoveBingoGame,
  handleBingoPlayerLeaveMidGame,
  handleBingoPlayerLeavePreGame,
} from "./bingo.game.controller.js";
import {
  handleHangmanPlayerLeaveMidGame,
  removePlayerFromHangmanPregame,
} from "./hangman.controller.js";
import {
  deleteGameFromRedis as deleteHangmanGameFromRedis,
  getGameFromRedis as getHangmanGameFromRedis,
} from "../game_logic/hangman/hangmanStateManager.js";
import { getGameFromRedis as getBingoGameFromRedis } from "../game_logic/bingo/bingoStateManager.js";
import redisClient from "../redisClient.js";
const lobbyTimers = new Map();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

let broadcastLobbyEvent;

export const initializeWebSocket = (wsHandler) => {
  broadcastLobbyEvent = wsHandler;
};

const generateLobbyId = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const generateLobbyCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const getLobbies = async (req, res) => {
  try {
    const { eventType, hasPassword } = req.query;
    let eventQuery = {
      lobbyType: "event",
      isActive: true,
      endTime: { $gt: new Date() },
    };
    let normalQuery = { lobbyType: "normal", isActive: true };

    if (hasPassword === "true") {
      eventQuery.password = { $ne: null };
      normalQuery.password = { $ne: null };
    } else if (hasPassword === "false") {
      eventQuery.password = null;
      normalQuery.password = null;
    }

    if (eventType && eventType !== "all") {
      if (eventType === "event") {
        normalQuery.lobbyType = null; // To exclude normal lobbies when eventType is 'event'
      } else if (eventType === "normal") {
        eventQuery.lobbyType = null; // To exclude event lobbies when eventType is 'normal'
      }
    }

    const eventLobbies =
      eventType === "normal" ? [] : await Lobby.find(eventQuery).lean();
    const normalLobbies =
      eventType === "event" ? [] : await Lobby.find(normalQuery).lean();

    const sortedEventLobbies = eventLobbies.sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );
    const filteredLobbies = [...sortedEventLobbies, ...normalLobbies];

    res.status(200).json({
      message: "Lobiler başarıyla getirildi.",
      lobbies: filteredLobbies,
    });
  } catch (error) {
    console.error("Lobi getirme hatası:", error);
    res.status(500).json({
      message: "Lobiler getirilirken bir hata oluştu.",
      error: error.message,
    });
  }
};

export const getLobbyByCode = async (req, res) => {
  try {
    const { lobbyCode } = req.params;
    if (!lobbyCode) {
      return res.status(400).json({ message: "Lobi kodu gereklidir." });
    }
    const lobby = await Lobby.findOne(
      { lobbyCode: lobbyCode },
      { password: 0 }
    ).lean();

    if (!lobby) {
      return res.status(404).json({ message: "Lobi bulunamadı." });
    }
    const lobbyWithPasswordCheck = await Lobby.findOne(
      { lobbyCode: lobbyCode },
      { password: 1 }
    ).lean();

    const isPasswordProtected = !!lobbyWithPasswordCheck?.password;

    const membersWithDetails = (lobby.members || []).map((member) => ({
      id: member.id,
      name: member.name,
      avatar: member.avatar,
      isHost: member.id === lobby.createdBy,
    }));

    res.status(200).json({
      message: "Lobi bilgileri başarıyla getirildi.",
      lobby: {
        ...lobby,
        isPasswordProtected: isPasswordProtected,
        members: membersWithDetails,
      },
    });
  } catch (error) {
    console.error("Lobi kodu ile getirme hatası:", error);
    res.status(500).json({
      message: "Lobi bilgileri getirilirken bir hata oluştu.",
      error: error.message,
    });
  }
};

export const createLobby = async (req, res) => {
  const {
    lobbyName,
    lobbyType,
    startTime,
    endTime,
    password,
    game,
    maxMembers,
  } = req.body;
  const user = req.user;

  try {
    const existingLobby = await Lobby.findOne({
      createdBy: user.id,
      isActive: true,
    });
    if (existingLobby) {
      return res.status(400).json({
        message:
          "Zaten aktif bir lobiniz var. Aynı anda birden fazla lobi oluşturamazsınız.",
      });
    }

    if (
      !lobbyName?.trim() ||
      !lobbyType ||
      !game ||
      !maxMembers ||
      maxMembers <= 0
    ) {
      return res.status(400).json({
        message:
          "Lobi adı, türü, oyun ve maksimum üye sayısı zorunludur. Maksimum üye sayısı en az 1 olmalıdır.",
      });
    }

    if (lobbyType === "event") {
      if (!startTime || !endTime) {
        return res.status(400).json({
          message: "Etkinlik lobisi için başlangıç ve bitiş zamanı zorunludur.",
        });
      }

      const startTimeDate = new Date(startTime);
      const endTimeDate = new Date(endTime);

      if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) {
        return res
          .status(400)
          .json({ message: "Geçersiz başlangıç veya bitiş zamanı formatı." });
      }

      if (startTimeDate >= endTimeDate) {
        return res.status(400).json({
          message: "Başlangıç zamanı, bitiş zamanından önce olmalıdır.",
        });
      }

      const now = new Date();
      if (startTimeDate < now) {
        return res.status(400).json({
          message: "Başlangıç zamanı gelecekte olmalıdır.",
        });
      }
    }

    const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;

    const lobbyId = generateLobbyId();
    const lobbyCode = generateLobbyCode();

    const newLobby = new Lobby({
      id: lobbyId,
      createdBy: user.id,
      lobbyName,
      lobbyType,
      startTime: lobbyType === "event" ? new Date(startTime) : null,
      endTime: lobbyType === "event" ? new Date(endTime) : null,
      password: hashedPassword,
      game,
      maxMembers,
      members: [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isHost: true,
        },
      ],
      lobbyCode: lobbyCode,
      isActive: true,
      expiryTime: null,
    });

    if (lobbyType === "event") {
      const startTimeMs = new Date(startTime).getTime();
      const endTimeMs = new Date(endTime).getTime();
      const now = Date.now();

      if (startTimeMs > now) {
        const startTimer = setTimeout(async () => {
          try {
            const currentLobby = await Lobby.findOne({
              id: lobbyId,
              isActive: true,
            }).lean();
            if (currentLobby) {
              const memberIds = currentLobby.members.map((member) => member.id);

              broadcastLobbyEvent(
                lobbyCode,
                "EVENT_START_NOTIFICATION",
                {
                  lobbyId: lobbyId,
                  lobbyName: lobbyName,
                  lobbyCode: lobbyCode,
                  message: `Etkinlik "${lobbyName}" başladı!`,
                  game: game,
                  startTime: startTime,
                  endTime: endTime,
                },
                memberIds
              );
            }
          } catch (error) {
            console.error("Etkinlik başlangıç zamanlayıcı hatası:", error);
          }
        }, startTimeMs - now);

        lobbyTimers.set(`start_${lobbyId}`, startTimer);
      }

      const endTimer = setTimeout(async () => {
        try {
          const currentLobby = await Lobby.findOne({
            id: lobbyId,
            isActive: true,
          }).lean();
          if (currentLobby) {
            broadcastLobbyEvent(
              lobbyCode,
              "LOBBY_REMOVED",
              {
                lobbyCode: lobbyCode,
                reason: "Etkinlik sona erdi",
                lobbyId: currentLobby.id,
              },
              null
            );
            await Lobby.deleteOne({ id: currentLobby.id });
          }
        } catch (error) {
          console.error("Etkinlik bitiş zamanlayıcı hatası:", error);
        }
      }, endTimeMs - now);

      lobbyTimers.set(`end_${lobbyId}`, endTimer);
    }

    await newLobby.save();

    broadcastLobbyEvent(lobbyCode, "LOBBY_CREATED", newLobby.toObject());

    res.status(201).json({
      message: "Lobi başarıyla oluşturuldu.",
      lobby: newLobby.toObject(),
      lobbyLink: `${FRONTEND_URL}/lobby/${lobbyCode}`,
      members: newLobby.members,
    });
  } catch (error) {
    console.error("Lobi oluşturma hatası:", error);
    res.status(500).json({
      message: "Lobi oluşturulurken bir hata oluştu.",
      error: error.message,
    });
  }
};
export const joinLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const { password } = req.body;
  const user = req.user;

  try {
    if (!lobbyCode) {
      return res.status(400).json({ message: "Lobi kodu gereklidir." });
    }

    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });

    if (!lobby) {
      return res
        .status(404)
        .json({ message: "Lobi bulunamadı veya aktif değil." });
    }

    const isUserAlreadyInLobbyForGameCheck = lobby.members.some(
      (member) => member.id.toString() === user.id.toString()
    );

    if (!isUserAlreadyInLobbyForGameCheck) {
      let gameInProgress = false;
      let gameTypeMessage = "";

      if (lobby.game === "1") {
        const bingoGame = await getBingoGameFromRedis(lobbyCode);
        if (bingoGame && bingoGame.gameStarted && !bingoGame.gameEnded) {
          gameInProgress = true;
          gameTypeMessage = "Tombola";
        }
      } else if (lobby.game === "2") {
        const hangmanGame = await getHangmanGameFromRedis(lobbyCode);
        if (hangmanGame && hangmanGame.gameStarted && !hangmanGame.gameEnded) {
          gameInProgress = true;
          gameTypeMessage = "Adam Asmaca";
        }
      }

      if (gameInProgress) {
        return res.status(403).json({
          errorKey: "lobby.gameInProgress",
          errorParams: { gameTypeIdentifier: gameTypeMessage },
        });
      }
    }

    if (
      lobby.password &&
      (!password || !(await bcrypt.compare(password, lobby.password)))
    ) {
      return res.status(401).json({
        errorKey: "lobby.invalidPassword",
        message: "Geçersiz şifre.",
      });
    }

    let userIsPlayingActiveBingo = false;
    const scanOptions = {
      MATCH: "bingo:game:*",
      COUNT: 100,
    };

    if (redisClient.isOpen) {
      for await (const key of redisClient.scanIterator(scanOptions)) {
        if (typeof key !== "string") {
          continue;
        }
        const currentLobbyCodeFromKey = key.substring("bingo:game:".length);
        const bGame = await getBingoGameFromRedis(currentLobbyCodeFromKey);
        if (
          bGame &&
          bGame.players &&
          bGame.players[user.id] &&
          bGame.gameStarted &&
          !bGame.gameEnded
        ) {
          userIsPlayingActiveBingo = true;
          break;
        }
      }
    } else {
      console.warn(
        "Redis client is not open, skipping userIsPlayingActiveBingo check via scan."
      );
    }

    if (user.id.toString() === lobby.createdBy.toString()) {
      const hostReturnTimerKey = `host_leave_${lobby.id.toString()}`;
      const existingTimer = lobbyTimers.get(hostReturnTimerKey);

      if (existingTimer) {
        clearTimeout(existingTimer);
        lobbyTimers.delete(hostReturnTimerKey);

        const hostMemberIndex = lobby.members.findIndex(
          (member) => member.id.toString() === user.id.toString()
        );
        if (hostMemberIndex !== -1) {
          lobby.members[hostMemberIndex].isHost = true;
          lobby.members[hostMemberIndex].isPlayingBingo =
            userIsPlayingActiveBingo;
        } else {
          lobby.members.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            isHost: true,
            isPlayingBingo: userIsPlayingActiveBingo,
          });
        }
        await lobby.save();

        const otherMemberIds = lobby.members
          .filter((member) => member.id.toString() !== user.id.toString())
          .map((member) => member.id.toString());

        if (otherMemberIds.length > 0) {
          broadcastLobbyEvent(
            lobbyCode,
            "HOST_RETURNED",
            {
              userId: user.id,
              name: user.name,
              avatar: user.avatar,
              lobbyCode: lobbyCode,
              lobbyName: lobby.lobbyName,
              isHost: true,
              isPlayingBingo: userIsPlayingActiveBingo,
            },
            otherMemberIds
          );
        }
        broadcastLobbyEvent(
          null,
          "LOBBY_MEMBER_COUNT_UPDATED",
          {
            lobbyCode: lobby.lobbyCode,
            memberCount: lobby.members.length,
            maxMembers: lobby.maxMembers,
            members: lobby.members.map((m) => ({
              id: m.id,
              name: m.name,
              avatar: m.avatar,
              isHost: m.isHost,
              isPlayingBingo: m.isPlayingBingo === true,
            })),
          },
          null
        );
        return res.status(200).json({
          message: "Lobiye host olarak geri döndünüz.",
          lobby: lobby.toObject(),
        });
      }
    }

    if (
      lobby.maxMembers &&
      lobby.members.length >= lobby.maxMembers &&
      !lobby.members.some((m) => m.id.toString() === user.id.toString())
    ) {
      return res.status(400).json({ message: "Lobi dolu." });
    }

    const isUserAlreadyInLobby = lobby.members.some(
      (member) => member.id.toString() === user.id.toString()
    );

    if (isUserAlreadyInLobby) {
      if (user.id.toString() !== lobby.createdBy.toString()) {
        return res.status(400).json({
          message: "Zaten bu lobidesiniz.",
        });
      }
      const memberIndex = lobby.members.findIndex(
        (m) => m.id.toString() === user.id.toString()
      );
      if (memberIndex !== -1) {
        lobby.members[memberIndex].isPlayingBingo = userIsPlayingActiveBingo;
        await lobby.save();
      }
    } else {
      lobby.members.push({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isHost: user.id.toString() === lobby.createdBy.toString(),
        isPlayingBingo: userIsPlayingActiveBingo,
      });
      await lobby.save();
    }

    const lobbyMembersExceptCurrentUser = lobby.members.filter(
      (member) => member.id.toString() !== user.id.toString()
    );
    const memberIdsToNotify = lobbyMembersExceptCurrentUser.map((member) =>
      member.id.toString()
    );

    if (!isUserAlreadyInLobby && memberIdsToNotify.length > 0) {
      broadcastLobbyEvent(
        lobbyCode,
        "USER_JOINED",
        {
          userId: user.id,
          name: user.name,
          avatar: user.avatar,
          lobbyName: lobby.lobbyName,
          isHost: user.id.toString() === lobby.createdBy.toString(),
          isPlayingBingo: userIsPlayingActiveBingo,
        },
        memberIdsToNotify
      );
    }

    broadcastLobbyEvent(
      null,
      "LOBBY_MEMBER_COUNT_UPDATED",
      {
        lobbyCode: lobby.lobbyCode,
        memberCount: lobby.members.length,
        maxMembers: lobby.maxMembers,
        members: lobby.members.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          isHost: m.isHost,
          isPlayingBingo: m.isPlayingBingo === true,
        })),
      },
      null
    );

    let message = "Lobiye başarıyla katıldınız.";
    if (
      isUserAlreadyInLobby &&
      user.id.toString() === lobby.createdBy.toString()
    ) {
      const hostReturnTimerKey = `host_leave_${lobby.id.toString()}`;
      if (!lobbyTimers.get(hostReturnTimerKey)) {
        message = "Host olarak lobi bilgileriniz güncellendi.";
      }
    }

    res.status(200).json({
      message: message,
      lobby: lobby.toObject(),
      isPlayingActiveBingo: userIsPlayingActiveBingo,
    });
  } catch (error) {
    console.error("Lobiye katılma hatası:", error);
    res.status(500).json({
      message: "Lobiye katılırken bir hata oluştu.",
      error: error.message,
    });
  }
};

export const leaveLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const user = req.user;

  try {
    if (!lobbyCode) {
      return res.status(400).json({ message: "Lobi kodu gereklidir." });
    }
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });

    if (!lobby || !lobby.isActive) {
      return res.status(404).json({ message: "Aktif lobi bulunamadı." });
    }

    const userIndex = lobby.members.findIndex(
      (member) => member.id.toString() === user.id.toString()
    );
    if (userIndex === -1) {
      return res.status(400).json({ message: "Bu lobide değilsiniz." });
    }

    const removedUser = lobby.members.splice(userIndex, 1)[0];
    const wasHost = removedUser.id.toString() === lobby.createdBy.toString();
    const playerIdToRemove = removedUser.id.toString();

    if (lobby.game === "1") {
      const bingoGame = await getBingoGameFromRedis(lobbyCode);
      if (
        bingoGame &&
        bingoGame.players &&
        bingoGame.players[playerIdToRemove]
      ) {
        if (bingoGame.gameStarted && !bingoGame.gameEnded) {
          await handleBingoPlayerLeaveMidGame(lobbyCode, playerIdToRemove);
        } else if (!bingoGame.gameStarted) {
          await handleBingoPlayerLeavePreGame(lobbyCode, playerIdToRemove);
        }
      }
    } else if (lobby.game === "2") {
      const hangmanGame = await getHangmanGameFromRedis(lobbyCode);
      if (
        hangmanGame &&
        hangmanGame.players &&
        hangmanGame.players[playerIdToRemove]
      ) {
        if (hangmanGame.gameStarted && !hangmanGame.gameEnded) {
          await handleHangmanPlayerLeaveMidGame(lobbyCode, playerIdToRemove);
        } else if (!hangmanGame.gameStarted) {
          await removePlayerFromHangmanPregame(lobbyCode, playerIdToRemove);
        }
      }
    }

    const remainingMemberIds = lobby.members.map((m) => m.id.toString());
    if (remainingMemberIds.length > 0) {
      broadcastLobbyEvent(
        lobbyCode,
        "USER_LEFT",
        {
          userId: removedUser.id.toString(),
          name: removedUser.name,
          wasHost: wasHost,
        },
        remainingMemberIds
      );
    }

    broadcastLobbyEvent(
      null,
      "LOBBY_MEMBER_COUNT_UPDATED",
      {
        lobbyCode: lobby.lobbyCode,
        memberCount: lobby.members.length,
        maxMembers: lobby.maxMembers,
        members: lobby.members.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          isHost: m.isHost,
          isPlayingBingo: m.isPlayingBingo === true,
        })),
      },
      null
    );

    if (wasHost && lobby.lobbyType === "normal") {
      if (lobby.members.length === 0) {
        if (lobbyTimers.has(`start_${lobby.id.toString()}`)) {
          clearTimeout(lobbyTimers.get(`start_${lobby.id.toString()}`));
          lobbyTimers.delete(`start_${lobby.id.toString()}`);
        }
        if (lobbyTimers.has(`end_${lobby.id.toString()}`)) {
          clearTimeout(lobbyTimers.get(`end_${lobby.id.toString()}`));
          lobbyTimers.delete(`end_${lobby.id.toString()}`);
        }
        if (lobbyTimers.has(`host_leave_${lobby.id.toString()}`)) {
          clearTimeout(lobbyTimers.get(`host_leave_${lobby.id.toString()}`));
          lobbyTimers.delete(`host_leave_${lobby.id.toString()}`);
        }
        if (lobby.game === "1") {
          await cleanupAndRemoveBingoGame(lobbyCode);
        } else if (lobby.game === "2") {
          await deleteHangmanGameFromRedis(lobbyCode);
        }
        await Lobby.deleteOne({ lobbyCode: lobbyCode });
      } else {
        const timerKey = `host_leave_${lobby.id.toString()}`;
        let existingTimer = lobbyTimers.get(timerKey);
        if (existingTimer) {
          clearTimeout(existingTimer);
          lobbyTimers.delete(timerKey);
        }

        const deletionTimer = setTimeout(async () => {
          try {
            const currentLobby = await Lobby.findOne({
              lobbyCode: lobbyCode,
            }).lean();
            if (currentLobby) {
              broadcastLobbyEvent(lobbyCode, "LOBBY_DELETED", {
                lobbyCode: lobbyCode,
                reason: "Host geri dönmediği için lobi kapatıldı.",
              });
              if (currentLobby.game === "1") {
                await cleanupAndRemoveBingoGame(lobbyCode);
              } else if (currentLobby.game === "2") {
                await deleteHangmanGameFromRedis(lobbyCode);
              }
              await Lobby.deleteOne({ lobbyCode: lobbyCode });
            }
          } catch (error) {
            console.error("Host ayrılma zamanlayıcısı (silme) hatası:", error);
          } finally {
            lobbyTimers.delete(timerKey);
          }
        }, 8 * 60 * 60 * 1000);
        lobbyTimers.set(timerKey, deletionTimer);
      }
    }

    if (lobby.members.length > 0 || !wasHost || lobby.lobbyType !== "normal") {
      await lobby.save();
    }

    res.status(200).json({
      message: "Lobiden başarıyla çıkıldı.",
    });
  } catch (error) {
    console.error("Lobiden ayrılma hatası:", error);
    res.status(500).json({
      message: "Lobiden ayrılırken bir hata oluştu.",
      error: error.message,
    });
  }
};

export const kickPlayerFromLobby = async (ws, data, sendToSpecificUser) => {
  const { lobbyCode, playerIdToKick } = data;
  const hostUserId = ws.userId;

  try {
    if (!lobbyCode || !playerIdToKick) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Lobi kodu ve atılacak oyuncu ID'si gereklidir.",
        })
      );
      return;
    }

    if (!hostUserId) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Bu işlem için yetkili kullanıcı bulunamadı.",
        })
      );
      return;
    }

    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });

    if (!lobby || !lobby.isActive) {
      ws.send(
        JSON.stringify({ type: "ERROR", message: "Aktif lobi bulunamadı." })
      );
      return;
    }

    if (lobby.createdBy.toString() !== hostUserId) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Sadece lobi sahibi oyuncu atabilir.",
        })
      );
      return;
    }

    if (playerIdToKick === hostUserId) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message:
            "Kendinizi lobiden atamazsınız. Ayrılmak için 'Lobiden Ayrıl' seçeneğini kullanın.",
        })
      );
      return;
    }

    const userIndex = lobby.members.findIndex(
      (member) => member.id.toString() === playerIdToKick
    );

    if (userIndex === -1) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Atılmak istenen oyuncu bu lobide değil.",
        })
      );
      console.error(
        `[KICK_PLAYER_ERROR] Player ${playerIdToKick} not found in lobby ${lobbyCode}. Members:`,
        JSON.stringify(lobby.members.map((m) => m.id.toString()))
      );
      return;
    }

    const memberToKick = lobby.members[userIndex];
    if (
      !memberToKick ||
      !memberToKick.id ||
      typeof memberToKick.name === "undefined"
    ) {
      console.error(
        `[KICK_PLAYER_ERROR] Critical: Member info for player at index ${userIndex} (ID: ${playerIdToKick}) is corrupt or missing ID/name. Member object:`,
        JSON.stringify(memberToKick)
      );
      ws.send(
        JSON.stringify({
          type: "ERROR",
          message: "Atılacak oyuncu bilgileri alınamadı.",
        })
      );
      return;
    }

    const actualKickedUserId = memberToKick.id.toString();
    const actualKickedUserName = memberToKick.name;

    lobby.members.splice(userIndex, 1);

    if (lobby.game === "1") {
      const bingoGame = await getBingoGameFromRedis(lobbyCode);
      if (
        bingoGame &&
        bingoGame.players &&
        bingoGame.players[actualKickedUserId]
      ) {
        if (bingoGame.gameStarted && !bingoGame.gameEnded) {
          await handleBingoPlayerLeaveMidGame(lobbyCode, actualKickedUserId);
        } else if (!bingoGame.gameStarted) {
          await handleBingoPlayerLeavePreGame(lobbyCode, actualKickedUserId);
        }
      }
    } else if (lobby.game === "2") {
      const hangmanGame = await getHangmanGameFromRedis(lobbyCode);
      if (
        hangmanGame &&
        hangmanGame.players &&
        hangmanGame.players[actualKickedUserId]
      ) {
        if (hangmanGame.gameStarted && !hangmanGame.gameEnded) {
          await handleHangmanPlayerLeaveMidGame(lobbyCode, actualKickedUserId);
        } else if (!hangmanGame.gameStarted) {
          await removePlayerFromHangmanPregame(lobbyCode, actualKickedUserId);
        }
      }
    }

    await lobby.save();

    const remainingMemberIds = lobby.members.map((m) => m.id.toString());

    if (remainingMemberIds.length > 0) {
      if (typeof broadcastLobbyEvent === "function") {
        const payload = {
          kickedUserId: actualKickedUserId,
          kickedUserName: actualKickedUserName,
          lobbyCode: lobby.lobbyCode,
        };

        broadcastLobbyEvent(
          lobbyCode,
          "PLAYER_KICKED_BY_HOST",
          payload,
          remainingMemberIds
        );
      } else {
        console.error(
          "[KICK_PLAYER_ERROR] broadcastLobbyEvent is not initialized or not a function for PLAYER_KICKED_BY_HOST."
        );
      }
    }

    if (typeof broadcastLobbyEvent === "function") {
      const memberCountPayload = {
        lobbyCode: lobby.lobbyCode,
        memberCount: lobby.members.length,
        maxMembers: lobby.maxMembers,
        members: lobby.members.map((m) => ({
          id: m.id.toString(),
          name: m.name,
          avatar: m.avatar,
          isHost: m.id.toString() === lobby.createdBy.toString(),
          isPlayingBingo: m.isPlayingBingo === true,
        })),
      };
      broadcastLobbyEvent(
        null,
        "LOBBY_MEMBER_COUNT_UPDATED",
        memberCountPayload,
        null
      );
    } else {
      console.error(
        "[KICK_PLAYER_ERROR] broadcastLobbyEvent is not initialized or not a function for LOBBY_MEMBER_COUNT_UPDATED."
      );
    }

    sendToSpecificUser(playerIdToKick, {
      type: "USER_KICKED",
      lobbyCode: lobbyCode,
      reason: "Lobi sahibi tarafından lobiden çıkarıldınız.",
    });
  } catch (error) {
    console.error(
      `[KICK_PLAYER_FATAL] Oyuncu atma hatası (kickPlayerFromLobby) for player ${playerIdToKick} in lobby ${lobbyCode}:`,
      error
    );
    ws.send(
      JSON.stringify({
        type: "ERROR",
        message: "Oyuncu atılırken bir sunucu hatası oluştu.",
      })
    );
  }
};

export const deleteLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const user = req.user;

  try {
    if (!lobbyCode) {
      return res.status(400).json({ message: "Lobi kodu gereklidir." });
    }
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode });

    if (!lobby) {
      return res.status(404).json({ message: "Lobi bulunamadı." });
    }

    if (lobby.createdBy.toString() !== user.id.toString()) {
      return res.status(403).json({ message: "Bu lobiyi silme yetkiniz yok." });
    }

    if (lobby.game === "1") {
      const bingoGame = await getBingoGameFromRedis(lobbyCode);
      if (bingoGame) {
        if (typeof broadcastLobbyEvent === "function") {
          broadcastLobbyEvent(
            lobby.lobbyCode,
            "GAME_TERMINATED",
            {
              lobbyCode: lobby.lobbyCode,
              message: "Oyun iptal edildi (Lobi silindi).",
            },
            Object.keys(bingoGame.players || {})
          );
        }
        await cleanupAndRemoveBingoGame(lobbyCode);
      }
    } else if (lobby.game === "2") {
      const hangmanGame = await getHangmanGameFromRedis(lobbyCode);
      if (hangmanGame) {
        if (hangmanGame.turnTimer) {
          // Assuming hangmanGame object from Redis might not have .turnTimer directly
          // If hangman.controller manages timers outside Redis, this part might need adjustment
          // or timer clearing would be handled by the game ending logic in hangman.controller
          // For now, let's assume if it was fetched and had an in-memory timer ID, it would be cleared here.
          // However, timers are usually not stored in Redis.
        }
        // Notify players if game was in progress
        if (hangmanGame.gameStarted && !hangmanGame.gameEnded) {
          // This broadcast should ideally use the hangman.controller's broadcastToGame
          // to properly format the HANGMAN_GAME_TERMINATED message.
          // For simplicity here, a direct ws.send loop is shown if player.ws were available.
          // In reality, you'd call a function from hangman.controller to end and notify.
          // e.g., await terminateHangmanGame(lobbyCode, "Lobi silindi, oyun sonlandırıldı.");
          // For now, let's assume a placeholder for direct notification.
          // This part is complex as `hangmanGame` from Redis won't have `ws` objects.
          // A proper implementation would fetch active player IDs and use a central broadcast mechanism.
        }
        await deleteHangmanGameFromRedis(lobbyCode);
      }
    }

    if (
      lobby.members &&
      lobby.members.length > 0 &&
      typeof broadcastLobbyEvent === "function"
    ) {
      broadcastLobbyEvent(
        lobby.lobbyCode,
        "LOBBY_DELETED",
        {
          lobbyCode: lobby.lobbyCode,
          message: "Lobi silindi.",
        },
        lobby.members.map((member) => member.id.toString())
      );
    }

    if (lobbyTimers.has(`start_${lobby.id.toString()}`)) {
      clearTimeout(lobbyTimers.get(`start_${lobby.id.toString()}`));
      lobbyTimers.delete(`start_${lobby.id.toString()}`);
    }
    if (lobbyTimers.has(`end_${lobby.id.toString()}`)) {
      clearTimeout(lobbyTimers.get(`end_${lobby.id.toString()}`));
      lobbyTimers.delete(`end_${lobby.id.toString()}`);
    }
    if (lobbyTimers.has(`host_leave_${lobby.id.toString()}`)) {
      clearTimeout(lobbyTimers.get(`host_leave_${lobby.id.toString()}`));
      lobbyTimers.delete(`host_leave_${lobby.id.toString()}`);
    }

    const deletionResult = await Lobby.deleteOne({ lobbyCode: lobbyCode });

    if (deletionResult.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "Lobi silinemedi, muhtemelen zaten silinmiş." });
    }

    res.status(200).json({
      message: "Lobi başarıyla veritabanından kalıcı olarak silindi.",
      deletedLobbyCode: lobbyCode,
    });
  } catch (error) {
    console.error("Lobi silme hatası:", error);
    res.status(500).json({
      message: "Lobi silinirken bir hata oluştu.",
      error: error.message,
    });
  }
};

export const updateLobby = async (req, res) => {
  const { lobbyCode } = req.params;
  const {
    lobbyName,
    maxMembers,
    game,
    password,
    startTime,
    endTime,
    lobbyType,
  } = req.body;
  const user = req.user;

  try {
    if (!lobbyCode) {
      return res.status(400).json({ message: "Lobi kodu gereklidir." });
    }
    const lobby = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });

    if (!lobby) {
      return res.status(404).json({ message: "Lobi bulunamadı." });
    }

    if (lobby.createdBy.toString() !== user.id.toString()) {
      return res
        .status(403)
        .json({ message: "Bu lobiyi güncelleme yetkiniz yok." });
    }

    let detailsChanged = false;

    if (lobbyName !== undefined) {
      if (!lobbyName?.trim()) {
        return res.status(400).json({ message: "Lobi adı boş olamaz." });
      }
      if (lobby.lobbyName !== lobbyName) {
        lobby.lobbyName = lobbyName;
        detailsChanged = true;
      }
    }

    if (game !== undefined) {
      if (!game) {
        return res.status(400).json({ message: "Oyun türü boş olamaz." });
      }
      if (lobby.game !== game) {
        lobby.game = game;
        detailsChanged = true;
      }
    }

    if (maxMembers !== undefined) {
      if (typeof maxMembers !== "number" || maxMembers <= 0) {
        return res
          .status(400)
          .json({ message: "Maksimum üye sayısı pozitif bir sayı olmalıdır." });
      }

      if (lobby.members && lobby.members.length > maxMembers) {
        return res.status(400).json({
          messageKey: "lobby.error.maxMembersLessThanCurrent",
          messageParams: {
            newMaxMembers: maxMembers,
            currentMembers: lobby.members.length,
          },
        });
      }

      if (lobby.maxMembers !== maxMembers) {
        lobby.maxMembers = maxMembers;
        detailsChanged = true;
      }
    }

    if (password !== undefined) {
      const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
      lobby.password = hashedPassword;
      detailsChanged = true;
    }

    let eventConfigChanged = false;
    const originalLobbyType = lobby.lobbyType;
    const originalStartTime = lobby.startTime;
    const originalEndTime = lobby.endTime;

    if (lobbyType !== undefined) {
      if (!["normal", "event"].includes(lobbyType)) {
        return res.status(400).json({ message: "Geçersiz lobi türü." });
      }
      if (lobby.lobbyType !== lobbyType) {
        lobby.lobbyType = lobbyType;
        eventConfigChanged = true;
      }
    }

    if (lobby.lobbyType === "event") {
      let effectiveStartTime = lobby.startTime;
      let effectiveEndTime = lobby.endTime;

      if (startTime !== undefined) {
        if (!startTime && lobby.lobbyType === "event") {
          return res.status(400).json({
            message: "Etkinlik lobisi için başlangıç zamanı zorunludur.",
          });
        }
        const startTimeDate = new Date(startTime);
        if (isNaN(startTimeDate.getTime())) {
          return res
            .status(400)
            .json({ message: "Geçersiz başlangıç zamanı formatı." });
        }
        // Eğer tip 'event'e yeni değiştiriliyorsa veya startTime gerçekten güncelleniyorsa kontrol et
        if (
          (originalLobbyType !== "event" && lobby.lobbyType === "event") ||
          String(originalStartTime) !== String(startTimeDate)
        ) {
          if (startTimeDate < new Date()) {
            return res
              .status(400)
              .json({ message: "Başlangıç zamanı gelecekte olmalıdır." });
          }
        }
        effectiveStartTime = startTimeDate;
      }

      if (endTime !== undefined) {
        if (!endTime && lobby.lobbyType === "event") {
          return res
            .status(400)
            .json({ message: "Etkinlik lobisi için bitiş zamanı zorunludur." });
        }
        const endTimeDate = new Date(endTime);
        if (isNaN(endTimeDate.getTime())) {
          return res
            .status(400)
            .json({ message: "Geçersiz bitiş zamanı formatı." });
        }
        effectiveEndTime = endTimeDate;
      }

      if (!effectiveStartTime) {
        return res.status(400).json({
          message: "Etkinlik lobisi için başlangıç zamanı zorunludur.",
        });
      }
      if (!effectiveEndTime) {
        return res
          .status(400)
          .json({ message: "Etkinlik lobisi için bitiş zamanı zorunludur." });
      }
      if (effectiveEndTime <= effectiveStartTime) {
        return res.status(400).json({
          message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır.",
        });
      }

      if (String(lobby.startTime) !== String(effectiveStartTime)) {
        lobby.startTime = effectiveStartTime;
        eventConfigChanged = true;
      }
      if (String(lobby.endTime) !== String(effectiveEndTime)) {
        lobby.endTime = effectiveEndTime;
        eventConfigChanged = true;
      }
    } else if (lobby.lobbyType === "normal") {
      if (lobby.startTime !== null || lobby.endTime !== null) {
        lobby.startTime = null;
        lobby.endTime = null;
        eventConfigChanged = true;
      }
    }

    if (!detailsChanged && eventConfigChanged) {
      detailsChanged = true;
    }

    if (eventConfigChanged) {
      if (lobbyTimers.get(`start_${lobby.id}`)) {
        clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
        lobbyTimers.delete(`start_${lobby.id}`);
      }
      if (lobbyTimers.get(`end_${lobby.id}`)) {
        clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
        lobbyTimers.delete(`end_${lobby.id}`);
      }

      if (lobby.lobbyType === "event" && lobby.startTime && lobby.endTime) {
        const startTimeMs = lobby.startTime.getTime();
        const endTimeMs = lobby.endTime.getTime();
        const now = Date.now();

        if (startTimeMs > now) {
          const startTimer = setTimeout(async () => {
            try {
              const currentLobbyState = await Lobby.findOne({
                _id: lobby._id,
                isActive: true,
              }).lean();
              if (currentLobbyState) {
                broadcastLobbyEvent(
                  currentLobbyState.lobbyCode,
                  "EVENT_START_NOTIFICATION",
                  {
                    lobbyId: currentLobbyState._id,
                    lobbyName: currentLobbyState.lobbyName,
                    lobbyCode: currentLobbyState.lobbyCode,
                    message: `Etkinlik "${currentLobbyState.lobbyName}" başladı!`,
                    game: currentLobbyState.game,
                    startTime: currentLobbyState.startTime,
                    endTime: currentLobbyState.endTime,
                  },
                  currentLobbyState.members.map((member) =>
                    member.id.toString()
                  )
                );
              }
            } catch (error) {
              console.error("Etkinlik başlangıç zamanlayıcı hatası:", error);
            }
          }, startTimeMs - now);
          lobbyTimers.set(`start_${lobby.id}`, startTimer);
        }

        if (endTimeMs > now) {
          const endTimer = setTimeout(async () => {
            try {
              const lobbyToEnd = await Lobby.findOne({
                _id: lobby._id,
                isActive: true,
              });
              if (lobbyToEnd) {
                broadcastLobbyEvent(
                  lobbyToEnd.lobbyCode,
                  "LOBBY_REMOVED",
                  {
                    lobbyCode: lobbyToEnd.lobbyCode,
                    reason: "Etkinlik sona erdi",
                    lobbyId: lobbyToEnd._id,
                  },
                  null
                );
                await Lobby.deleteOne({ _id: lobbyToEnd._id });
                lobbyTimers.delete(`start_${lobbyToEnd._id}`);
                lobbyTimers.delete(`end_${lobbyToEnd._id}`);
              }
            } catch (error) {
              console.error("Etkinlik bitiş zamanlayıcı hatası:", error);
            }
          }, endTimeMs - now);
          lobbyTimers.set(`end_${lobby.id}`, endTimer);
        }
      }
    }

    if (!detailsChanged && !eventConfigChanged) {
      return res.status(200).json({
        message: "Lobide herhangi bir değişiklik yapılmadı.",
        lobby: lobby.toObject(),
      });
    }

    await lobby.save();

    broadcastLobbyEvent(lobbyCode, "LOBBY_UPDATED", lobby.toObject());

    res.status(200).json({
      message: "Lobi başarıyla güncellendi.",
      lobby: lobby.toObject(),
    });
  } catch (error) {
    console.error("Lobi güncelleme hatası:", error);
    res.status(500).json({
      message: "Lobi güncellenirken bir hata oluştu.",
      error: error.message,
    });
  }
};
