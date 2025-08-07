import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import './DiscussionForum.css';
import Navbar from './Navbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faVideo, faPaperclip, faPaperPlane, faTrash } from '@fortawesome/free-solid-svg-icons';
import SimplePeer from 'simple-peer';

// Connect to the socket server
const socket = io('http://localhost:3000');
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
    const userId = localStorage.getItem('userId'); // Make sure this is a valid user ID
    socket.emit('registerUser', userId);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});
const DiscussionForum = () => {
    const [friends, setFriends] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [file, setFile] = useState(null);
    const [deletePopup, setDeletePopup] = useState({ visible: false, messageId: null });
    const messagesEndRef = useRef(null);
    // call
    const [callActive, setCallActive] = useState(false); // To manage call state
    const [callType, setCallType] = useState(''); // To differentiate between voice and video call
    const [peer, setPeer] = useState(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerRef = useRef(null);
    const [localStream, setLocalStream] = useState(null);
    const [peerConnection, setPeerConnection] = useState(null);
    // Fetch friends on component mount
    useEffect(() => {
        const userId = localStorage.getItem('userId');

        const fetchFriends = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/friends/${userId}`);
                if (!response.ok) throw new Error('Failed to fetch friends');
                const data = await response.json();
                setFriends(data);
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };

        fetchFriends();

        socket.on('receiveMessage', (data) => {
            setMessages((prevMessages) => [...prevMessages, data]);
        });

        // Call
        socket.on('callUser', (data) => {
            handleIncomingCall(data);
        });

        socket.on('callEnded', () => {
            endCall();
        });

        return () => {
            socket.off('receiveMessage');
            //call
            socket.off('callUser');
            socket.off('callEnded');

        };
    }, []);

    // Scroll to the bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        socket.on('messageDeleted', (data) => {
            setMessages((prevMessages) =>
                prevMessages.filter((msg) => msg._id !== data.messageId)
            );
        });
        return () => {
            socket.off('Message Delected');
        }
    }, []);
    // Fetch messages with the selected friend
    const fetchMessages = async (friendId) => {
        const userId = localStorage.getItem('userId');
        try {
            const response = await fetch(`http://localhost:3000/api/messages/${userId}/${friendId}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();
            setMessages(data);
            // console.log(data);

        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const handleFriendClick = (friendId) => {
        setSelectedFriend(friendId);
        fetchMessages(friendId);
    };

    // Handle sending a message
    const handleSend = async (e) => {
        e.preventDefault();
        const userId = localStorage.getItem('userId');
        if (selectedFriend && (message || file)) {
            const timestamp = new Date().toISOString();
            const data = {
                userId,
                recipientId: selectedFriend,
                message,
                file: file ? file.name : null,
                sendTime: timestamp,
                seenStatus: false,
            };

            try {
                if (file) {
                    await uploadFile(file, userId, selectedFriend);
                }
                await sendMessageToBackend(data);
                socket.emit('sendMessage', data);
                setMessages((prevMessages) => [...prevMessages, data]);
                resetMessageInput();
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    // Upload a file to the server
    const uploadFile = async (file, userId, recipientId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('recipientId', recipientId);

        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) throw new Error('File upload failed');
        return await response.json();
    };

    // Send message to the backend
    const sendMessageToBackend = async (data) => {
        const response = await fetch('http://localhost:3000/api/sendMessages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) throw new Error('Message sending failed');
        return true;
    };

    const resetMessageInput = () => {
        setMessage('');
        setFile(null);
    };

    const openDeletePopup = (messageId) => {
        setDeletePopup({ visible: true, messageId });
    };

    // Handle message deletion
    // Function to delete message based on option
    const deleteMessage = async (option) => {
        const userId = localStorage.getItem('userId');
        const messageId = deletePopup.messageId;

        if (option === 'me') {
            // Delete message only for me
            await fetch(`http://localhost:3000/api/deleteMessageForMe/${messageId}/${userId}`, {
                method: 'DELETE',
            });
            setMessages((prevMessages) => prevMessages.filter(msg => msg._id !== messageId));
        } else {
            // Delete message for everyone (only sender can do this)
            await fetch(`http://localhost:3000/api/deleteMessageForEveryone/${messageId}/${userId}`, {
                method: 'DELETE',
            });
        }

        setDeletePopup({ visible: false, messageId: null });
    };


    /// call
    const getLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
        } catch (error) {
            console.error("Error accessing Media Device: ", error);
        }
    }


    useEffect(() => {
        if (callActive && localVideoRef.current && remoteVideoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true })
                .then(stream => {
                    localVideoRef.current.srcObject = stream;
                    peerRef.current = new SimplePeer({ initiator: true, stream });

                    peerRef.current.on('signal', signal => {
                        socket.emit('callUser', { signal, to: selectedFriend });
                    });

                    peerRef.current.on('stream', remoteStream => {
                        remoteVideoRef.current.srcObject = remoteStream;
                    });

                    socket.on('callAccepted', signal => {
                        peerRef.current.signal(signal);
                    });
                });
        }
    }, [callActive]);


    const initiateCall = async (type) => {
        setCallType(type);
        setCallActive(true);
        if (!localStream) {
            console.log("LOCAL STEREM IS NOT DEFIN");
            return;

        }
        const peer = new SimplePeer({
            initiator: true, // or false if this is the answerer
            trickle: false, // Disable trickle ICE
            stream: localStream // Pass the local media stream
        });

        // Handle peer events
        peer.on('signal', (data) => {
            // Send the signal data to the remote peer
            // You might use WebSocket or another method to send this
        });

        peer.on('stream', (remoteStream) => {
            // This is the remote stream
            // Set it to video/audio element
        });

        // Handle errors
        peer.on('error', (err) => {
            console.error('Error:', err);
        });

    };

    const handleIncomingCall = ({ from, signal }) => {
        if (window.confirm(`Call from ${from}. Do you want to accept?`)) {
            setSelectedFriend(from);
            setCallActive(true);

            navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true })
                .then(stream => {
                    localVideoRef.current.srcObject = stream;
                    peerRef.current = new SimplePeer({ initiator: false, stream });

                    peerRef.current.on('signal', signal => {
                        socket.emit('acceptCall', { signal, to: from });
                    });

                    peerRef.current.on('stream', remoteStream => {
                        remoteVideoRef.current.srcObject = remoteStream;
                    });

                    peerRef.current.signal(signal);
                });
        }
    };
    const endCall = () => {
        setCallActive(false);
        if (peerRef.current) {
            peerRef.current.destroy();
        }
        localVideoRef.current.srcObject = null;
        remoteVideoRef.current.srcObject = null;
    };




    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) setFile(uploadedFile);
    };

    return (
        <div>
            <Navbar />
            <div className="messaging-container">
                <div className="friends-list">
                    <h3>Friends</h3>
                    {friends.map((friend) => (
                        <div
                            key={friend._id}
                            onClick={() => handleFriendClick(friend._id)}
                            className={`friend-item ${selectedFriend === friend._id ? 'selected' : ''}`}
                        >
                            <strong>{friend.username}</strong>
                        </div>
                    ))}
                </div>

                {selectedFriend && (
                    <div className="messages-section">
                        <div className="selected-friend">
                            <h2>Chatting with: {friends.find(friend => friend._id === selectedFriend)?.username}</h2>
                            <div className="call-icons">
                                <FontAwesomeIcon icon={faPhone} onClick={() => initiateCall('voice')} className="call-icon" />
                                <FontAwesomeIcon icon={faVideo} onClick={() => initiateCall('video')} className="call-icon" />
                            </div>
                        </div>
                        <div className="messages">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`message ${msg.userId === localStorage.getItem('userId') ? 'sent' : 'received'}`}
                                >
                                    <div className="message-header">
                                        <strong>
                                            {msg.userId === localStorage.getItem('userId') ? 'You' : `${msg.senderName}`}
                                        </strong>
                                    </div>
                                    <div className="message-content">
                                        {msg.file ? (
                                            <img
                                                src={`/path/to/your/files/${msg.file}`} // Update this to your file path
                                                alt="Sent Image"
                                                className="message-image"
                                            />
                                        ) : (
                                            <span>{msg.message}</span>
                                        )}
                                    </div>
                                    <div className="message-footer">
                                        <span className="message-timestamp">
                                            {new Date(msg.sendTime).toLocaleTimeString()}
                                        </span>
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            onClick={() => openDeletePopup(msg._id)}
                                            className="delete-icon"
                                        />
                                        {msg.seen && msg.userId === localStorage.getItem('userId') && (
                                            <span className="message-status">Seen</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSend} className="message-form">
                            <div className="message-form-content">
                                <label htmlFor="file-upload" className="file-upload-label">
                                    <FontAwesomeIcon icon={faPaperclip} className="file-upload-icon" />
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                />
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message"
                                    className="message-input"
                                    disabled={!selectedFriend}
                                />
                                <button type="submit" className="send-button">
                                    <FontAwesomeIcon icon={faPaperPlane} />
                                </button>
                            </div>
                        </form>
                        {/* Delete message confirmation popup */}
                        {deletePopup.visible && (
                            <div className="delete-popup">
                                <p>Are you sure you want to delete this message?</p>
                                <div className="delete-popup-actions">
                                    <button onClick={() => deleteMessage('me')}>Delete for me</button>
                                    <button onClick={() => deleteMessage('everyone')}>Delete for everyone</button>
                                    <button onClick={() => setDeletePopup({ visible: false, messageId: null })}>Cancel</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {callActive && (
                <div className="call-interface">
                    <h2>{callType === 'video' ? 'Video Call' : 'Voice Call'}</h2>
                    <div className="call-videos">
                        <video ref={localVideoRef} autoPlay muted />
                        <video ref={remoteVideoRef} autoPlay />
                    </div>
                    <button onClick={endCall}>End Call</button>
                </div>
            )}
        </div>
    );
};

export default DiscussionForum;