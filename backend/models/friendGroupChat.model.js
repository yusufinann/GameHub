// friendGroupChat.model.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const friendGroupChatSchema = new Schema({
    groupName: { type: String, required: true },
    description: { type: String },
    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    password: { type: String, select: false }, 
    maxMembers: { type: Number, default: 50 },
    invitationLink: { type: String, unique: true, sparse: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const FriendGroupChat = mongoose.model('FriendGroupChat', friendGroupChatSchema);

export default FriendGroupChat;