import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    recipientName: { type: String, required: true },
    message: { type: String, required: false },
    file: { type: String, required: false }, // File name or path
    sendTime: { type: Date, default: Date.now },
    deleteFor: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});


// Create and export the College model
const Message = mongoose.model('Message', messageSchema);
export default Message;