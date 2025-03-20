// privateChat.model.js
import mongoose from "mongoose";

const privateChatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const PrivateChatMessage = mongoose.model("PrivateChatMessage", privateChatMessageSchema);

export default PrivateChatMessage;