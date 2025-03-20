// communityChat.model.js
import mongoose from "mongoose";

const communityChatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Gönderen kullanıcı ID'si
  message: { type: String, required: true }, // Mesaj içeriği
  timestamp: { type: Date, default: Date.now }, // Mesajın gönderilme zamanı
});

const CommunityChatMessage = mongoose.model(
  "CommunityChatMessage",
  communityChatMessageSchema
);

export default CommunityChatMessage;