import express from 'express';
import User from '../models/User.model.js'; // Assuming User schema is defined
import College from '../models/Collage.model.js';

const collage = express.Router();

//Home Component Transfor Latter
collage.get('/api/home/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate('collegeId');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const collegeDetails = await College.findById(user.collegeId);
        if (!collegeDetails) return res.status(404).json({ message: 'College not found' });

        res.json(collegeDetails);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// GET route to fetch college info
collage.get('/api/about/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId).populate('collegeId');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const collegeDetails = await College.findById(user.collegeId);
        if (!collegeDetails) return res.status(404).json({ message: 'College not found' });

        res.json(collegeDetails);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


export default collage;