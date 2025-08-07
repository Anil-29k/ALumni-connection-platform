import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';

function FeedbackSurvey() {
    const [feedbackEmail, setFeedbackEmail] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [selectedEntity, setSelectedEntity] = useState('');
    const [entities, setEntities] = useState([]); // Ensure it's initialized as an empty array
    const [surveys, setSurveys] = useState([]);
    const userId = localStorage.getItem('userId');

    // Fetch the communities and surveys from the backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetching communities and colleges the user is associated with
                const response = await fetch(`http://localhost:5000/feedback/api/user/entities?userId=${userId}`);
                const data = await response.json();
                console.log(data);
                
                // Ensure 'data' is an array before setting it as state
                if (Array.isArray(data)) {
                    setEntities(data);
                } else {
                    console.error('Data fetched is not an array:', data);
                }

                // Fetching surveys related to those entities
                const surveyResponse = await fetch(`http://localhost:5000/feedback/api/surveys?userId=${userId}`);
                const surveyData = await surveyResponse.json();
                setSurveys(surveyData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [userId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Determine the entity type based on selectedEntity
            const selectedEntityData = entities.find(entity => entity._id === selectedEntity);
            const entityType = selectedEntityData ? selectedEntityData.type.charAt(0).toUpperCase() + selectedEntityData.type.slice(1) : '';

            const response = await fetch('http://localhost:5000/feedback/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: feedbackEmail,
                    feedback: feedbackText,
                    entityId: selectedEntity, // entityId will refer to both college or community
                    entityType, // Include the entityType
                    userId, // Include userId for validation
                }),
            });

            if (response.ok) {
                alert('Feedback submitted successfully!');
                setFeedbackEmail('');
                setFeedbackText('');
                setSelectedEntity('');
            } else {
                const errorData = await response.json();
                alert(`Error submitting feedback: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div className='structer'>
            <Navbar />
            <div id="feedback" className='container-mrg'>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="feedbackemail">Enter Email:</label>
                    <input
                        type="email"
                        name='feedbackemail'
                        placeholder='Email'
                        id='feedbackemail'
                        value={feedbackEmail}
                        onChange={(e) => setFeedbackEmail(e.target.value)}
                        required
                    />

                    <label htmlFor="entity">Select College/Community:</label>
                    <select
                        id="entity"
                        value={selectedEntity}
                        onChange={(e) => setSelectedEntity(e.target.value)}
                        required
                    >
                        <option value="">Select a college or community</option>
                        {entities.length > 0 ? (
                            entities.map((entity) => (
                                <option key={entity._id} value={entity._id}>
                                    {entity.name}
                                </option>
                            ))
                        ) : (
                            <option value="" disabled>No entities available</option>
                        )}
                    </select>

                    <label htmlFor="feedbacktext">Enter Message:</label>
                    <textarea
                        name="feedbacktext"
                        id="feedbacktext"
                        cols='20'
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        required
                    ></textarea>

                    <button type="submit">Submit Feedback</button>
                </form>

                <div className="surveys">
                    <h2>Available Surveys</h2>
                    {surveys.length > 0 ? (
                        <ul>
                            {surveys.map((survey) => (
                                <li key={survey._id}>
                                    <h3>{survey.title}</h3>
                                    <p>{survey.description}</p>
                                    <a href={`/surveys/${survey._id}`}>Take Survey</a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No surveys available at this time.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default FeedbackSurvey;