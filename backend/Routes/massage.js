import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import User from '../models/User.model.js';
import Message from '../models/Message.model.js';

// MongoDB connection setup (replace with your actual connection string)
mongoose.connect('mongodb://localhost:27017/Fellower', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Set up Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Allow requests from your frontend
        methods: ['GET', 'POST'],
        credentials: true // Allow credentials if necessary
    }
});

// Middleware
app.use(cors()); // Apply CORS middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('socketio', io);
// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename
    }
});
const upload = multer({ storage }); // Store the files with unique names

// Store connected users
const userSockets = {};

// API endpoint to get friends list
app.get('/api/friends/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const user = await User.findById(userId).populate('connections'); // Adjust this logic as needed
        res.json(user ? user.connections : []);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends list', error });
    }
});

// API endpoint to send a message
app.post('/api/sendMessages', async (req, res) => {
    const { userId, recipientId, message, file, sendTime } = req.body;

    try {
        // Fetch usernames for both sender and recipient
        const sender = await User.findById(userId).select('username');
        const recipient = await User.findById(recipientId).select('username');

        if (!sender || !recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newMessage = new Message({
            userId,
            recipientId,
            senderName: sender.username,
            recipientName: recipient.username,
            message,
            file,
            sendTime,
        });

        await newMessage.save();

        // // Emit the message to the recipient
        const recipientSocketId = userSockets[recipientId];
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('receiveMessage', newMessage);
        } else {
            // console.log(`User ${recipientId} is not connected.`);
            // Optionally, save the message to the database for later delivery
        }

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message', error });
    }
});

// API endpoint to get messages for a chat
app.get('/api/messages/:userId/:friendId', async (req, res) => {
    const { userId, friendId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { userId, recipientId: friendId },
                { userId: friendId, recipientId: userId },
            ],
            deleteFor: { $ne: userId } // Exclude messages deleted by the user
        }).sort({ sendTime: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
});

// API endpoint to delete a message

// Delete message only for the current user
app.delete('/api/deleteMessageForMe/:messageId/:userId', async (req, res) => {
    const { messageId, userId } = req.params;
    console.log(messageId, userId);

    try {
        await Message.findByIdAndUpdate(messageId, { $addToSet: { deleteFor: userId } });
        res.status(200).json({ message: 'Message deleted for me' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Delete message for everyone
app.delete('/api/deleteMessageForEveryone/:messageId/:userId', async (req, res) => {
    const { messageId, userId } = req.params;
    try {
        const message = await Message.findById(messageId);

        // Allow only the sender to delete for everyone
        if (message.userId.toString() === userId) {
            await Message.findByIdAndDelete(messageId);
            req.app.get('socketio').emit('messageDeleted', { messageId })
            res.status(200).json({ message: 'Message deleted for everyone' });
        } else {
            res.status(403).json({ error: 'Only the sender can delete the message for everyone' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

// Socket.io connection
io.on('connection', (socket) => {
    // console.log('User connected:', socket.id);

    // // Store the user's socket ID
    socket.on('registerUser', (userId) => {
        // console.log(userId);
        userSockets[userId] = socket.id; // Associate user ID with socket ID
        // console.log(`User ${userId} registered with socket ID ${socket.id}`);
    });

    socket.on('callUser', ({ userId, singleData }) => {
        socket.to(userId).emit('incommingCall', { signal: singleData, userId: socket.id });
    });
    socket.on('acceptCall', ({ userId, signal }) => {
        socket.to(userId).emit('callAcepted', signal);
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        // console.log('User disconnected:', socket.id);
        // Optionally remove the user's socket ID from userSockets
        for (const userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                // console.log(`User ${userId} disconnected and removed.`);
                break;
            }
        }
    });
});

// Endpoint to handle file uploads
app.post('/api/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        const fileUrl = `http://localhost:${process.env.PORT || 3000}/uploads/${req.file.filename}`; // Create URL for the uploaded file
        res.json({ message: 'File uploaded successfully', file: fileUrl }); // Return file URL
    } else {
        res.status(400).json({ message: 'File upload failed' });
    }
});





// Start the server
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});