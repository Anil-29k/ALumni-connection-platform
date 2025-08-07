import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './Profile.css'; // External CSS for styling

const Profile = () => {
    const [userProfile, setUserProfile] = useState(null);
    const userId = localStorage.getItem('userId'); // Get the logged-in user's ID

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/auth/api/profile/${userId}`);
                setUserProfile(response.data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, [userId]);

    return (
        <div className="profile-container">
            <Navbar />
            {userProfile ? (
                <div className="profile-content">
                    <div className="profile-header">
                        <div className="profile-cover">
                            <img src={userProfile.coverPhoto} alt="Cover" className="cover-image" />
                        </div>
                        <div className="profile-info">
                            <img src={userProfile.profilePhoto} alt="Profile" className="profile-image" />
                            <h1>{userProfile.firstName} {userProfile.lastName}</h1>
                            <h2>{userProfile.degree} - {userProfile.graduationYear}</h2>
                            <p>{userProfile.bio}</p>
                        </div>
                    </div>

                    <div className="profile-body">
                        <div className="profile-section">
                            <h3>About</h3>
                            <p><strong>College:</strong> {userProfile.collagename}</p>
                            <p><strong>Username:</strong> {userProfile.username}</p>
                            <p><strong>Email:</strong> {userProfile.email}</p>
                            <p><strong>Phone:</strong> {userProfile.phonenum}</p>
                        </div>
                        <div className='profile-section'>
                            <h3>Bio</h3>
                            <p>{userProfile.bio || 'Not Avilable'}</p>
                        </div>

                        <div className="profile-section">
                            <h3>Experience</h3>
                            {userProfile.experience.length > 0 ? (
                                userProfile.experience.map((exp, index) => (
                                    <div key={index} className="experience-item">
                                        <h4>{exp.jobTitle} at {exp.company}</h4>
                                        <p>{exp.duration}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No experience listed.</p>
                            )}
                        </div>

                        <div className="profile-section">
                            <h3>Education</h3>
                            {userProfile.educationHistory.length > 0 ? (
                                userProfile.educationHistory.map((edu, index) => (
                                    <div key={index} className="education-item">
                                        <h4>{edu.degree} from {edu.institution}</h4>
                                        <p>Graduated: {edu.graduationYear}</p>
                                    </div>
                                ))
                            ) : (
                                <p>No education history listed.</p>
                            )}
                        </div>

                        <div className="profile-section">
                            <h3>Connections</h3>
                            {userProfile.connections.length > 0 ? (
                                < ><p>Total Connections : {userProfile.connections.length}</p>
                                    <ul>
                                        {userProfile.connections.map((connection, index) => (
                                            <li key={index}>{connection.username}</li>
                                        ))}
                                    </ul>
                                </>
                            ) : (
                                <p>No connections found.</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Profile;