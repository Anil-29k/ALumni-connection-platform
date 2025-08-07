import mongoose from 'mongoose';
import User from './models/User.model.js';
import Community from './models/Community.model.js';
import Post from './models/Post.model.js';
const userId = '6712964641ab7afd20842907'; // Replace with the actual user ID
const communityId = '67128c800fde5a0db8a0ffe5'; // Replace with the actual community ID

const posts = [

    {
        content: 'Excited to start a new coding project! Anyone want to collaborate?',
        media: ['http://example.com/image1.jpg'],
        createdBy: userId,
        createdFor: null,
    },
    {
        content: 'Just finished reading an amazing book on AI. Highly recommend it!',
        media: ['http://example.com/image2.jpg'],
        createdBy: userId,
        createdFor: null,
    },
    {
        content: 'Check out our community event happening next week!',
        media: ['http://example.com/image3.jpg'],
        createdBy: userId,
        createdFor: communityId,
    },
    {
        content: 'Had a great time at the workshop yesterday! Learned a lot.',
        media: ['http://example.com/image4.jpg'],
        createdBy: userId,
        createdFor: null,
    },
    {
        content: 'Looking for study partners for the upcoming exams. Who’s in?',
        media: ['http://example.com/image5.jpg'],
        createdBy: userId,
        createdFor: null,
    },
];

const seedPosts = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/Fellower', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // await Post.deleteMany(); // Clear existing posts
        const createdPosts = await Post.insertMany(posts); // Insert posts

        // Update the user with the created posts
        await User.findByIdAndUpdate(userId, { $push: { posts: { $each: createdPosts } } });

        // Update the community with the created posts if applicable
        await Community.findByIdAndUpdate(communityId, { $push: { posts: { $each: createdPosts } } });

        console.log('Posts seeded successfully, and user/community updated!');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding posts:', error);
        mongoose.connection.close();
    }
};

seedPosts();