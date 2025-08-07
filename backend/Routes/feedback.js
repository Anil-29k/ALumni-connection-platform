import express from 'express';
import Feedback from '../models/Feedback.model.js';
import College from '../models/Collage.model.js';
import Community from '../models/Community.model.js';
import Survey from '../models/Survey.model.js';
import User from '../models/User.model.js';
import { use } from 'chai';

const feedback = express.Router();

// POST: Submit feedback
feedback.post('/api/feedback', async (req, res) => {
    const { email, feedback, entityId, entityType, userId } = req.body; // Include entityType in the request body

    try {
        // Find user by userId passed as a query parameter
        const user = await User.findById(userId).populate('communities collegeId');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Ensure the user is submitting feedback for a valid entity they are associated with
        const isEntityValid = user.communities.some((community) => community._id.toString() === entityId) ||
            user.collegeId._id.toString() === entityId;
            
        if (!isEntityValid) {
            return res.status(403).json({ message: 'You are not authorized to provide feedback for this entity.' });
        }

        // Create the new feedback object
        const newFeedback = new Feedback({
            email,
            feedback,
            entityId,
            entityType, // Add entityType to the feedback
            submittedBy: userId, // Use userId from request body
        });

        await newFeedback.save();

        // Update the corresponding entity (College or Community)
        let entity;
        if (entityType === 'College') {
            entity = await College.findById(entityId);
        } else if (entityType === 'Community') {
            entity = await Community.findById(entityId);
        }

        if (entity) {
            entity.feedback.push(newFeedback._id); // Add feedback ID to the entity's feedback array
            await entity.save();
        }

        res.status(201).json({ message: 'Feedback submitted successfully!', feedback: newFeedback });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ message: 'Error submitting feedback.', error });
    }
});

// GET: Fetch surveys specific to user's college and communities
feedback.get('/api/surveys', async (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters

    try {
        const user = await User.findById(userId).populate('communities collegeId');

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const communityIds = user.communities.map(community => community._id);
        const collegeId = user.collegeId;

        // Fetch surveys related to user's communities and college
        const surveys = await Survey.find({
            $or: [
                { createdBy: { $in: communityIds } },
                { createdBy: collegeId }
            ]
        }).populate('createdBy', 'collegeName communityName'); // Populate with entity names

        res.status(200).json(surveys);
    } catch (error) {
        console.error('Error fetching surveys:', error);
        res.status(500).json({ message: 'Error fetching surveys.', error });
    }
});

// GET: Fetch user's associated entities (college and communities)
feedback.get('/api/user/entities', async (req, res) => {
    const userId = req.query.userId; // Get userId from query parameters

    try {
        const user = await User.findById(userId)
            .populate('collegeId', 'basicInfo.collegeName') // Only populate collegeName from College
            .populate('communities', 'communityName'); // Only populate communityName from Communities

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Combine college and communities in one response
        const entities = [
            {
                type: 'college',
                _id: user.collegeId?._id,
                name: user?.collagename,
            },
            ...user.communities.map(community => ({
                type: 'community',
                _id: community._id,
                name: community.communityName,
            }))
        ];

        res.status(200).json(entities);
    } catch (error) {
        console.error('Error fetching user entities:', error);
        res.status(500).json({ message: 'Error fetching user entities.', error });
    }
});

// Add more routes as necessary for entities, etc.

export default feedback;