import mongoose from 'mongoose';

// Define the Post schema
const PostSchema = new mongoose.Schema({
    content: { type: String }, // Text content of the post
    media: [{ // Array to hold media URLs (images/videos)
        type: String, // URL of the media
    }],
    createdBy: { // Reference to the User or Community that created the post
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Assuming the post is created by a user
    },
    createdFor: { // Can be either a user or community
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community' // Reference to Community (optional)
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create and export the Post model
const Post = mongoose.model('Post', PostSchema);
export default Post;