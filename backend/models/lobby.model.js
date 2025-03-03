import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    isHost: { type: Boolean, default: false },
  },
  { _id: false }
);

const lobbySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // özel oluşturulan ID
  createdBy: { type: String, required: true },
  lobbyName: { type: String, required: true },
  lobbyType: { type: String, required: true, enum: ["event", "normal"] },
  startTime: { type: Date, default: null },
  endTime: { type: Date, default: null },
  password: { type: String, default: null },
  game: { type: String, required: true },
  maxMembers: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  members: [memberSchema],
  lobbyCode: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  expiryTime: { type: Date, default: null },
});

const Lobby = mongoose.model("Lobby", lobbySchema);

export default Lobby;
