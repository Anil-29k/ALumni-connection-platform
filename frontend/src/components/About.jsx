import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './About.css'; // External CSS for styling

const About = () => {
  const [collegeInfo, setCollegeInfo] = useState(null);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId'); // Get the logged-in user's ID

  useEffect(() => {
    const fetchCollegeInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/collage/api/about/${userId}`);
        setCollegeInfo(response.data);
      } catch (error) {
        console.error('Error fetching college information:', error);
        setError('Failed to load college information. Please try again later.');
      }
    };

    fetchCollegeInfo();
  }, [userId]);

  return (
    <div className='structure'>
      <Navbar />
      <div className='about-container'>
        {error ? (
          <div className='error-message'>{error}</div>
        ) : !collegeInfo ? (
          <div className='loading-message'>Loading...</div>
        ) : (
          <>
            <div className='about-header'>
              <h1>About {collegeInfo.basicInfo.collegeName}</h1>
              <h2>Association: {collegeInfo.associationName}</h2>
            </div>
            <div className='about-details'>
              <div className='about-section'>
                <h3>Location</h3>
                <p>{collegeInfo.basicInfo.location}</p>
              </div>
              <div className='about-section'>
                <h3>History</h3>
                <p>{collegeInfo.collegeHistory}</p>
              </div>
              <div className='about-section'>
                <h3>Contact Information</h3>
                <p>Email: {collegeInfo.basicInfo.contact.email}</p>
                <p>Phone: {collegeInfo.basicInfo.contact.phone}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default About;