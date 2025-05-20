import bcrypt from 'bcrypt';
import Lobby from '../models/lobby.model.js';
import { bingoGames, broadcastToGame as broadcastToBingoGame, handleBingoPlayerLeaveMidGame, handleBingoPlayerLeavePreGame } from './bingo.game.controller.js';
import { hangmanGames, broadcastToGame as broadcastToHangmanGame, getSharedGameState as getHangmanSharedGameState, handleHangmanPlayerLeaveMidGame, removePlayerFromHangmanPregame } from './hangman.controller.js'; 
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
        let eventQuery = { lobbyType: "event", isActive: true, endTime: { $gt: new Date() } };
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


        const eventLobbies = eventType === "normal" ? [] : await Lobby.find(eventQuery).lean();
        const normalLobbies = eventType === "event" ? [] : await Lobby.find(normalQuery).lean();


        const sortedEventLobbies = eventLobbies.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
        const filteredLobbies = [...sortedEventLobbies, ...normalLobbies];


        res.status(200).json({
            message: "Lobiler başarıyla getirildi.",
            lobbies: filteredLobbies,
        });

    } catch (error) {
        console.error("Lobi getirme hatası:", error);
        res.status(500).json({ message: "Lobiler getirilirken bir hata oluştu.", error: error.message });
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
        res.status(500).json({ message: "Lobi bilgileri getirilirken bir hata oluştu.", error: error.message });
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
        const existingLobby = await Lobby.findOne({ createdBy: user.id, isActive: true }); 
        if (existingLobby) {
            return res.status(400).json({
                message: "Zaten aktif bir lobiniz var. Aynı anda birden fazla lobi oluşturamazsınız.",
            });
        }

        if (!lobbyName?.trim() || !lobbyType || !game || !maxMembers || maxMembers <= 0) {
            return res.status(400).json({
                message: "Lobi adı, türü, oyun ve maksimum üye sayısı zorunludur. Maksimum üye sayısı en az 1 olmalıdır.",
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
                return res.status(400).json({ message: "Geçersiz başlangıç veya bitiş zamanı formatı." });
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
            members: [{
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                isHost: true,
            }],
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
                        const currentLobby = await Lobby.findOne({ id: lobbyId, isActive: true }).lean(); 
                        if (currentLobby) {
                            const memberIds = currentLobby.members.map(member => member.id);

                            broadcastLobbyEvent(lobbyCode, "EVENT_START_NOTIFICATION", {
                                lobbyId: lobbyId,
                                lobbyName: lobbyName,
                                lobbyCode: lobbyCode,
                                message: `Etkinlik "${lobbyName}" başladı!`, 
                                game: game,
                                startTime: startTime,
                                endTime: endTime
                            }, memberIds);
                        }
                    } catch (error) {
                        console.error("Etkinlik başlangıç zamanlayıcı hatası:", error); 
                    }
                }, startTimeMs - now);

                lobbyTimers.set(`start_${lobbyId}`, startTimer);
            }

            const endTimer = setTimeout(async () => {
                try {
                    const currentLobby = await Lobby.findOne({ id: lobbyId, isActive: true }).lean(); 
                    if (currentLobby) {
                        broadcastLobbyEvent(
                            lobbyCode,
                            "LOBBY_REMOVED",
                            {
                                lobbyCode: lobbyCode,
                                reason: "Etkinlik sona erdi", 
                                lobbyId: currentLobby.id
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
        res.status(500).json({ message: "Lobi oluşturulurken bir hata oluştu.", error: error.message });
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
            return res.status(404).json({ message: "Lobi bulunamadı veya aktif değil." });
        }

        const isUserAlreadyInLobbyForGameCheck = lobby.members.some(
            (member) => member.id === user.id
        );

        if (!isUserAlreadyInLobbyForGameCheck) {
            let gameInProgress = false;
            let gameTypeMessage = "";

            if (lobby.game === '1') {
                const bingoGame = bingoGames[lobbyCode];
         
                if (bingoGame && bingoGame.gameStarted && !bingoGame.gameEnded) {
                    gameInProgress = true;
                    gameTypeMessage = "Bingo";
                }
            } else if (lobby.game === '2') {
                const hangmanGame = hangmanGames[lobbyCode];
                if (hangmanGame && hangmanGame.gameStarted && !hangmanGame.gameEnded) {
                    gameInProgress = true;
                    gameTypeMessage = "Hangman";
                }
            }

            if (gameInProgress) {
                return res.status(403).json({
                    message: `Bu lobide aktif bir ${gameTypeMessage} devam ediyor. Lütfen oyunun bitmesini bekleyin veya başka bir lobiye katılın.`
                });
            }
        }
        if (lobby.password && !bcrypt.compareSync(password, lobby.password)) {
            return res.status(401).json({ message: "Geçersiz şifre." });
        }

        if (user.id === lobby.createdBy) {
            const hostReturnTimerKey = `host_leave_${lobby.id}`;
            const existingTimer = lobbyTimers.get(hostReturnTimerKey);

            if (existingTimer) {
                clearTimeout(existingTimer);
                lobbyTimers.delete(hostReturnTimerKey);

                const hostMemberIndex = lobby.members.findIndex(
                    (member) => member.id === user.id
                );
                if (hostMemberIndex !== -1) {
                    lobby.members[hostMemberIndex].isHost = true;
                } else {
                    lobby.members.push({
                        id: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        isHost: true,
                    });
                }
                await lobby.save();

                const otherMemberIds = lobby.members
                .filter(member => member.id.toString() !== user.id.toString())
                .map(member => member.id);

                if (otherMemberIds.length > 0) {
                    broadcastLobbyEvent(lobbyCode, "HOST_RETURNED", {
                        userId: user.id,
                        name: user.name,
                        avatar: user.avatar,
                        lobbyCode: lobbyCode,
                        lobbyName: lobby.lobbyName,
                        isHost: true,
                    }, otherMemberIds);
                }
                broadcastLobbyEvent(
                    null,
                    "LOBBY_MEMBER_COUNT_UPDATED",
                    {
                        lobbyCode: lobby.lobbyCode,
                        memberCount: lobby.members.length,
                        maxMembers: lobby.maxMembers,
                        members: lobby.members.map(m => ({
                            id: m.id,
                            name: m.name,
                            avatar: m.avatar,
                            isHost: m.isHost
                         }))
                    },
                    null
                );
                return res.status(200).json({
                    message: "Lobiye host olarak geri döndünüz.",
                    lobby: lobby.toObject(),
                });
            }
        }

        if (lobby.maxMembers && lobby.members.length >= lobby.maxMembers) {
            return res.status(400).json({ message: "Lobi dolu." });
        }

        const isUserAlreadyInLobby = lobby.members.some(
            (member) => member.id === user.id
        );

        if (isUserAlreadyInLobby) {
             if (user.id !== lobby.createdBy) {
                return res.status(400).json({ message: "Zaten bu lobidesiniz." });
             }
        }

        if (!isUserAlreadyInLobby) { // Sadece kullanıcı zaten lobide değilse ekle
            lobby.members.push({
                id: user.id,
                name: user.name,
                avatar: user.avatar,
                isHost: false,
            });
            await lobby.save();
        } else if (isUserAlreadyInLobby && user.id === lobby.createdBy) {
            // Host zaten lobideyse ve timer yoksa, tekrar save etmeye gerek yok
            // Ancak lobi bilgisini döndürebiliriz.
            // Bu durum yukarıdaki `if (user.id === lobby.createdBy)` bloğunda timer olmadığında ele alınabilir.
            // Şimdilik, eğer host ise ve zaten lobideyse, mevcut lobi bilgisini döndürmek için devam etsin.
        }


        const lobbyMembersExceptNewUser = lobby.members.filter(member => member.id !== user.id);
        const memberIdsToNotify = lobbyMembersExceptNewUser.map(member => member.id);

        // Sadece yeni katılan kullanıcılar için USER_JOINED event'i gönder
        if (!isUserAlreadyInLobby && memberIdsToNotify.length > 0) {
            broadcastLobbyEvent(lobbyCode, "USER_JOINED", {
                userId: user.id,
                name: user.name,
                avatar: user.avatar,
                lobbyName: lobby.lobbyName,
            }, memberIdsToNotify);
        }

        // LOBBY_MEMBER_COUNT_UPDATED her zaman gönderilsin (yeni katılım, host geri dönüşü vb.)
        broadcastLobbyEvent(
            null,
            "LOBBY_MEMBER_COUNT_UPDATED",
            {
                lobbyCode: lobby.lobbyCode,
                memberCount: lobby.members.length,
                maxMembers: lobby.maxMembers,
                members: lobby.members.map(m => ({
                    id: m.id,
                    name: m.name,
                    avatar: m.avatar,
                    isHost: m.isHost
                 }))
            },
            null
        );

        // Host olmayan ve zaten lobide olan bir kullanıcı buraya gelirse (yukarıdaki if ile engellendi)
        // yine de lobi bilgisini döndürür, ancak "Zaten bu lobidesiniz" mesajı daha önce gönderilmiş olur.
        // Yeni katılan veya host olarak geri dönen için mesaj daha uygun.
        let message = "Lobiye başarıyla katıldınız.";
        if (isUserAlreadyInLobby && user.id === lobby.createdBy && !lobbyTimers.get(`host_leave_${lobby.id}`)) {
             // Host zaten lobideyse ve timer yoksa, özel bir mesaj verilebilir veya mevcut mesaj kalabilir.
             // Bu durum genelde beklenmez ama bir edge case olabilir.
        }


        res.status(200).json({
            message: message,
            lobby: lobby.toObject(),
        });

    } catch (error) {
        console.error("Lobiye katılma hatası:", error);
        res.status(500).json({ message: "Lobiye katılırken bir hata oluştu.", error: error.message });
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

        const userIndex = lobby.members.findIndex((member) => member.id === user.id);
        if (userIndex === -1) {
            return res.status(400).json({ message: "Bu lobide değilsiniz." });
        }

        const removedUser = lobby.members.splice(userIndex, 1)[0];
        const wasHost = removedUser.id.toString() === lobby.createdBy.toString();
        const playerIdToRemove = removedUser.id.toString();

        if (lobby.game === '1') { // Bingo
            const bingoGame = bingoGames[lobbyCode];
            if (bingoGame && bingoGame.players[playerIdToRemove]) {
                if (bingoGame.gameStarted && !bingoGame.gameEnded) {
                    handleBingoPlayerLeaveMidGame(lobbyCode, playerIdToRemove);
                } else if (!bingoGame.gameStarted) {
                    handleBingoPlayerLeavePreGame(lobbyCode, playerIdToRemove);
                }
            }
        } else if (lobby.game === '2') { // Hangman
            const hangmanGame = hangmanGames[lobbyCode];
            if (hangmanGame && hangmanGame.players[playerIdToRemove]) {
                if (hangmanGame.gameStarted && !hangmanGame.gameEnded) {
                    handleHangmanPlayerLeaveMidGame(lobbyCode, playerIdToRemove);
                } else if (!hangmanGame.gameStarted) {
                    removePlayerFromHangmanPregame(lobbyCode, playerIdToRemove);
                }
            }
        }

        const remainingMemberIds = lobby.members.map(m => m.id.toString());
        if (remainingMemberIds.length > 0) {
            broadcastLobbyEvent(lobbyCode, "USER_LEFT", {
                userId: removedUser.id,
                name: removedUser.name,
                wasHost: wasHost
            }, remainingMemberIds);
        }

        broadcastLobbyEvent(
            null,
            "LOBBY_MEMBER_COUNT_UPDATED",
            {
                lobbyCode: lobby.lobbyCode,
                memberCount: lobby.members.length,
                maxMembers: lobby.maxMembers,
                members: lobby.members.map(m => ({
                    id: m.id,
                    name: m.name,
                    avatar: m.avatar,
                    isHost: m.isHost
                }))
            },
            null
        );

        if (wasHost && lobby.lobbyType === "normal") {
            if (lobby.members.length === 0) {
                if (lobbyTimers.has(`start_${lobby.id}`)) { clearTimeout(lobbyTimers.get(`start_${lobby.id}`)); lobbyTimers.delete(`start_${lobby.id}`); }
                if (lobbyTimers.has(`end_${lobby.id}`)) { clearTimeout(lobbyTimers.get(`end_${lobby.id}`)); lobbyTimers.delete(`end_${lobby.id}`); }
                if (lobbyTimers.has(`host_leave_${lobby.id}`)) { clearTimeout(lobbyTimers.get(`host_leave_${lobby.id}`)); lobbyTimers.delete(`host_leave_${lobby.id}`); }
                await Lobby.deleteOne({ lobbyCode: lobbyCode });
            } else {
                const timerKey = `host_leave_${lobby.id}`;
                let existingTimer = lobbyTimers.get(timerKey);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                    lobbyTimers.delete(timerKey);
                }

                const deletionTimer = setTimeout(async () => {
                    try {
                        const currentLobby = await Lobby.findOne({ lobbyCode: lobbyCode }).lean();
                        if (currentLobby) {
                            broadcastLobbyEvent(lobbyCode, "LOBBY_DELETED", {
                                lobbyCode: lobbyCode,
                                reason: "Host geri dönmediği için lobi kapatıldı.",
                            });
                            await Lobby.deleteOne({ lobbyCode: lobbyCode });
                        }
                    } catch (error) {
                        console.error("Host ayrılma zamanlayıcısı (silme) hatası:", error);
                    } finally {
                        lobbyTimers.delete(timerKey);
                    }
                }, 8 * 60 * 60 * 1000); // 8 saat
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
        res.status(500).json({ message: "Lobiden ayrılırken bir hata oluştu.", error: error.message });
    }
};

//KICK_PLAYER
export const kickPlayerFromLobby = async (ws, data) => {
    const { lobbyCode, playerIdToKick } = data;
    const hostUserId = ws.userId;

    try {
        if (!lobbyCode || !playerIdToKick) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Lobi kodu ve atılacak oyuncu ID'si gereklidir." }));
            return;
        }

        if (!hostUserId) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Bu işlem için yetkili kullanıcı bulunamadı." }));
            return;
        }

        const lobby = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });

        if (!lobby || !lobby.isActive) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Aktif lobi bulunamadı." }));
            return;
        }

        if (lobby.createdBy.toString() !== hostUserId) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Sadece lobi sahibi oyuncu atabilir." }));
            return;
        }

        if (playerIdToKick === hostUserId) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Kendinizi lobiden atamazsınız. Ayrılmak için 'Lobiden Ayrıl' seçeneğini kullanın." }));
            return;
        }

        const userIndex = lobby.members.findIndex((member) => member.id.toString() === playerIdToKick);
        if (userIndex === -1) {
            ws.send(JSON.stringify({ type: "ERROR", message: "Atılmak istenen oyuncu bu lobide değil." }));
            return;
        }

        const kickedUserMemberInfo = lobby.members.splice(userIndex, 1)[0];

        if (lobby.game === '1') { // Bingo
            const bingoGame = bingoGames[lobbyCode];
            if (bingoGame && bingoGame.players[playerIdToKick]) {
                if (bingoGame.gameStarted && !bingoGame.gameEnded) {
                    handleBingoPlayerLeaveMidGame(lobbyCode, playerIdToKick);
                } else if (!bingoGame.gameStarted) {
                    handleBingoPlayerLeavePreGame(lobbyCode, playerIdToKick);
                }
            }
        } else if (lobby.game === '2') { // Hangman
            const hangmanGame = hangmanGames[lobbyCode];
            if (hangmanGame && hangmanGame.players[playerIdToKick]) {
                if (hangmanGame.gameStarted && !hangmanGame.gameEnded) {
                    handleHangmanPlayerLeaveMidGame(lobbyCode, playerIdToKick);
                } else if (!hangmanGame.gameStarted) {
                    removePlayerFromHangmanPregame(lobbyCode, playerIdToKick);
                }
            }
        }

        await lobby.save();

        const remainingMemberIds = lobby.members.map(m => m.id.toString());
        if (remainingMemberIds.length > 0) {
            if (typeof broadcastLobbyEvent === 'function') {
                broadcastLobbyEvent(lobbyCode, "PLAYER_KICKED_BY_HOST", {
                    kickedUserId: kickedUserMemberInfo.id,
                    kickedUserName: kickedUserMemberInfo.name,
                    lobbyCode: lobby.lobbyCode,
                }, remainingMemberIds);
            } else {
                console.error("broadcastLobbyEvent is not initialized or not a function.");
            }
        }

        if (typeof broadcastLobbyEvent === 'function') {
            broadcastLobbyEvent(
                null,
                "LOBBY_MEMBER_COUNT_UPDATED",
                {
                    lobbyCode: lobby.lobbyCode,
                    memberCount: lobby.members.length,
                    maxMembers: lobby.maxMembers,
                    members: lobby.members.map(m => ({
                        id: m.id,
                        name: m.name,
                        avatar: m.avatar,
                        isHost: m.id.toString() === lobby.createdBy.toString(),
                    }))
                },
                null
            );
        } else {
            console.error("broadcastLobbyEvent is not initialized or not a function for LOBBY_MEMBER_COUNT_UPDATED.");
        }

        // Atılan kullanıcıya özel mesaj `messageRouter` tarafından gönderilecek.
        // Host'a başarı ACK mesajı `messageRouter` tarafından gönderilecek.

    } catch (error) {
        console.error("Oyuncu atma hatası (kickPlayerFromLobby):", error);
        ws.send(JSON.stringify({ type: "ERROR", message: "Oyuncu atılırken bir sunucu hatası oluştu." }));
    }
};

