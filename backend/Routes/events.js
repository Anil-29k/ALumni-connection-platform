import express from 'express';
import User from '../models/User.model.js';
import College from '../models/Collage.model.js';
import Community from '../models/Community.model.js';
const event = express.Router();

// Example User model (import it if you have it)

event.get('/api/userEvents', async (req, res) => {
    const userId = req.query.userId; // Assuming userId is sent in the query

    try {
        const user = await User.findById(userId).populate('communities').populate('collegeId');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch events from user's college and their joined communities
        const collegeEvents = await College.findOne({ _id: user.collegeId }).select('events'); // Adjust based on your College model
        const communityEvents = await Community.find({ _id: { $in: user.communities } }).select('events'); // Adjust based on your Community model

        res.status(200).json({
            collegeEvents: collegeEvents.events,
            communityEvents: communityEvents.flatMap(community => community.events)
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Error fetching events' });
    }
});

export default event;