import express from 'express';
import User from '../models/User.model.js'; // Adjust the path according to your project structure
import College from '../models/Collage.model.js';
import bcrypt from 'bcrypt'; // Ensure bcrypt is installed
import jwt from 'jsonwebtoken'; // For generating tokens
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Login route (allow login via username or email)
router.post('/api/login', async (req, res) => {
    const { loginId, loginpassword } = req.body;

    try {
        const user = await User.findOne({ $or: [{ email: loginId }, { username: loginId }] });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username/email' });
        }
        const isPasswordValid = await bcrypt.compare(loginpassword, user.password);
        console.log(`Password valid: ${isPasswordValid}`); // Log password validation result

        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        // Create a token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ success: true, message: 'Login successful!', token, userId: user._id, username: user.username });
    } catch (error) {
        console.error("Login error: ", error); // Log the error
        res.status(500).json({ success: false, message: 'Error during login', error });
    }
});

// Signup route
router.post('/api/signup', async (req, res) => {
    const { username, email, phonenum, redgnum, collagename } = req.body;
    const errorMessages = [];

    try {
        // Check if the provided college exists
        const college = await College.findOne({ 'basicInfo.collegeName': collagename });
        if (!college) {
            errorMessages.push('College not found. Please select a valid college.');
        }

        // Check for existing user with the same username
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            errorMessages.push('Username already in use.');
        }

        // Check for existing user with the same email
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            errorMessages.push('Email already in use.');
        }

        // Check for existing user with the same phone number
        const existingPhoneNum = await User.findOne({ phonenum });
        if (existingPhoneNum) {
            errorMessages.push('Phone number already in use.');
        }

        // Check for existing user with the same registration number
        const existingRegNum = await User.findOne({ redgnum });
        if (existingRegNum) {
            errorMessages.push('Registration number already in use.');
        }

        // If there are error messages, return them
        if (errorMessages.length > 0) {
            return res.json({ success: false, messages: errorMessages });
        }
        const newUser = new User({
            ...req.body,
            collegeId: college._id // Assign the college ID based on the found college
        });
        await newUser.save();
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' })
        res.json({ success: true, message: 'Signup successful!',token, userId: newUser._id ,username:username});
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error during signup', error });
    }
});

// Fetch college names route
router.get('/api/colleges', async (req, res) => {
    try {
        const colleges = await College.find({}, 'basicInfo.collegeName'); // Fetch only the college names
        const formattedColleges = colleges.map((college) => ({
            id: college._id,
            name: college.basicInfo.collegeName,
        }));
        res.json(formattedColleges);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching colleges', error });
    }
});

// get profile detils
router.get('/api/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const userProfile = await User.findById(userId)
            .populate('connections', 'username')
            .exec();
        if (!userProfile) return res.status(404).json({ message: 'User not found' });

        res.json(userProfile);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Verify Old Password
router.post('/api/verify-password/:userId', async (req, res) => {
    const { oldPassword } = req.body;
    const { userId } = req.params;

    try {
        const user = await User.findById(userId);
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid old password' });

        res.json({ message: 'Old password verified successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});


// Change Password
router.put('/api/change-password/:userId', async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});


// Update Profile

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use path.join to create the upload directory path
const uploadDir = path.join(__dirname, '../../MediaStorage');
const upload = multer({ dest: uploadDir });
// Route to update user profile
router.put('/api/updateProfile/:userId', upload.single('profilePhoto'), async (req, res) => {
    const { userId } = req.params;

    // Initialize the updates object
    const updates = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phonenum: req.body.phonenum,
        bio: req.body.bio,
        alumniStatus: req.body.alumniStatus,
    };

    try {
        // Parse JSON fields only if they exist to avoid errors
        if (req.body.interests) {
            updates.interests = JSON.parse(req.body.interests);
        }
        if (req.body.educationHistory) {
            updates.educationHistory = JSON.parse(req.body.educationHistory);
        }
        if (req.body.experience) {
            updates.experience = JSON.parse(req.body.experience);
        }
        if (req.body.socialLinks) {
            updates.socialLinks = JSON.parse(req.body.socialLinks);
        }

        // If a file was uploaded, set the profile photo path
        if (req.file) {
            updates.profilePhoto = req.file.path; // Ensure this path is valid
        }

        // Find the user by ID and update
        const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'Profile updated successfully.', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error); // Log the error for debugging
        res.status(500).json({ message: 'Error updating profile.', error: error.message });
    }
});

// Export the router
export default router;