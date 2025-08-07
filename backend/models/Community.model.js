import mongoose from 'mongoose';
import noticeSchema from './Notice.model.js';
import eventsActivitiesSchema from './Event.model.js';
const communitySchema = new mongoose.Schema({
    communityName: { type: String, required: true },
    communityProfilePhoto: { type: String, required: true },
    communityDesc: { type: String, required: true },
    createdDate: { type: Date, default: Date.now },
    membersCount: { type: Number, default: 0 },
    members: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] }, // Corrected field name
    events: eventsActivitiesSchema, // Use the eventsActivitiesSchema for events
    communityNotice: [noticeSchema],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    feedback: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
    }],
    surveys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
    }],

});

// Export the Community schema
const Community = mongoose.model('Community', communitySchema);
// export default communitySchema; // Export the schema, not the model
export default Community;