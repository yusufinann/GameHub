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
  incorrectGuesses: {
    type: Number,
    default: 0
  },
  correctGuesses: {
    type: Array,
    default: []
  },
  hasGuessedWord: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  },
  finalRank: {
    type: Number,
    default: null
  },
  isEliminated: {
    type: Boolean,
    default: false
  }
});

const HangmanGameSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  lobbyCode: {
    type: String,
    required: true
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
  guessedLetters: {
    type: [String],
    default: []
  },
  winner: {
    playerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userName: String,
    completedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxIncorrectGuesses: {
    type: Number,
    default: 6
  }
}, { timestamps: true });

export const HangmanGame = mongoose.model('HangmanGame', HangmanGameSchema);
export default HangmanGame;