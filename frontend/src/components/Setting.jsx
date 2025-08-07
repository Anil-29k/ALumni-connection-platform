import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Setting.css'; // Assuming improved CSS styles are applied
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Settings = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();
    const [newProfilePhoto, setNewProfilePhoto] = useState(null); // State for new profile photo

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://localhost:5000/auth/api/profile/${userId}`);
                const fetchedUserProfile = {
                    ...response.data,
                    socialLinks: response.data.socialLinks || { twitter: '', facebook: '', instagram: '' }, // Initialize if not present
                };
                setUserProfile(fetchedUserProfile);
                setLoading(false);
            } catch (error) {
                toast.error('Error fetching user profile.');
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId]);

    const handleUpdateProfile = async (updatedData) => {
        try {
            // Form data to handle file upload
            const formData = new FormData();
            formData.append('firstName', updatedData.firstName);
            formData.append('lastName', updatedData.lastName);
            formData.append('email', updatedData.email);
            formData.append('phonenum', updatedData.phonenum);
            formData.append('bio', updatedData.bio);
            formData.append('alumniStatus', updatedData.alumniStatus); // Include alumni status
            formData.append('interests', JSON.stringify(updatedData.interests));
            formData.append('educationHistory', JSON.stringify(updatedData.educationHistory));
            formData.append('experience', JSON.stringify(updatedData.experience));
            formData.append('socialLinks', JSON.stringify(updatedData.socialLinks));

            // Append new profile photo if exists
            if (newProfilePhoto) {
                formData.append('profilePhoto', newProfilePhoto);
            }

            await axios.put(`http://localhost:5000/auth/api/updateProfile/${userId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Set content type for file upload
                },
            });

            toast.success('Profile updated successfully!');
            setUserProfile(updatedData); // Update local userProfile state
            setNewProfilePhoto(null); // Reset profile photo state
        } catch (error) {
            toast.error('Error updating profile.');
        }
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all password fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password don't match.");
            return;
        }

        try {
            await axios.put(`http://localhost:5000/auth/api/change-password/${userId}`, { oldPassword, newPassword });
            toast.success('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setIsUpdatingPassword(false);
        } catch (error) {
            toast.error('Error changing password. Please check your old password.');
        }
    };

    const verifyOldPassword = async () => {
        if (!oldPassword) {
            toast.error('Please enter your old password.');
            return;
        }

        try {
            await axios.post(`http://localhost:5000/auth/api/verify-password/${userId}`, { oldPassword });
            toast.success('Old password verified successfully. Enter a new password.');
            setIsUpdatingPassword(true);
        } catch (error) {
            toast.error('Old password is incorrect.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userId');
        navigate('/');
    };

    const handleAddInterest = () => {
        if (userProfile.interests.length < 5) {
            setUserProfile({
                ...userProfile,
                interests: [...userProfile.interests, ''],
            });
        } else {
            toast.warning('You can only add up to 5 interests.');
        }
    };

    const handleInterestChange = (index, value) => {
        const updatedInterests = [...userProfile.interests];
        updatedInterests[index] = value;
        setUserProfile({ ...userProfile, interests: updatedInterests });
    };

    const handleRemoveInterest = (index) => {
        const updatedInterests = userProfile.interests.filter((_, i) => i !== index);
        setUserProfile({ ...userProfile, interests: updatedInterests });
    };

    const handleEducationChange = (index, field, value) => {
        const updatedEducationHistory = [...userProfile.educationHistory];
        updatedEducationHistory[index] = { ...updatedEducationHistory[index], [field]: value };
        setUserProfile({ ...userProfile, educationHistory: updatedEducationHistory });
    };

    const handleAddEducation = () => {
        setUserProfile({
            ...userProfile,
            educationHistory: [...userProfile.educationHistory, { institution: '', degree: '', graduationYear: '' }],
        });
    };

    const handleRemoveEducation = (index) => {
        const updatedEducationHistory = userProfile.educationHistory.filter((_, i) => i !== index);
        setUserProfile({ ...userProfile, educationHistory: updatedEducationHistory });
    };

    const handleExperienceChange = (index, field, value) => {
        const updatedExperience = [...userProfile.experience];
        updatedExperience[index] = { ...updatedExperience[index], [field]: value };
        setUserProfile({ ...userProfile, experience: updatedExperience });
    };

    const handleAddExperience = () => {
        setUserProfile({
            ...userProfile,
            experience: [...userProfile.experience, { jobTitle: '', company: '', duration: '' }],
        });
    };

    const handleRemoveExperience = (index) => {
        const updatedExperience = userProfile.experience.filter((_, i) => i !== index);
        setUserProfile({ ...userProfile, experience: updatedExperience });
    };

    const handleSocialLinkChange = (platform, value) => {
        setUserProfile({
            ...userProfile,
            socialLinks: { ...userProfile.socialLinks, [platform]: value },
        });
    };

    const handleProfilePhotoChange = (e) => {
        setNewProfilePhoto(e.target.files[0]); // Set the new profile photo
    };

    return (
        <div className='settings-container'>
            <Navbar />
            <div className='settings-content'>
                <h1>Settings</h1>
                {loading ? <p>Loading profile...</p> : (
                    <>
                        <div className='profile-section'>
                            <h3>Update Profile</h3>
                            {userProfile && (
                                <form
                                    onSubmit={e => {
                                        e.preventDefault();
                                        const updatedData = {
                                            firstName: e.target.firstName.value,
                                            lastName: e.target.lastName.value,
                                            email: e.target.email.value,
                                            phonenum: e.target.phonenum.value,
                                            bio: e.target.bio.value,
                                            alumniStatus: e.target.alumniStatus.value, // Get alumni status from dropdown
                                            interests: userProfile.interests,
                                            educationHistory: userProfile.educationHistory,
                                            experience: userProfile.experience,
                                            socialLinks: userProfile.socialLinks,
                                        };
                                        handleUpdateProfile(updatedData);
                                    }}
                                >
                                    <label>
                                        First Name:
                                        <input type="text" name="firstName" defaultValue={userProfile.firstName} required />
                                    </label>
                                    <label>
                                        Last Name:
                                        <input type="text" name="lastName" defaultValue={userProfile.lastName} required />
                                    </label>
                                    <label>
                                        Email:
                                        <input type="email" name="email" defaultValue={userProfile.email} required />
                                    </label>
                                    <label>
                                        Phone Number:
                                        <input type="text" name="phonenum" defaultValue={userProfile.phonenum} required />
                                    </label>
                                    <label>
                                        Bio:
                                        <textarea name="bio" defaultValue={userProfile.bio} />
                                    </label>

                                    <label>
                                        Alumni Status:
                                        <select name="alumniStatus" defaultValue={userProfile.alumniStatus} required>
                                            <option value="Alumni">Alumni</option>
                                            <option value="Student">Student</option>
                                            <option value="Current Faculty">Current Faculty</option>
                                            <option value="Former Faculty">Former Faculty</option>
                                        </select>
                                    </label>

                                    <label>
                                        Profile Photo:
                                        <input type="file" accept="image/*" onChange={handleProfilePhotoChange} />
                                    </label>

                                    <div className="interest-section">
                                        <h4>Interests</h4>
                                        {userProfile.interests.map((interest, index) => (
                                            <div key={index} className="interest-input">
                                                <input
                                                    type="text"
                                                    value={interest}
                                                    onChange={(e) => handleInterestChange(index, e.target.value)}
                                                />
                                                <button type="button" onClick={() => handleRemoveInterest(index)}>Remove</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={handleAddInterest}>Add Interest</button>
                                    </div>

                                    <div className="education-section">
                                        <h4>Education History</h4>
                                        {userProfile.educationHistory.map((edu, index) => (
                                            <div key={index} className="education-input">
                                                <input
                                                    type="text"
                                                    placeholder="Institution"
                                                    value={edu.institution}
                                                    onChange={(e) => handleEducationChange(index, 'institution', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Degree"
                                                    value={edu.degree}
                                                    onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Graduation Year"
                                                    value={edu.graduationYear}
                                                    onChange={(e) => handleEducationChange(index, 'graduationYear', e.target.value)}
                                                />
                                                <button type="button" onClick={() => handleRemoveEducation(index)}>Remove</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={handleAddEducation}>Add Education</button>
                                    </div>

                                    <div className="experience-section">
                                        <h4>Experience</h4>
                                        {userProfile.experience.map((exp, index) => (
                                            <div key={index} className="experience-input">
                                                <input
                                                    type="text"
                                                    placeholder="Job Title"
                                                    value={exp.jobTitle}
                                                    onChange={(e) => handleExperienceChange(index, 'jobTitle', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Company"
                                                    value={exp.company}
                                                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Duration"
                                                    value={exp.duration}
                                                    onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                                                />
                                                <button type="button" onClick={() => handleRemoveExperience(index)}>Remove</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={handleAddExperience}>Add Experience</button>
                                    </div>

                                    <div className="social-links-section">
                                        <h4>Social Links</h4>
                                        <label>
                                            Twitter:
                                            <input
                                                type="text"
                                                value={userProfile.socialLinks.twitter}
                                                onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Facebook:
                                            <input
                                                type="text"
                                                value={userProfile.socialLinks.facebook}
                                                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                                            />
                                        </label>
                                        <label>
                                            Instagram:
                                            <input
                                                type="text"
                                                value={userProfile.socialLinks.instagram}
                                                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    <button type="submit">Update Profile</button>
                                </form>
                            )}
                        </div>

                        <div className="password-section">
                            <h3>Change Password</h3>
                            {isUpdatingPassword ? (
                                <form onSubmit={e => { e.preventDefault(); handleChangePassword(); }}>
                                    <label>
                                        Old Password:
                                        <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                                    </label>
                                    <label>
                                        New Password:
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                    </label>
                                    <label>
                                        Confirm New Password:
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                    </label>
                                    <button type="submit">Change Password</button>
                                </form>
                            ) : (
                                <button onClick={verifyOldPassword}>Change Password</button>
                            )}
                        </div>

                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default Settings;