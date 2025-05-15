import mongoose from 'mongoose';
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { HangmanGame } from '../models/hangman.model.js';
import { BingoGame } from '../models/bingo.game.model.js';

// Yeni kullanıcı ekleme (Postman'dan test için)
export const createUser = async (req, res) => {
  try {
    const { email, password, name, username, avatar } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      username,
      avatar,
      friends: [],
      friendRequests: [],
      outgoingRequests: [],
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });

  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const searchUsers = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username || username.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: username, $options: "i" },
      _id: { $ne: req.user._id }
    }).select("id username name avatar").limit(10);

    res.json(users);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json([]);
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("email name avatar");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); 
    res.json({ users }); // Kullanıcıları bir obje içinde döndür
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const formatMillisecondsToHHMMSS = (ms) => {
  if (ms <= 0 || !ms) return "00:00:00";
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const getCombinedPlayerStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Geçersiz kullanıcı IDsi." });
    }
    const objectIdUserId = new mongoose.Types.ObjectId(userId);

    // 1. Hangman istatistiklerini çek
    const playerHangmanGames = await HangmanGame.find({ "players.playerId": objectIdUserId })
      .select("players.playerId players.userName players.won startedAt endedAt")
      .lean();

    let hangmanGamesPlayed = 0;
    let hangmanWins = 0;
    let hangmanTotalPlayTimeMs = 0;
    let userName = ""; // userName'i ilk bulduğumuz yerden alacağız

    if (playerHangmanGames && playerHangmanGames.length > 0) {
      hangmanGamesPlayed = playerHangmanGames.length;
      playerHangmanGames.forEach(game => {
        const playerInfo = game.players.find(p => p.playerId.equals(objectIdUserId));
        if (playerInfo) {
          if (!userName && playerInfo.userName) {
            userName = playerInfo.userName;
          }
          if (playerInfo.won) {
            hangmanWins++;
          }
          if (game.startedAt && game.endedAt) {
            hangmanTotalPlayTimeMs += game.endedAt.getTime() - game.startedAt.getTime();
          }
        }
      });
    }

    // 2. Bingo istatistiklerini çek
    // BingoGame'de playerId'nin String olduğunu varsayarak devam ediyorum.
    // Eğer ObjectId ise, sorguyu ve playerInfo bulma mantığını objectIdUserId ile güncelleyin.
    const playerBingoGames = await BingoGame.find({ "players.playerId": userId }) // userId string ise
      // const playerBingoGames = await BingoGame.find({ "players.playerId": objectIdUserId }) // userId ObjectId ise
      .select("players.playerId players.userName players.finalRank players.score startedAt endedAt")
      .lean();

    let bingoGamesPlayed = 0;
    let bingoWins = 0;
    let bingoTotalPlayTimeMs = 0;

    if (playerBingoGames && playerBingoGames.length > 0) {
      bingoGamesPlayed = playerBingoGames.length;
      playerBingoGames.forEach(game => {
        const playerInfo = game.players.find(p => p.playerId === userId); // userId string ise
        // const playerInfo = game.players.find(p => p.playerId.equals(objectIdUserId)); // userId ObjectId ise
        if (playerInfo) {
          if (!userName && playerInfo.userName) { // Henüz userName alınmadıysa ve Bingo'da varsa al
            userName = playerInfo.userName;
          }
          if (playerInfo.finalRank === 1) {
            bingoWins++;
          }
          if (game.startedAt && game.endedAt) {
            bingoTotalPlayTimeMs += game.endedAt.getTime() - game.startedAt.getTime();
          }
        }
      });
    }

    // 3. Genel istatistikleri hesapla
    const totalGamesPlayed = hangmanGamesPlayed + bingoGamesPlayed;
    const totalWins = hangmanWins + bingoWins;
    const overallWinRate = totalGamesPlayed > 0 ? (totalWins / totalGamesPlayed) : 0;
    const totalPlayTimeMilliseconds = hangmanTotalPlayTimeMs + bingoTotalPlayTimeMs;
    const totalPlayTimeFormatted = formatMillisecondsToHHMMSS(totalPlayTimeMilliseconds);

    if (totalGamesPlayed === 0) {
        // Eğer kullanıcı adı da yoksa ve hiç oyun oynamamışsa, belki User modelinden çekilebilir.
        // Şimdilik sadece oyun bulunamadı mesajı veriyoruz.
        if (!userName) {
            try {
                const user = await User.findById(objectIdUserId).select('username').lean(); // User modelinizdeki kullanıcı adı alanına göre 'username'i güncelleyin
                if (user) userName = user.username;
            } catch (userError) {
                console.warn("Kullanıcı adı alınırken ek hata:", userError.message);
            }
        }
        if (totalGamesPlayed === 0 && !userName){
             return res.status(404).json({ message: "Bu kullanıcı için herhangi bir oyun istatistiği veya kullanıcı bilgisi bulunamadı." });
        }
        if (totalGamesPlayed === 0){
            // Kullanıcı var ama oyunu yoksa, sadece temel bilgileri ve sıfır istatistikleri döndür
             return res.status(200).json({
                playerId: userId,
                userName: userName || "Bilinmiyor",
                totalGamesPlayed: 0,
                totalWins: 0,
                overallWinRate: 0,
                totalPlayTimeMilliseconds: 0,
                totalPlayTimeFormatted: "00:00:00",
                hangmanStats: { gamesPlayed: 0, wins: 0, playTimeMilliseconds: 0, playTimeFormatted: "00:00:00" },
                bingoStats: { gamesPlayed: 0, wins: 0, playTimeMilliseconds: 0, playTimeFormatted: "00:00:00" }
            });
        }
    }

    res.status(200).json({
      playerId: userId,
      userName: userName || "Bilinmiyor", // Eğer hiçbir oyunda userName bulunamazsa
      totalGamesPlayed,
      totalWins,
      overallWinRate: parseFloat(overallWinRate.toFixed(2)),
      totalPlayTimeMilliseconds,
      totalPlayTimeFormatted,
      hangmanStats: {
        gamesPlayed: hangmanGamesPlayed,
        wins: hangmanWins,
        playTimeMilliseconds: hangmanTotalPlayTimeMs,
        playTimeFormatted: formatMillisecondsToHHMMSS(hangmanTotalPlayTimeMs),
      },
      bingoStats: {
        gamesPlayed: bingoGamesPlayed,
        wins: bingoWins,
        playTimeMilliseconds: bingoTotalPlayTimeMs,
        playTimeFormatted: formatMillisecondsToHHMMSS(bingoTotalPlayTimeMs),
      }
    });

  } catch (error) {
    console.error(`Error fetching combined stats for player ${req.params.userId}:`, error);
    res.status(500).json({ message: "Oyuncu istatistikleri alınırken bir hata oluştu.", error: error.message });
  }
};