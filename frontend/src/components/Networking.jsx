import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Modal from 'react-modal';
import axios from 'axios';
import './Networking.css';

Modal.setAppElement('#root');

function Networking() {
    const [people, setPeople] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connecting, setConnecting] = useState(false);
    const [joining, setJoining] = useState(false);
    const [activeTab, setActiveTab] = useState('people');
    const [connectionRequests, setConnectionRequests] = useState([]);
    const [myConnections, setMyConnections] = useState([]);

    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                console.error("User ID not available");
                return;
            }

            try {
                const [peopleResponse, communitiesResponse, requestsResponse, connectionsResponse] = await Promise.all([
                    axios.get(`http://localhost:5000/network/api/people?userId=${userId}`),
                    axios.get(`http://localhost:5000/network/api/communities?userId=${userId}`),
                    axios.get(`http://localhost:5000/network/api/connectionRequests?userId=${userId}`),
                    axios.get(`http://localhost:5000/network/api/myConnections?userId=${userId}`)
                ]);

                setPeople(peopleResponse.data || []);
                setCommunities(communitiesResponse.data || []);
                setConnectionRequests(requestsResponse.data || []);
                setMyConnections(connectionsResponse.data || []);
            } catch (error) {
                if (error.response) {
                    console.error('Error fetching data:', error.response.data);
                    alert(`Error: ${error.response.data.message || 'Failed to fetch data.'}`);
                } else {
                    console.error('Error fetching data:', error.message);
                    alert('Network error. Please check your connection.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setModalIsOpen(true);
    };

    const handleConnect = async (person, event) => {
        event.stopPropagation();
        setConnecting(true);

        if (!userId) {
            alert("User ID not found. Please log in again.");
            setConnecting(false);
            return;
        }

        try {
            // Check if person._id is defined and valid
            if (!person || !person._id) {
                throw new Error('Invalid person object');
            }

            const response = await axios.post('http://localhost:5000/network/api/connect', {
                personId: person._id,
                userId
            });

            alert(`Connection request sent to ${person.firstName} ${person.lastName}`);
            // Optionally, refetch connection requests or update the UI here
        } catch (error) {
            // Log the full error response for debugging
            console.error('Error connecting:', error.response ? error.response.data : error.message);
            alert("Error connecting. Please try again.");
        } finally {
            setConnecting(false);
        }
    };

    const handleJoin = async (community, event) => {
        event.stopPropagation();
        setJoining(true);

        try {
            await axios.post('http://localhost:5000/network/api/join', { userId, communityId: community._id });
            alert(`Joined ${community.communityName}`);
            const communitiesResponse = await axios.get(`http://localhost:5000/network/api/communities?userId=${userId}`);
            setCommunities(communitiesResponse.data || []);
        } catch (error) {
            console.error('Error joining:', error);
            alert("Error joining community. Please try again.");
        } finally {
            setJoining(false);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await axios.post(`http://localhost:5000/network/api/acceptRequest`, { requestId, userId });
            alert("Connection request accepted.");
            // Re-fetch connection requests and my connections
            const updatedRequests = await axios.get(`http://localhost:5000/network/api/connectionRequests?userId=${userId}`);
            setConnectionRequests(updatedRequests.data || []);
            const updatedConnections = await axios.get(`http://localhost:5000/network/api/myConnections?userId=${userId}`);
            setMyConnections(updatedConnections.data || []);
        } catch (error) {
            console.error('Error accepting request:', error);
            alert("Error accepting request. Please try again.");
        }
    };

    const handleDeclineRequest = async (requestId) => {
        try {
            await axios.post(`http://localhost:5000/network/api/declineRequest`, { requestId });
            alert("Connection request declined.");
            // Re-fetch connection requests
            const updatedRequests = await axios.get(`http://localhost:5000/network/api/connectionRequests?userId=${userId}`);
            setConnectionRequests(updatedRequests.data || []);
        } catch (error) {
            console.error('Error declining request:', error);
            alert("Error declining request. Please try again.");
        }
    };

    if (loading) return <p>Loading...</p>;

    return (
        <div className="structure">
            <Navbar />
            <div className="container-mrg">
                <div className="tabs">
                    <button className={activeTab === 'people' ? 'active' : ''} onClick={() => setActiveTab('people')}>People</button>
                    <button className={activeTab === 'communities' ? 'active' : ''} onClick={() => setActiveTab('communities')}>Communities</button>
                    <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => setActiveTab('requests')}>Connection Requests</button>
                    <button className={activeTab === 'myConnections' ? 'active' : ''} onClick={() => setActiveTab('myConnections')}>My Connections</button>
                </div>

                {activeTab === 'people' ? (
                    <div id="people" className="list-container">
                        <h2>People</h2>
                        {people.length === 0 ? (
                            <p>No people found in your college.</p>
                        ) : (
                            <div className="list-items">
                                {people.map(person => (
                                    <div key={person._id} className="list-item" onClick={() => handleItemClick(person)}>
                                        <img src={person.profilePhoto || 'default-profile.png'} alt={`${person.firstName} ${person.lastName}`} />
                                        <p>{`${person.firstName} ${person.lastName}`}</p>
                                        <button onClick={(e) => handleConnect(person, e)} disabled={connecting}>
                                            Connect
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'communities' ? (
                    <div id="community" className="list-container">
                        <h2>Communities</h2>
                        {communities.length === 0 ? (
                            <p>No communities found for your college.</p>
                        ) : (
                            <div className="list-items">
                                {communities.map(community => (
                                    <div key={community._id} className="list-item" onClick={() => handleItemClick(community)}>
                                        <img src={community.communityProfilePhoto || 'default-community.png'} alt={community.communityName} />
                                        <p>{community.communityName}</p>
                                        <p>{community.communityDesc}</p>
                                        {Array.isArray(community.members) && community.members.includes(userId) ? (
                                            <button onClick={() => handleItemClick(community)}>View</button>
                                        ) : (
                                            <button onClick={(e) => handleJoin(community, e)} disabled={joining}>
                                                Join
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'requests' ? (
                    <div id="requests" className="list-container">
                        <h2>Connection Requests</h2>
                        {connectionRequests.length === 0 ? (
                            <p>No connection requests.</p>
                        ) : (
                            <div className="list-items">
                                {connectionRequests.map(request => (
                                    <div key={request._id} className="list-item">
                                        <p>{`${request.senderId.firstName} ${request.senderId.lastName}`}</p>
                                        <button onClick={() => handleAcceptRequest(request._id)}>Accept</button>
                                        <button onClick={() => handleDeclineRequest(request._id)}>Decline</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div id="myConnections" className="list-container">
                        <h2>My Connections</h2>
                        {myConnections.length === 0 ? (
                            <p>No connections yet.</p>
                        ) : (
                            <div className="list-items">
                                {myConnections.map(connection => (
                                    <div key={connection._id} className="list-item" onClick={() => handleItemClick(connection)}>
                                        <img src={connection.profilePhoto || 'default-profile.png'} alt={`${connection.firstName} ${connection.lastName}`} />
                                        <p>{`${connection.firstName} ${connection.lastName}`}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Modal isOpen={modalIsOpen} onRequestClose={() => { setModalIsOpen(false); setSelectedItem(null); }} contentLabel="Item Details">
                {selectedItem && (
                    <div>
                        <h2>{selectedItem.communityName || `${selectedItem.firstName} ${selectedItem.lastName}`}</h2>
                        <img src={selectedItem.communityProfilePhoto || selectedItem.profilePhoto} alt={selectedItem.communityName || `${selectedItem.firstName} ${selectedItem.lastName}`} />
                        {selectedItem.communityName ? (
                            <div>
                                <h3>Community Details</h3>
                                <p>{selectedItem.communityDesc}</p>
                                <p><strong>Members Count:</strong> {selectedItem.membersCount}</p>

                                {/* Photos from Posts Section */}
                                <h4>Community Photos</h4>
                                {selectedItem.posts && selectedItem.posts.length > 0 ? (
                                    <div className="photo-gallery">
                                        {selectedItem.posts.map(post => (
                                            <img
                                                key={post._id}
                                                src={post.image || 'default-image.png'}
                                                alt="Community Post"
                                                className="post-image"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <p>No photos available for this community.</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                <h3>Person Details</h3>
                                <p><strong>Full Name:</strong> {`${selectedItem.firstName} ${selectedItem.lastName}`}</p>
                                <p><strong>Email:</strong> {selectedItem.email}</p>
                                <p><strong>Bio:</strong> {selectedItem.bio || "No bio available."}</p>
                            </div>
                        )}
                        <button onClick={() => { setModalIsOpen(false); setSelectedItem(null); }}>Close</button>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Networking;