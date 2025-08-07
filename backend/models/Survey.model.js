import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        response: String, // For open-ended questions
        selectedOptions: [String], // For multiple-choice questions
    }],
}, { timestamps: true }); // Keep track of when responses were submitted

const questionSchema = new mongoose.Schema({
    questionText: { type: String, required: true },
    questionType: {
        type: String,
        enum: ['text', 'multipleChoice', 'rating'], // Specify question types
        required: true,
    },
    options: [{ type: String }], // Array of options for multiple-choice questions
    isRequired: { type: Boolean, default: false }, // Indicates if answering is mandatory
    order: { type: Number }, // To maintain question order
}, { timestamps: true }); // Keep track of when questions were created or modified

const surveySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [questionSchema], // Array of questions
    responses: [responseSchema], // Array of responses
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'createdByType', // Allows reference to either College or Community
        required: true,
    },
    createdByType: {
        type: String,
        enum: ['College', 'Community'], // Specify whether it's created by a college or community
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'archived'], // Survey status
        default: 'active',
    },
    startDate: { type: Date, required: true }, // When the survey becomes active
    endDate: { type: Date, required: true }, // When the survey ends
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update the timestamps for survey responses
surveySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Survey = mongoose.model('Survey', surveySchema);
export default Survey;