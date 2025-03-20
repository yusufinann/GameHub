import mongoose from 'mongoose';
const { Schema } = mongoose;

const friendGroupChatMessageSchema = new Schema({
    groupId: { type: Schema.Types.ObjectId, ref: 'FriendGroupChat', required: true }, 
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

const FriendGroupChatMessage = mongoose.model('FriendGroupChatMessage', friendGroupChatMessageSchema); 

export default FriendGroupChatMessage;