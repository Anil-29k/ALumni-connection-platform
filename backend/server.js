import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import router from './Routes/auth.js';
import cors from 'cors';
import collage from './Routes/collageDitels.js';
import feed from './Routes/Post.js';
import event from './Routes/events.js';
import networking from './Routes/networking.js';
import feedback from './Routes/feedback.js';
import mentor from './Routes/mentor.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing (if needed)
app.use(express.json()); // Parse incoming JSON requests
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

// Use the imported auth router
app.use('/auth', router); // All routes in authRoutes will be prefixed with /auth

app.use('/collage', collage);

app.use('/feed', feed);

app.use('/eve', event);

app.use('/network',networking);

app.use('/feedback',feedback);

app.use('/mentorship',mentor);

// Default route to check if server is running
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});