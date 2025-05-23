// groupChat.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const groupChatSchema = new Schema({
    groupName: { type: String, required: true },
    description: { type: String },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    password: { type: String, select: false }, 
    maxMembers: { type: Number, default: 50 }, 
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const GroupChat = mongoose.model('GroupChat', groupChatSchema);

export default GroupChat;