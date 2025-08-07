import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
// Define the User schema
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // Unique username for login
    email: { type: String, required: true, unique: true }, // Unique email for login
    phonenum: { type: String, required: true, unique: true }, // Unique phone number
    collagename: { type: String, required: true }, // College name
    redgnum: { type: String, required: true, unique: true }, // Unique registration number
    password: { type: String, required: true }, // Hashed password
    firstName: { type: String, required: true }, // User's first name
    lastName: { type: String, required: true }, // User's last name
    profilePhoto: { type: String }, // URL to the user's profile photo
    coverPhoto: { type: String },//URL to User Cover Photo
    bio: { type: String }, // Short bio for the user
    graduationYear: { type: Number }, // Year of graduation
    degree: { type: String }, // Degree obtained
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' }, // Reference to the College schema
    communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }], // Communities the user is part of
    alumniStatus: { type: String, default: 'Student' }, // Whether the user is an alumnus
    contactInfo: {
        linkedIn: { type: String }, // LinkedIn profile
        website: { type: String } // Personal website
    },
    connectionsRequests: [{
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    connections: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User'
        , default: []
    },
    profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' }, // Profile visibility
    interests: [{ type: String }], // User interests
    experience: [{
        jobTitle: String,
        company: String,
        duration: String // e.g., "Jan 2020 - Present"
    }],
    educationHistory: [{
        degree: String,
        institution: String,
        graduationYear: Number
    }],
    socialLinks: {
        twitter: { type: String },
        facebook: { type: String },
        instagram: { type: String },
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    mentorStatus: { type: String, enum: ['notMentor', 'mentor'], default: 'notMentor' }, // Non-mentors or mentors
    mentorshipRequests: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
        scheduledTime: Date,
        roomId: String // Unique room ID for communication
    }],
    mentorshipSessions: [{
        title: String,
        description: String,
        date: Date,
        time: String,
        participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        roomId: String // Room ID for session/webinar communication
    }]

}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Create the User model
const User = mongoose.model('User', UserSchema);
export default User;