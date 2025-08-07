import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './Home.css';

function Home() {
    const [details, setDetails] = useState(null);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem('userId'); // Get the logged-in user's ID

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`http://localhost:5000/collage/api/home/${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch details');
                }
                const data = await response.json();
                setDetails(data);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.message);
            }
        };

        fetchDetails();
    }, [userId]);

    return (
        <div className="structer">
            <Navbar />
            <div className="container-mrg">
                {error && <p className="error">{error}</p>} {/* Display error message if exists */}
                {details ? (
                    <>
                        <header className="header">
                            <img src={details.logoUrl} alt="College Logo" className="college-logo" />
                            <h1>{details.basicInfo.collegeName}</h1>
                            <h2>{details.basicInfo.location}</h2>
                        </header>

                        <div id="main">
                            <div id="details">
                                <div id="homephoto" className="flex-container">
                                    <div className="description-container">
                                        <h3>About {details.basicInfo.collegeName}</h3>
                                        <p>{details.description}</p>
                                        <p><strong>Established:</strong> {details.basicInfo.establishedYear}</p>
                                        <p><strong>Location:</strong> {details.basicInfo.location}</p>
                                        <p><strong>Contact:</strong> {details.basicInfo.contact.email}, {details.basicInfo.contact.phone}</p>
                                        <p><strong>Website:</strong> <a href={details.basicInfo.website} target="_blank" rel="noopener noreferrer">{details.basicInfo.website}</a></p>
                                    </div>
                                    <div className="image-container">
                                        <img src={details.imageUrl} alt="College" className="responsive-image" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div id="academic-info">
                            <h3>Academic Information</h3>
                            <p><strong>Degrees Offered:</strong> {details.academicInfo.degreesOffered.join(', ')}</p>
                            <p><strong>Departments:</strong> {details.academicInfo.departments.join(', ')}</p>
                            <p><strong>Faculty Count:</strong> {details.academicInfo.facultyCount}</p>
                        </div>

                        <div id="infrastructure">
                            <h3>Infrastructure</h3>
                            <p><strong>Campus Area:</strong> {details.infrastructure.campusArea}</p>
                            <p><strong>Facilities:</strong> {details.infrastructure.facilities.join(', ')}</p>
                            <p><strong>Hostel Details:</strong> {details.infrastructure.hostel.details}</p>
                        </div>

                        <div id="career-services">
                            <h3>Career Services</h3>
                            <p>{details.careerServices.careerCounseling}</p>
                            <p><strong>Internship Opportunities:</strong> {details.careerServices.internshipOpportunities.join(', ')}</p>
                            <p><strong>Job Placement Stats:</strong> {details.careerServices.jobPlacementStats}</p>
                        </div>

                        <div id="impNotic">
                            <h3>Important Notices</h3>
                            {details.notice && details.notice.length > 0 ? (
                                details.notice.map((notice) => (
                                    <div key={notice._id}>
                                        <h4>{notice.title}</h4>
                                        <p>{notice.description}</p>
                                        <small>{new Date(notice.date).toLocaleDateString()}</small>
                                    </div>
                                ))
                            ) : (
                                <p>No important notices at this time.</p>
                            )}
                        </div>

                        <div id="events">
                            <h3>Upcoming Events</h3>
                            {details.events.upcomingEvents.length > 0 ? (
                                <ul>
                                    {details.events.upcomingEvents.map((event, index) => (
                                        <li key={index}>
                                            <h4>{event.title}</h4>
                                            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                                            <p>Venue: {event.venue}</p>
                                            <p>Topic: {event.topic}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No upcoming events at this time.</p>
                            )}
                        </div>

                        <div id="gallery">
                            <h3>Gallery</h3>
                            <div className="gallery-container">
                                {details.gallery && details.gallery.length > 0 ? (
                                    details.gallery.map((image, index) => (
                                        <img key={index} src={image} alt={`Gallery ${index}`} className="gallery-image" />
                                    ))
                                ) : (
                                    <p>No gallery images available.</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
}

export default Home;