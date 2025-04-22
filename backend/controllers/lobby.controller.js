import bcrypt from 'bcrypt';
import Lobby from '../models/lobby.model.js';
import { bingoGames } from "./bingo.game.controller.js";
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
        const lobby = await Lobby.findOne({ lobbyCode: lobbyCode }).lean();

        if (!lobby) {
            return res.status(404).json({ message: "Lobi bulunamadı." });
        }

        const membersWithDetails = lobby.members.map((member) => ({
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            isHost: member.id === lobby.createdBy,
        }));

        res.status(200).json({
            message: "Lobi bilgileri başarıyla getirildi.",
            lobby: {
                ...lobby,
                members: membersWithDetails,
                password: undefined, 
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

        if (lobby.password && !bcrypt.compareSync(password, lobby.password)) {
            return res.status(401).json({ message: "Geçersiz şifre." });
        }

        if (user.id === lobby.createdBy) {
            const hostReturnTimerKey = `host_leave_${lobby.id}`;
            const existingTimer = lobbyTimers.get(hostReturnTimerKey);

            if (existingTimer) {
                clearTimeout(existingTimer);
                lobbyTimers.delete(hostReturnTimerKey);
                console.log(`Host geri döndü, zamanlayıcı temizlendi. Lobi ID: ${lobby.id}, Zamanlayıcı Anahtarı: ${hostReturnTimerKey}`);

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

                broadcastLobbyEvent(lobbyCode, "HOST_RETURNED", { // Use broadcastLobbyEvent
                    userId: user.id,
                    name: user.name,
                    avatar: user.avatar,
                    lobbyCode: lobbyCode,
                    isHost: true,
                }, lobby.members.map(member => member.id)); // Send to all members

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
            return res.status(400).json({ message: "Zaten bu lobidesiniz." });
        }

        lobby.members.push({
            id: user.id,
            name: user.name,
            avatar: user.avatar,
            isHost: false,
        });
        await lobby.save();

        // Best practice: Send USER_JOINED event only to other members in the lobby
        const lobbyMembersExceptNewUser = lobby.members.filter(member => member.id !== user.id);
        const memberIdsToNotify = lobbyMembersExceptNewUser.map(member => member.id);

        if (memberIdsToNotify.length > 0) { // Only broadcast if there are other members to notify
            broadcastLobbyEvent(lobbyCode, "USER_JOINED", {
                userId: user.id,
                name: user.name,
                avatar: user.avatar,
                lobbyName: lobby.lobbyName,
            }, memberIdsToNotify); // Send to specific users (other members)
        }

        res.status(200).json({
            message: "Lobiye başarıyla katıldınız.",
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

         const remainingMemberIds = lobby.members.map(m => m.id.toString());
         if (remainingMemberIds.length > 0) {
             broadcastLobbyEvent(lobbyCode, "USER_LEFT", {
                 userId: removedUser.id,
                 userName: removedUser.name, 
                 wasHost: wasHost 
             }, remainingMemberIds);
         }


        if (wasHost && lobby.lobbyType === "normal") {
             if (lobby.members.length === 0) {
                 console.log(`Host ${lobbyCode} lobisinden ayrıldı ve lobi boş kaldı. Direkt siliniyor.`);

                 if (lobbyTimers.has(`start_${lobby.id}`)) { clearTimeout(lobbyTimers.get(`start_${lobby.id}`)); lobbyTimers.delete(`start_${lobby.id}`); }
                 if (lobbyTimers.has(`end_${lobby.id}`)) { clearTimeout(lobbyTimers.get(`end_${lobby.id}`)); lobbyTimers.delete(`end_${lobby.id}`); }
                 if (lobbyTimers.has(`host_leave_${lobby.id}`)) { clearTimeout(lobbyTimers.get(`host_leave_${lobby.id}`)); lobbyTimers.delete(`host_leave_${lobby.id}`); }

                 await Lobby.deleteOne({ lobbyCode: lobbyCode });

             } else {
                const timerKey = `host_leave_${lobby.id}`;
                console.log(`Host ayrıldı, 8 saatlik silme zamanlayıcısı başlatılıyor. Lobi ID: ${lobby.id}, Anahtar: ${timerKey}`);
                let existingTimer = lobbyTimers.get(timerKey);
                if (existingTimer) {
                    clearTimeout(existingTimer);
                    lobbyTimers.delete(timerKey);
                    console.log(`Önceki zamanlayıcı temizlendi. Lobi ID: ${lobby.id}, Anahtar: ${timerKey}`);
                }

                const deletionTimer = setTimeout(async () => {
                    console.log(`8 saatlik süre doldu, ${lobbyCode} lobisi siliniyor (Host geri dönmedi).`);
                    try {
                        const currentLobby = await Lobby.findOne({ lobbyCode: lobbyCode }).lean();
                        if (currentLobby) {
                            broadcastLobbyEvent(lobbyCode, "LOBBY_DELETED", {
                                lobbyCode: lobbyCode,
                                reason: "Host geri dönmediği için lobi kapatıldı.",
                                // lobbyId: currentLobby.id
                            });

                            await Lobby.deleteOne({ lobbyCode: lobbyCode });
                            console.log(`Lobi ${lobbyCode} (Host geri dönmediği için) başarıyla silindi.`);
                        } else {
                            console.log(`Zamanlayıcı çalıştı ama lobi ${lobbyCode} zaten silinmiş veya bulunamadı.`);
                        }
                    } catch (error) {
                        console.error("Host ayrılma zamanlayıcısı (silme) hatası:", error);
                    } finally {
                        lobbyTimers.delete(timerKey);
                    }
                }, 8 * 60 * 60 * 1000); // 8 saat 
                 // }, 1 * 60 * 1000); // Test için 1 dakika

                lobbyTimers.set(timerKey, deletionTimer);
                console.log(`Yeni silme zamanlayıcısı ayarlandı. Lobi ID: ${lobby.id}, Anahtar: ${timerKey}`);
             }

        }
        if (lobby.members.length > 0 || !wasHost) {
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
        } else {
            broadcastLobbyEvent(lobby.lobbyCode, "LOBBY_DELETED", { 
                lobbyCode: lobby.lobbyCode,
                message: "Lobi silindi."
            });
        }

        if (lobbyTimers.has(`start_${lobby.id}`)) {
            clearTimeout(lobbyTimers.get(`start_${lobby.id}`));
            lobbyTimers.delete(`start_${lobby.id}`);
        }
        if (lobbyTimers.has(`end_${lobby.id}`)) {
            clearTimeout(lobbyTimers.get(`end_${lobby.id}`));
            lobbyTimers.delete(`end_${lobby.id}`);
        }
        // Host ayrılma zamanlayıcısını da temizle (eğer varsa)
         if (lobbyTimers.has(`host_leave_${lobby.id}`)) {
            clearTimeout(lobbyTimers.get(`host_leave_${lobby.id}`));
            lobbyTimers.delete(`host_leave_${lobby.id}`);
            console.log(`Lobi silinirken host ayrılma zamanlayıcısı temizlendi: ${`host_leave_${lobby.id}`}`);
        }

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