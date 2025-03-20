// groupChatMessage.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const groupChatMessageSchema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'GroupChat', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const GroupChatMessage = mongoose.model('GroupChatMessage', groupChatMessageSchema);

export default GroupChatMessage;