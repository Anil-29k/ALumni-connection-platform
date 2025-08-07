// models/Notice.model.js
import mongoose from 'mongoose';

// Define the schema for a notice
const noticeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Export the notice schema
export default noticeSchema; // Only export the schema