import mongoose from 'mongoose';

const bingoGameSchema = new mongoose.Schema({
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true
  },
  lobbyCode: {
    type: String,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: {
    type: Date,
    required: true
  },
  players: [{
    playerId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    ticket: [{
      type: Number,
      required: true
    }],
    completedAt: Date,
    finalRank: Number
  }],
  drawnNumbers: [{
    type: Number,
    required: true
  }],
  drawMode: {
    type: String,
    enum: ['auto', 'manual'],
    required: true
  },
  winner: {
    playerId: String,
    userName: String,
    completedAt: Date
  },
  createdBy: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const BingoGame = mongoose.model('BingoGame', bingoGameSchema);