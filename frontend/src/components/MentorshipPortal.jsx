import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import MentorDashboard from './MentorDashboard';

const MentorshipPortal = () => {
    const [mentors, setMentors] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [isMentor, setIsMentor] = useState(false);  // To check if the user is a mentor
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const fetchData = async () => {
            try {
                // Fetch logged-in user details to check if the user is a mentor
                const userResponse = await axios.get(`/api/user/${userId}`);
                setIsMentor(userResponse.data.mentorStatus === 'mentor');

                // Fetch mentors from backend
                const mentorsResponse = await axios.get('/api/mentors');
                if (Array.isArray(mentorsResponse.data)) {
                    setMentors(mentorsResponse.data);
                } else {
                    throw new Error('Mentors data is not an array.');
                }

                // Fetch sessions
                const sessionsResponse = await axios.get('/api/sessions');
                if (Array.isArray(sessionsResponse.data)) {
                    setSessions(sessionsResponse.data);
                } else {
                    throw new Error('Sessions data is not an array.');
                }
            } catch (error) {
                console.error('Error:', error);
                setError('Failed to load data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const requestMentorship = async (mentorId) => {
        const userId = localStorage.getItem('userId');
        try {
            await axios.post('/api/request-mentorship', { mentorId, userId });
            alert('Mentorship request sent!');
        } catch (error) {
            console.error('Error requesting mentorship:', error);
            alert('Failed to send mentorship request. Please try again.');
        }
    };

    const registerSession = async (sessionId, mentorId) => {
        const userId = localStorage.getItem('userId');
        try {
            await axios.post('/api/register-session', { sessionId, userId, mentorId });
            alert('Registered for the session!');
        } catch (error) {
            console.error('Error registering for session:', error);
            alert('Failed to register for the session. Please try again.');
        }
    };

    // Always show the Navbar
    return (
        <div>
            <Navbar />
            <div className='container-mrg'>
                <h2>Mentorship Portal</h2>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                       
                        {/* If the user is a mentor, show the Mentor Dashboard */}
                        {isMentor && <MentorDashboard />}

                        <div>
                            <h3>Mentors</h3>
                            {mentors.length > 0 ? (
                                <ul>
                                    {mentors.map(mentor => (
                                        <li key={mentor._id}>
                                            {mentor.username} - {mentor.collegeName}
                                            <button onClick={() => requestMentorship(mentor._id)}>Request Mentorship</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No mentors available.</p>
                            )}

                            <h3>Available Sessions</h3>
                            {sessions.length > 0 ? (
                                <ul>
                                    {sessions.map(session => (
                                        <li key={session._id}>
                                            {session.title} - {session.date} at {session.time}
                                            <button onClick={() => registerSession(session._id, session.mentorId)}>Register</button>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No sessions available.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MentorshipPortal;