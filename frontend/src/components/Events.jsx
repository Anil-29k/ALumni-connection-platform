import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import './Events.css';

function Events() {
    const [events, setEvents] = useState({
        collegeEvents: {
            upcomingEvents: [],
            ongoingEvents: [],
            completedEvents: []
        },
        communityEvents: {
            upcomingEvents: [],
            ongoingEvents: [],
            completedEvents: []
        }
    });
    const userId = localStorage.getItem('userId'); // Get user ID from local storage

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`http://localhost:5000/eve/api/userEvents?userId=${userId}`);
                const data = await response.json();
                console.log('Fetched data:', data); // Log the response

                if (data) {
                    // Set events state with safe access and default values
                    setEvents({
                        collegeEvents: {
                            upcomingEvents: data.collegeEvents?.upcomingEvents || [],
                            ongoingEvents: data.collegeEvents?.ongoingEvents || [],
                            completedEvents: data.collegeEvents?.completedEvents || []
                        },
                        communityEvents: data.communityEvents?.[0] || { // Check the first item in the array
                            upcomingEvents: [],
                            ongoingEvents: [],
                            completedEvents: []
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        if (userId) {
            fetchEvents();
        }
    }, [userId]);

    const renderEventList = (events) => {
        if (events.length === 0) {
            return <p>No events found.</p>;
        }

        return events.map(event => (
            <div key={event._id} className="event">
                <h4>{event.title}</h4>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Venue:</strong> {event.venue}</p>
                <p><strong>Topic:</strong> {event.topic}</p>
                <p><strong>Coordinator:</strong> {event.coordinator?.name}</p>
                <p><strong>Description:</strong> {event.description}</p>
            </div>
        ));
    };

    return (
        <div className='structer'>
            <Navbar />
            <div id="events" className="container-mrg">
                <div>
                    <h2>College Events</h2>
                    {['upcomingEvents', 'ongoingEvents', 'completedEvents'].map((eventType) => (
                        <div key={eventType} id={eventType}>
                            <h3>{eventType.charAt(0).toUpperCase() + eventType.slice(1).replace('Events', ' Events')}</h3>
                            {renderEventList(events.collegeEvents[eventType])}
                        </div>
                    ))}
                </div>

                <div>
                    <h2>Community Events</h2>
                    {['upcomingEvents', 'ongoingEvents', 'completedEvents'].map((eventType) => (
                        <div key={eventType} id={`community${eventType}`}>
                            <h3>{eventType.charAt(0).toUpperCase() + eventType.slice(1).replace('Events', ' Events')}</h3>
                            {renderEventList(events.communityEvents?.[eventType] || [])} {/* Ensure eventType is checked */}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Events;