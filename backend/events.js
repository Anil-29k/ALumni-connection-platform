const express = require('express');
const app = express();
const cors =require('cors');
app.use(cors());

app.get('/api/events', (req, res) => {
    res.json({
        upcomingEvents: [
            { id: 1, title: 'Career Fair', date: '2024-11-15', venue: 'Auditorium A', topic: 'Job Opportunities', coordinator: 'Mr. Smith', description: 'Meet potential employers.' },
            { id: 2, title: 'Alumni Meet 2024', date: '2024-12-20', venue: 'Conference Hall B', topic: 'Networking', coordinator: 'Ms. Johnson', description: 'Join us for the annual alumni meet.' }
        ],
        ongoingEvents: [
            { id: 3, title: 'Hackathon 2024', date: '2024-10-01 to 2024-10-10', venue: 'Lab C', topic: 'Coding', coordinator: 'Dr. Adams', description: 'Compete in a coding marathon.' }
        ],
        completedEvents: [
            { id: 4, title: 'Orientation 2024', date: '2024-09-01', venue: 'Hall D', topic: 'Introduction to College', coordinator: 'Dr. Brown', description: 'Welcome to the new students.' }
        ]
    });
});

app.listen(3000, () => console.log('Server running on port 3000'));
