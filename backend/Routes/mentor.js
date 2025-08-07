import express from 'express';
import User from '../models/User.model.js'

const mentor = express.Router();

// Get all mentors with their college name
mentor.get('/api/mentors', async (req, res) => {
    try {
        const mentors = await User.find({ mentorStatus: 'mentor' }, 'username collegeName');
        res.status(200).json(mentors);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching mentors', error });
    }
});

// Send mentorship request
mentor.post('/api/request-mentorship', async (req, res) => {
    const { mentorId, userId } = req.body;
    try {
        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.mentorStatus !== 'mentor') {
            return res.status(404).json({ message: 'Mentor not found' });
        }

        mentor.mentorshipRequests.push({ userId, status: 'pending' });
        await mentor.save();

        res.status(200).json({ message: 'Mentorship request sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error requesting mentorship', error });
    }
});

// Accept or decline mentorship request
mentor.post('/api/respond-mentorship', async (req, res) => {
    const { mentorId, requestId, status, scheduledTime } = req.body;
    try {
        const mentor = await User.findById(mentorId);
        if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

        const request = mentor.mentorshipRequests.id(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        request.status = status;
        if (status === 'accepted') {
            request.scheduledTime = scheduledTime;
            request.roomId = `room-${mentorId}-${Date.now()}`; // Generate unique room ID
        }
        await mentor.save();

        res.status(200).json({ message: 'Mentorship request updated', roomId: request.roomId });
    } catch (error) {
        res.status(500).json({ message: 'Error updating request', error });
    }
});

// Create mentorship session or webinar
mentor.post('/api/create-session', async (req, res) => {
    const { mentorId, title, description, date, time } = req.body;
    try {
        const mentor = await User.findById(mentorId);
        if (!mentor || mentor.mentorStatus !== 'mentor') {
            return res.status(403).json({ message: 'Only mentors can create sessions' });
        }

        mentor.mentorshipSessions.push({
            title,
            description,
            date,
            time,
            roomId: `session-room-${mentorId}-${Date.now()}`
        });
        await mentor.save();

        res.status(200).json({ message: 'Session created' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating session', error });
    }
});

// Register for a mentorship session/webinar
mentor.post('/api/register-session', async (req, res) => {
    const { sessionId, userId, mentorId } = req.body;
    try {
        const mentor = await User.findById(mentorId);
        const session = mentor.mentorshipSessions.id(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        session.participants.push(userId);
        await mentor.save();

        res.status(200).json({ message: 'Registered for the session', roomId: session.roomId });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for session', error });
    }
});

export default mentor;