// server.js
import express from 'express';
import User from '../models/User.model.js';
import College from '../models/Collage.model.js';
import Community from '../models/Community.model.js';
import dotenv from 'dotenv';
dotenv.config();

const network = express.Router();

// Get connection requests for the user
network.get('/api/connectionRequests', async (req, res) => {
    const userId = req.query.userId;  // Get user ID from query parameters

    try {
        // Find the user by their ID and populate the senderId in connectionsRequests
        const user = await User.findById(userId)
            .populate({
                path: 'connectionsRequests.senderId',
                select: 'firstName lastName profilePhoto _id'  // Select only necessary fields
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user has any connection requests
        if (!user.connectionsRequests || user.connectionsRequests.length === 0) {
            return res.status(200).json([]);  // Return an empty array if there are no requests
        }

        // Send the connection requests array with populated sender details
        res.status(200).json(user.connectionsRequests);
    } catch (error) {
        console.error('Error fetching connection requests:', error);
        res.status(500).json({ message: 'Error fetching connection requests' });
    }
});

// Get user's established connections
network.get('/api/myConnections', async (req, res) => {
    const userId = req.query.userId;

    try {
        const user = await User.findById(userId).populate('connections', 'firstName lastName profilePhoto _id');
        res.status(200).json(user.connections);
    } catch (error) {
        console.error('Error fetching connections:', error);
        res.status(500).json({ message: 'Error fetching connections' });
    }
});

// Handle accepting a connection request
network.post('/api/acceptRequest', async (req, res) => {
    const { requestId, userId } = req.body; // Ensure userId is included in the request body

    try {
        // Find the user who sent the request
        const request = await User.findOne({ 'connectionsRequests._id': requestId });

        if (!request) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        // Update the request status to accepted
        const requestIndex = request.connectionsRequests.findIndex(req => req._id.toString() === requestId);
        if (requestIndex === -1) {
            return res.status(404).json({ message: 'Connection request not found' });
        }

        // Add the sender to the user's connections and remove the request
        const senderId = request.connectionsRequests[requestIndex].senderId;
        await Promise.all([

            User.findByIdAndUpdate(userId, {
                $addToSet: { connections: senderId },
                $pull: { connectionsRequests: { _id: requestId } }
            }),
            User.findByIdAndUpdate(senderId, {
                $addToSet: { connections: userId }
            })
        ])

        res.status(200).json({ message: 'Connection request accepted' });
    } catch (error) {
        console.error('Error accepting connection request:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Handle declining a connection request
network.post('/api/declineRequest', async (req, res) => {
    const { requestId } = req.body;

    try {
        await ConnectionRequest.findByIdAndDelete(requestId);
        res.status(200).json({ message: 'Connection request declined' });
    } catch (error) {
        console.error('Error declining request:', error);
        res.status(500).json({ message: 'Error declining request' });
    }
});

// Fetch people in the user's community and college, excluding the user themselves and already connected users
network.get('/api/people', async (req, res) => {
    const { userId } = req.query;  // Assuming userId is passed as query parameter
    try {
        const user = await User.findById(userId).populate('collegeId');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch users from the same college and community, excluding the logged-in user and already connected users
        const people = await User.find({
            collegeId: user.collegeId,
            _id: { $ne: userId, $nin: user.connections } // Exclude self and already connected
        }).populate('collegeId');

        res.json(people);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Fetch communities associated with the user's college
network.get('/api/communities', async (req, res) => {
    const { userId } = req.query;  // Assuming userId is passed as a query parameter
    try {
        const user = await User.findById(userId).populate('collegeId');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Fetch communities associated with the user's college
        const college = await College.findById(user.collegeId).populate('communities');
        if (college && college.communities) {
            res.json(college.communities);
        } else {
            res.status(404).json({ message: 'No communities found for this college' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to join a community (send a request or auto-join based on your design)
network.post('/api/join', async (req, res) => {
    const { userId, communityId } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const community = await Community.findById(communityId);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        // Check if the user is already a member
        if (!community.members.includes(userId)) {
            // Add user to community members
            community.members.push(userId); // Add user to community members
            community.membersCount += 1; // Update members count
            await community.save(); // Save community

            // Add community to user's joined communities
            if (!user.communities.includes(communityId)) {
                user.communities.push(communityId);
                await user.save();
            }

            res.json({ message: `Joined community ID ${communityId}` });
        } else {
            res.status(400).json({ message: 'Already a member of this community' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST route to send a connection request
network.post('/api/connect', async (req, res) => {
    const { personId, userId } = req.body;

    try {
        const user = await User.findById(userId); // The user sending the request
        const personToConnect = await User.findById(personId); // The recipient of the request

        if (!user || !personToConnect) {
            return res.status(404).json({ message: 'User or person to connect not found' });
        }

        // Check if the connection request can be sent
        const requestAlreadySent = personToConnect.connectionsRequests.some(request => request.senderId.toString() === userId);
        const alreadyConnected = user.connections.includes(personId);

        if (!alreadyConnected && !requestAlreadySent) {
            // Send connection request to the recipient
            personToConnect.connectionsRequests.push({ senderId: userId }); // Add sender's ID to recipient's connection requests
            await personToConnect.save(); // Save changes to the recipient

            return res.status(200).json({ message: `Connection request sent to ${personToConnect.firstName} ${personToConnect.lastName}` });
        } else {
            return res.status(400).json({ message: 'You are already connected with this user or have sent a request.' });
        }
    } catch (error) {
        console.error('Error connecting users:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

export default network;