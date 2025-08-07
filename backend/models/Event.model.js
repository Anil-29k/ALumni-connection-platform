import mongoose from 'mongoose';

// Define the schema for a single event
const coordinatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: {
        email: { type: String, required: true },
        phone: { type: String }
    }
});

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    topic: { type: String, required: true },
    coordinator: coordinatorSchema, // Use the coordinator schema here
    description: { type: String, required: true }
});

// Define the main Event schema
const eventsActivitiesSchema = new mongoose.Schema({
    upcomingEvents: [eventSchema],
    ongoingEvents: [eventSchema],
    completedEvents: [eventSchema]
});

// Export the eventsActivitiesSchema instead of the model
export default eventsActivitiesSchema; // Only export the schema