export const deleteLobby = async (req, res) => {
    const { lobbyCode } = req.params;
    const user = req.user;

    try {
        if (!lobbyCode) {
            return res.status(400).json({ message: "Lobi kodu gereklidir." });
        }
        const lobby = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true }); 

        if (!lobby) {
            return res.status(404).json({ message: "Lobi bulunamadı." });
        }

        if (lobby.createdBy !== user.id) {
            return res.status(403).json({ message: "Bu lobiyi silme yetkiniz yok." });
        }

        lobby.isActive = false; 
        await lobby.save();

        // Handle bingoGames cleanup
        if (bingoGames[lobbyCode]) {
            const game = bingoGames[lobbyCode];

            if (lobbyTimers.get(`start_${lobby.id}`)) {
                clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
                lobbyTimers.delete(`start_${lobby.id}`);
            }
            if (lobbyTimers.get(`end_${lobby.id}`)) {
                clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
                lobbyTimers.delete(`end_${lobby.id}`);
            }

            if (game.autoDrawInterval) {
                clearInterval(game.autoDrawInterval);
            }

            broadcastLobbyEvent(lobby.lobbyCode, "GAME_TERMINATED", {
                lobbyCode: lobby.lobbyCode,
                message: "Oyun iptal edildi."
            }, lobby.members.map(member => member.id));

            delete bingoGames[lobbyCode];
        }

        // Handle hangmanGames cleanup - NEW CODE
        if (hangmanGames[lobbyCode]) {
            const game = hangmanGames[lobbyCode];
            
            // Clear any active turn timer
            if (game.turnTimer) {
                clearTimeout(game.turnTimer);
                game.turnTimer = null;
            }

            // End any active game
            if (game.gameStarted && !game.gameEnded) {
                game.gameEnded = true;
                
                // Notify players that the game was terminated
                Object.values(game.players).forEach(player => {
                    if (player.ws && player.ws.readyState === player.ws.OPEN) {
                        player.ws.send(JSON.stringify({
                            type: "HANGMAN_GAME_TERMINATED",
                            message: "Lobi silindi, oyun sonlandırıldı."
                        }));
                    }
                });
            }
            
            // Remove the game from hangmanGames
            delete hangmanGames[lobbyCode];
        }

        // Broadcast lobby deletion to all members
        broadcastLobbyEvent(lobby.lobbyCode, "LOBBY_DELETED", { 
            lobbyCode: lobby.lobbyCode,
            message: "Lobi silindi."
        });

        // Clean up any remaining timers
        if (lobbyTimers.has(`start_${lobby.id}`)) {
            clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
            lobbyTimers.delete(`start_${lobby.id}`);
        }
        if (lobbyTimers.has(`end_${lobby.id}`)) {
            clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
            lobbyTimers.delete(`end_${lobby.id}`);
        }
        if (lobbyTimers.has(`host_leave_${lobby.id}`)) {
            clearTimeout(lobbyTimers.get(`host_leave_${lobby.id}`));
            lobbyTimers.delete(`host_leave_${lobby.id}`);
            console.log(`Lobi silinirken host ayrılma zamanlayıcısı temizlendi: ${`host_leave_${lobby.id}`}`);
        }

        // Permanently delete from database
        const deletionResult = await Lobby.deleteOne({ lobbyCode: lobbyCode });

        if (deletionResult.deletedCount === 0) {
            console.warn(`Lobi ${lobbyCode} silinemedi, belki zaten silinmişti.`);
            return res.status(404).json({ message: "Lobi silinemedi, muhtemelen zaten silinmiş." });
        }

        console.log(`Lobi ${lobbyCode} başarıyla silindi.`);
        res.status(200).json({
            message: "Lobi başarıyla veritabanından kalıcı olarak silindi.",
            deletedLobbyCode: lobbyCode
        });

    } catch (error) {
        console.error("Lobi silme hatası:", error);
        res.status(500).json({ message: "Lobi silinirken bir hata oluştu.", error: error.message });
    }
};


