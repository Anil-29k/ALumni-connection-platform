import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MentorDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [newSession, setNewSession] = useState({
        title: '',
        description: '',
        date: '',
        time: ''
    });

    useEffect(() => {
        // Fetch mentorship requests for mentor
        const mentorId = localStorage.getItem('userId');
        axios.get(`/api/mentorship-requests/${mentorId}`)
            .then(response => setRequests(response.data))
            .catch(error => console.log(error));

        // Fetch mentor's sessions
        axios.get(`/api/mentor-sessions/${mentorId}`)
            .then(response => setSessions(response.data))
            .catch(error => console.log(error));
    }, []);

    const handleAcceptRequest = (requestId, scheduledTime) => {
        axios.post('/api/respond-mentorship', {
            requestId,
            status: 'accepted',
            scheduledTime
        })
            .then(response => alert('Request accepted! Room ID: ' + response.data.roomId))
            .catch(error => console.log(error));
    };

    const handleDeclineRequest = (requestId) => {
        axios.post('/api/respond-mentorship', {
            requestId,
            status: 'declined'
        })
            .then(response => alert('Request declined'))
            .catch(error => console.log(error));
    };

    const handleCreateSession = (event) => {
        event.preventDefault();
        const mentorId = localStorage.getItem('userId');
        axios.post('/api/create-session', {
            mentorId,
            ...newSession
        })
            .then(response => {
                alert('Session created!');
                setSessions([...sessions, response.data]);
            })
            .catch(error => console.log(error));
    };

    const handleInputChange = (event) => {
        setNewSession({
            ...newSession,
            [event.target.name]: event.target.value
        });
    };

    return (
        <div>
            <h2>Mentor Dashboard</h2>

            <h3>Mentorship Requests</h3>
            <ul>
                {requests.map(request => (
                    <li key={request._id}>
                        Request from {request.userId.username} - Status: {request.status}
                        {request.status === 'pending' && (
                            <>
                                <button onClick={() => handleAcceptRequest(request._id, prompt('Enter scheduled time'))}>
                                    Accept
                                </button>
                                <button onClick={() => handleDeclineRequest(request._id)}>Decline</button>
                            </>
                        )}
                    </li>
                ))}
            </ul>

            <h3>Create New Session/Webinar</h3>
            <form onSubmit={handleCreateSession}>
                <input
                    type="text"
                    name="title"
                    placeholder="Session Title"
                    value={newSession.title}
                    onChange={handleInputChange}
                />
                <input
                    type="text"
                    name="description"
                    placeholder="Description"
                    value={newSession.description}
                    onChange={handleInputChange}
                />
                <input
                    type="date"
                    name="date"
                    value={newSession.date}
                    onChange={handleInputChange}
                />
                <input
                    type="time"
                    name="time"
                    value={newSession.time}
                    onChange={handleInputChange}
                />
                <button type="submit">Create Session</button>
            </form>

            <h3>Your Sessions</h3>
            <ul>
                {sessions.map(session => (
                    <li key={session._id}>
                        {session.title} - {session.date} at {session.time}
                        <ul>
                            {session.participants.map(participant => (
                                <li key={participant._id}>{participant.username}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MentorDashboard;