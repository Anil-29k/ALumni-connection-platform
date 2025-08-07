import React, { useState } from 'react';
import Navbar from './Navbar';

function Chatbot() {
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const quest = document.getElementById('chatinput').value;
        if (!quest) return;

        setLoading(true);
        const newChat = { question: quest, response: '...' };
        setChatHistory([...chatHistory, newChat]);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: quest }),
            });
            const data = await response.json();
            newChat.response = data.response;
            setChatHistory([...chatHistory, newChat]);
        } catch (error) {
            newChat.response = 'Error: Unable to fetch response.';
            setChatHistory([...chatHistory, newChat]);
        } finally {
            setLoading(false);
        }

        document.getElementById('chatinput').value = ''; // Clear input field
    };

    return (
        <div>
            <Navbar />
            <div id='chat' className='container-mrg'>
                {chatHistory.map((chat, index) => (
                    <div key={index} className="chatEntry">
                        <div id="chatquery">Q: {chat.question}</div>
                        <div id="chatrespond">A: {chat.response}</div>
                    </div>
                ))}
                <form onSubmit={handleSubmit}>
                    <input type="text" id='chatinput' placeholder='Message' />
                    <button type='submit' disabled={loading}>Ask</button>
                </form>
            </div>
        </div>
    );
}

export default Chatbot;