import mongoose from 'mongoose';

const HangmanPlayerSchema = new mongoose.Schema({
  playerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  correctGuesses: { // Önce correctGuesses'ı koymak daha yaygın bir sıralama
    type: [String], // [String] Array için daha kısa ve yaygın bir gösterim
    default: []
  },
  incorrectGuesses: {
    type: [String],
    default: [] // Düzeltildi: 0 yerine []
  },
  remainingAttempts: {
    type: Number,
    default: 6
  },
  won: { // Eklendi
    type: Boolean,
    default: false
  },
  eliminated: {
    type: Boolean,
    default: false
  },
  completedAt: { // Oyuncunun oyunu ne zaman tamamladığı (kazanarak/elenerek)
    type: Date,
    default: null
  },
  finalRank: {
    type: Number,
    default: null
  }
  // _id: false // Eğer alt dökümanlar için ayrı _id istemiyorsanız (genelde istenir)
});

const HangmanGameSchema = new mongoose.Schema({
  gameId: { // Eğer bu Mongoose'un _id'si değilse ve siz üretiyorsanız tamam.
            // Genelde Mongoose _id'sini kullanmak yeterli olur.
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true // gameId'nin benzersiz olmasını sağlamak iyi bir pratik
  },
  lobbyCode: {
    type: String,
    required: true,
    index: true // Sık sorgulanacaksa index eklemek performansı artırır
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startedAt: {
    type: Date,
    required: true
  },
  endedAt: {
    type: Date,
    default: null
  },
  players: [HangmanPlayerSchema],
  word: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  // guessedLetters (oyun genelinde tüm tahmin edilen harfler)
  // Eğer her oyuncunun kendi tahminleri yeterliyse bu alana gerek olmayabilir.
  // Ancak genel bir bakış için tutulabilir.
  // guessedLetters: {
  //   type: [String],
  //   default: []
  // },
  winners: [{ // Düzeltildi: "winner" yerine "winners" ve ObjectId dizisi
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isActive: { // Oyun bittiğinde false olacak
    type: Boolean,
    default: true // Başlangıçta true, oyun bittiğinde false'a güncellenir
  },
  maxIncorrectGuesses: {
    type: Number,
    default: 6
  }
}, { timestamps: true }); // createdAt ve updatedAt alanlarını otomatik ekler

// Model ismi tekil olmalı (HangmanGame)
export const HangmanGame = mongoose.model('HangmanGame', HangmanGameSchema);
export default HangmanGame;