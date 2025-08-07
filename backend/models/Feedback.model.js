import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    email: { type: String, required: true },
    feedback: { type: String, required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'entityType' }, // Use refPath for dynamic referencing
    entityType: { type: String, required: true, enum: ['College', 'Community'] }, // Specify the entity type
    submittedBy: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('Feedback', FeedbackSchema);