export const updateLobby = async (req, res) => {
    const { lobbyCode } = req.params;
    const { lobbyName, maxMembers, game, password, startTime, endTime, lobbyType } = req.body;
    const user = req.user;

    try {
        if (!lobbyCode) {
            return res.status(400).json({ message: "Lobi kodu gereklidir." });
        }
        const lobby = await Lobby.findOne({ lobbyCode: lobbyCode, isActive: true });

        if (!lobby) {
            return res.status(404).json({ message: "Lobi bulunamadı." });
        }

        if (lobby.createdBy !== user.id) {
            return res.status(403).json({ message: "Bu lobiyi güncelleme yetkiniz yok." });
        }

        if (lobbyName !== undefined) {
            if (!lobbyName?.trim()) { 
                return res.status(400).json({ message: "Lobi adı boş olamaz." });
            }
            lobby.lobbyName = lobbyName;
        }

        if (game !== undefined) {
            if (!game) {
                return res.status(400).json({ message: "Oyun türü boş olamaz." });
            }
            lobby.game = game;
        }

        if (maxMembers !== undefined) {
            if (typeof maxMembers !== 'number' || maxMembers <= 0) {
                return res.status(400).json({ message: "Maksimum üye sayısı pozitif bir sayı olmalıdır." });
            }
            lobby.maxMembers = maxMembers;
        }

        if (password !== undefined) {
            const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
            lobby.password = hashedPassword;
        }

        if (lobbyType !== undefined) {
            if (!['normal', 'event'].includes(lobbyType)) {
                return res.status(400).json({ message: "Geçersiz lobi türü." });
            }
            lobby.lobbyType = lobbyType;

            if (lobbyType === 'event') {
                if (!startTime) {
                    return res.status(400).json({ message: "Etkinlik lobisi için başlangıç zamanı zorunludur." });
                }
                if (!endTime) {
                    return res.status(400).json({ message: "Etkinlik lobisi için bitiş zamanı zorunludur." });
                }

                const startTimeDate = new Date(startTime);
                const endTimeDate = new Date(endTime);

                if (isNaN(startTimeDate.getTime()) || isNaN(endTimeDate.getTime())) { // Check for valid dates
                    return res.status(400).json({ message: "Geçersiz başlangıç veya bitiş zamanı formatı." });
                }

                if (startTimeDate < new Date()) {
                    return res.status(400).json({ message: "Başlangıç zamanı gelecekte olmalıdır." });
                }
                if (endTimeDate <= startTimeDate) {
                    return res.status(400).json({ message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır." });
                }

                lobby.startTime = startTimeDate;
                lobby.endTime = endTimeDate;
            } else if (lobbyType === 'normal') {
                lobby.startTime = null;
                lobby.endTime = null;
                if (lobbyTimers.get(`start_${lobby.id}`)) { 
                    clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
                    lobbyTimers.delete(`start_${lobby.id}`);
                }
                if (lobbyTimers.get(`end_${lobby.id}`)) {
                    clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
                    lobbyTimers.delete(`end_${lobby.id}`);
                }
            }
        }

        let timeUpdated = false;

        if (lobby.lobbyType === "event") {


            if (startTime !== undefined) {
                if (!startTime) {
                    return res.status(400).json({ message: "Etkinlik lobisi için başlangıç zamanı zorunludur." });
                }
                const startTimeDate = new Date(startTime);
                if (isNaN(startTimeDate.getTime())) { 
                    return res.status(400).json({ message: "Geçersiz başlangıç zamanı formatı." });
                }
                const now = new Date();
                if (startTimeDate < now) {
                    return res.status(400).json({ message: "Başlangıç zamanı gelecekte olmalıdır." });
                }
                lobby.startTime = startTimeDate;
                timeUpdated = true;
            }

            if (endTime !== undefined) {
                if (!endTime) {
                    return res.status(400).json({ message: "Etkinlik lobisi için bitiş zamanı zorunludur." });
                }
                const endTimeDate = new Date(endTime);
                if (isNaN(endTimeDate.getTime())) { 
                    return res.status(400).json({ message: "Geçersiz bitiş zamanı formatı." });
                }
                if (!lobby.startTime) {
                    return res.status(400).json({ message: "Başlangıç zamanı tanımlı değil. Lütfen önce başlangıç zamanını ayarlayın." });
                }
                if (endTimeDate <= lobby.startTime) {
                    return res.status(400).json({ message: "Bitiş zamanı başlangıç zamanından sonra olmalıdır." });
                }
                lobby.endTime = endTimeDate;
                timeUpdated = true;
            }


        }

        if (timeUpdated && lobby.lobbyType === "event") { 
            if (lobbyTimers.get(`start_${lobby.id}`)) {
                clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
                lobbyTimers.delete(`start_${lobby.id}`);
            }
            if (lobbyTimers.get(`end_${lobby.id}`)) {
                clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
                lobbyTimers.delete(`end_${lobby.id}`);
            }

            if (lobby.startTime && lobby.endTime) {
                const startTimeMs = lobby.startTime.getTime();
                const endTimeMs = lobby.endTime.getTime();
                const now = Date.now();

                if (startTimeMs > now) {
                    const startTimer = setTimeout(async () => {
                        try {
                            const currentLobby = await Lobby.findOne({ id: lobby.id, isActive: true }).lean(); 
                            if (currentLobby) {
                                const memberIds = currentLobby.members.map(member => member.id);

                                broadcastLobbyEvent(lobbyCode, "EVENT_START_NOTIFICATION", {
                                    lobbyId: lobby.id,
                                    lobbyName: lobby.lobbyName,
                                    lobbyCode: lobbyCode,
                                    message: `Etkinlik "${lobby.lobbyName}" başladı!`,
                                    game: lobby.game,
                                    startTime: lobby.startTime,
                                    endTime: lobby.endTime
                                }, memberIds);
                            }
                        } catch (error) {
                            console.error("Etkinlik başlangıç zamanlayıcı hatası:", error);
                        }
                    }, startTimeMs - now);
                    lobbyTimers.set(`start_${lobby.id}`, startTimer);
                }

                const endTimer = setTimeout(async () => {
                    try {
                        const currentLobby = await Lobby.findOne({ id: lobby.id, isActive: true }).lean(); 
                        if (currentLobby) {
                            broadcastLobbyEvent(
                                lobbyCode,
                                "LOBBY_REMOVED",
                                {
                                    lobbyCode: lobbyCode,
                                    reason: "Etkinlik sona erdi",
                                    lobbyId: currentLobby.id
                                },
                                null
                            );
                            await Lobby.deleteOne({ id: currentLobby.id }); 
                        }
                    } catch (error) {
                        console.error("Etkinlik bitiş zamanlayıcı hatası:", error);
                    }
                }, endTimeMs - now);
                lobbyTimers.set(`end_${lobby.id}`, endTimer);
            }
        }


        await lobby.save();

        broadcastLobbyEvent(lobbyCode, "LOBBY_UPDATED", lobby.toObject());

        res.status(200).json({
            message: "Lobi başarıyla güncellendi.",
            lobby: lobby.toObject(),
        });

    } catch (error) {
        console.error("Lobi güncelleme hatası:", error);
        res.status(500).json({ message: "Lobi güncellenirken bir hata oluştu.", error: error.message });
    }
};