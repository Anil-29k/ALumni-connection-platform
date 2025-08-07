import express from 'express';
import User from '../models/User.model.js'; // Assuming User schema is defined
import Post from '../models/Post.model.js';
import Community from '../models/Community.model.js';

const feed = express.Router();

feed.get('/api/posts/:userId', async (req, res) => {
    const { userId } = req.params;
    const { _limit = 5, _page = 1 } = req.query;

    try {
        // Fetch the user by their ID and populate their college, communities, and connections
        const user = await User.findById(userId)
            .populate('collegeId', '_id') // Fetch college ID
            .populate('communities', '_id communityName') // Fetch community _id and communityName
            .populate('connections', '_id firstName lastName'); // Fetch user's connections

        const collegeId = user.collegeId._id;
        const communityIds = user.communities.map(community => community._id);
        const friendIds = user.connections.map(friend => friend._id);

        // Fetch friends of friends (second-degree connections)
        const secondDegreeConnections = await User.find({
            connections: { $in: friendIds }
        }).select('_id');

        const secondDegreeConnectionIds = secondDegreeConnections.map(friend => friend._id);

        // Fetch all users from the same college
        const collegeUsers = await User.find({ collegeId }).select('_id');

        const collegeUserIds = collegeUsers.map(user => user._id);

        // Fetch all communities from the same college
        const collegeCommunities = await Community.find({ collegeId }).select('_id');

        const collegeCommunityIds = collegeCommunities.map(community => community._id);

        const skip = (_page - 1) * _limit; // Calculate how many posts to skip

        // Fetch posts with priority order: Friends > Joined Communities > Friends of Friends > College
        const posts = await Post.find({
            $or: [
                { createdBy: { $in: friendIds } }, // Posts by user's friends (highest priority)
                { createdFor: { $in: communityIds } }, // Posts in communities the user has joined
                { createdBy: { $in: secondDegreeConnectionIds } }, // Posts by friends of friends
                { createdBy: { $in: collegeUserIds } }, // Posts by users in the same college
                { createdFor: { $in: collegeCommunityIds } } // Posts in communities of the same college
            ]
        })
            .populate('createdBy', '_id firstName lastName profilePhoto') // Fetch necessary fields from createdBy
            .populate('createdFor', '_id communityName') // Fetch necessary fields from createdFor
            .limit(parseInt(_limit)) // Limit results for pagination
            .skip(skip) // Skip the appropriate number of posts for pagination
            .sort({ createdAt: -1 }); // Sort by most recent posts

        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


feed.get('/api/userEvents', async (req, res) => {
    const userId = req.query.userId; // Assume userId is passed as a query parameter

    try {
        const user = await User.findById(userId).populate('collegeId communities'); // Populate college and communities

        // Fetch events from the user's college
        const collegeEvents = await Event.find({ collegeId: user.collegeId });

        // Fetch events from the communities the user is a part of
        const communityEvents = await Event.find({ communityId: { $in: user.communities } });

        // Combine events
        const combinedEvents = {
            upcomingEvents: [...collegeEvents.filter(event => event.date > new Date()), ...communityEvents.filter(event => event.date > new Date())],
            ongoingEvents: [...collegeEvents.filter(event => event.date <= new Date() && event.endDate >= new Date()), ...communityEvents.filter(event => event.date <= new Date() && event.endDate >= new Date())],
            completedEvents: [...collegeEvents.filter(event => event.endDate < new Date()), ...communityEvents.filter(event => event.endDate < new Date())]
        };

        res.json(combinedEvents);
    } catch (error) {
        console.error('Error fetching user events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


export default feed;