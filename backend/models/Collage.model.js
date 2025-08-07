import mongoose from 'mongoose';
import eventsActivitiesSchema from './Event.model.js'; // Ensure this is the correct events schema
import noticeSchema from './Notice.model.js';

const collegeSchema = new mongoose.Schema({
    basicInfo: {
        collegeName: { type: String, required: true, unique: true },
        location: { type: String, required: true },
        contact: {
            email: { type: String, required: true, unique: true },
            phone: { type: String }
        },
        website: { type: String, unique: true },
        establishedYear: { type: Number },
        accreditation: [{ type: String }]
    },
    description: { type: String },
    collegeHistory: { type: String },
    academicInfo: {
        degreesOffered: [{ type: String }],
        departments: [{ type: String }],
        courses: [{ type: String }],
        facultyCount: { type: Number }
    },
    infrastructure: {
        campusArea: { type: String },
        facilities: [{ type: String }],
        hostel: {
            available: { type: Boolean },
            details: { type: String }
        },
        classrooms: { type: Number },
        labs: { type: Number }
    },
    events: eventsActivitiesSchema, // Use the eventsActivitiesSchema for events
    careerServices: {
        careerCounseling: { type: String },
        internshipOpportunities: [{ type: String }],
        jobPlacementStats: { type: String }
    },
    socialMedia: {
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
        linkedin: { type: String },
        onlineGroups: [{ type: String }]
    },
    collaborations: {
        partnerInstitutions: [{ type: String }],
        industryPartnerships: [{ type: String }]
    },
    rankingsRecognition: {
        rankings: [{ type: String }],
        awards: [{ type: String }]
    },
    notice: [noticeSchema],
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],
    feedback: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
    }],
    surveys: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Survey',
    }],
    miscellaneous: {
        motto: { type: String },
        campusCulture: { type: String },
        healthAndSafety: { type: String }
    }
});

// Create and export the College model
const College = mongoose.model('College', collegeSchema);
export default College;