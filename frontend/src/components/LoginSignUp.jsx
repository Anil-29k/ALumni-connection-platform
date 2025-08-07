import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignUp.css';
import MainNavbar from './MainNavbar.jsx';

function LoginSignUp({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loginMessage, setLoginMessage] = useState('');
    const [signupMessages, setSignupMessages] = useState([]);
    const [colleges, setColleges] = useState([]);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Loading state

    const navigate = useNavigate();

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const response = await fetch('http://localhost:5000/auth/api/colleges');
                const data = await response.json();
                setColleges(data);
            } catch (error) {
                console.error('Error fetching colleges:', error);
            }
        };
        fetchColleges();
    }, []);

    const handleLoginSubmit = async (event) => {
        event.preventDefault();
        const loginId = event.target.loginId.value; // Could be username or email
        const loginpassword = event.target.loginpassword.value;

        setIsLoading(true); // Start loading
        try {
            const response = await fetch('http://localhost:5000/auth/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ loginId, loginpassword }), // Send loginId
            });
            const data = await response.json();
            setIsLoading(false); // Stop loading
console.log(data);

            if (data.success) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('username',data.username)
                setLoginMessage(data.message);
                onLoginSuccess();
                navigate('/platform');
            } else {
                setLoginMessage(data.message);
            }
        } catch (error) {
            console.error('Error during login:', error);
            setLoginMessage('An error occurred during login. Please try again.');
            setIsLoading(false); // Stop loading
        }
    };

    const handleSignupSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const signupData = {
            username: formData.get('username'),
            email: formData.get('email'),
            phonenum: formData.get('phonenum'),
            collagename: formData.get('collagename'),
            redgnum: formData.get('redgnum'),
            firstName: formData.get('firstname'), // New field
            lastName: formData.get('lastname'),   // New field
            password: formData.get('password'),
            conformpassword: formData.get('conformpassword'),
        };

        const messages = [];
        const phonePattern = /^\d{10}$/;

        if (!phonePattern.test(signupData.phonenum)) {
            messages.push('Phone number must be 10 digits.');
        }

        if (!phonePattern.test(signupData.redgnum)) {
            messages.push('Registration number must be 10 digits.');
        }

        const passwordPattern = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{6,16}$/;
        if (!passwordPattern.test(signupData.password)) {
            messages.push('Password must be 6-16 characters long, and include at least one number, one special character, and one letter.');
        }

        if (signupData.password !== signupData.conformpassword) {
            messages.push('Passwords do not match.');
        }

        if (messages.length > 0) {
            setSignupMessages(messages);
            return;
        }

        setIsLoading(true); // Start loading
        try {
            const response = await fetch('http://localhost:5000/auth/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData),
            });
            const data = await response.json();
            setIsLoading(false); // Stop loading

            // Handle backend response for existing username
            if (data.success) {
                localStorage.setItem('userToken', data.token);
                localStorage.setItem('userId', data.userId);
                setSignupMessages(['Signup successful!']);
                onLoginSuccess();
                navigate('/platform');
            } else if (data.message === 'Username already in use') {
                setSignupMessages(['Username is already in use. Please choose another one.']);
            } else {
                setSignupMessages(data.messages || ['An error occurred. Please try again.']);
            }
        } catch (error) {
            console.error('Error during signup:', error);
            setSignupMessages(['An error occurred during signup. Please try again.']);
            setIsLoading(false); // Stop loading
        }
    };
    return (
        <>
            <MainNavbar />
            <div className="container">
                <div className={`login-signup-container ${isLogin ? 'login-mode' : 'signup-mode'}`}>
                    <div className="login-signup-header">
                        <button onClick={() => setIsLogin(true)} className={isLogin ? 'active' : ''}>Login</button>
                        <button onClick={() => setIsLogin(false)} className={!isLogin ? 'active' : ''}>Sign Up</button>
                    </div>
                    <div className="forms-container">
                        {isLogin ? (
                            <form onSubmit={handleLoginSubmit} className="login-form">
                                <label htmlFor="loginId">Username or Email:</label>
                                <input type="text" id="loginId" name="loginId" required />
                                <label htmlFor="loginpassword">Password:</label>
                                <input
                                    type={showLoginPassword ? 'text' : 'password'}
                                    id="loginpassword"
                                    name="loginpassword"
                                    required
                                />
                                <input
                                    type="checkbox"
                                    checked={showLoginPassword}
                                    onChange={() => setShowLoginPassword(!showLoginPassword)}
                                /> Show Password
                                <button type="submit" disabled={isLoading}>Login</button>
                                {isLoading && <p>Loading...</p>}
                                {loginMessage && <p>{loginMessage}</p>}
                            </form>
                        ) : (
                            <form onSubmit={handleSignupSubmit} className="signup-form">
                                <label htmlFor="username">Username:</label>
                                <input type="text" id="username" name="username" required />
                                <div className='name'>
                                    <span >
                                        <label htmlFor="firstname">First Name :</label>
                                        <input type="text" id='firstname' name='firstname' required />
                                    </span>
                                    <span>
                                        <label htmlFor="lastname">Last Name :</label>
                                        <input type="text" id='lastname' name='lastname' />
                                    </span>
                                </div>
                                <label htmlFor="email">Email:</label>
                                <input type="email" id="email" name="email" required />
                                <label htmlFor="phonenum">Phone Number:</label>
                                <input type="number" id="phonenum" name="phonenum" required />
                                <label htmlFor="collagename">College Name:</label>
                                <select id="collagename" name="collagename" required>
                                    <option value="">Select college</option>
                                    {colleges.map((college) => (
                                        <option key={college.id} value={college.name}>{college.name}</option>
                                    ))}
                                </select>
                                <label htmlFor="redgnum">Registration Number:</label>
                                <input type="number" id="redgnum" name="redgnum" required />
                                <label htmlFor="password">Password:</label>
                                <input
                                    type={showSignupPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    required
                                />
                                <input
                                    type="checkbox"
                                    checked={showSignupPassword}
                                    onChange={() => setShowSignupPassword(!showSignupPassword)}
                                /> Show Password
                                <label htmlFor="conformpassword">Confirm Password:</label>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="conformpassword"
                                    name="conformpassword"
                                    required
                                />
                                <input
                                    type="checkbox"
                                    checked={showConfirmPassword}
                                    onChange={() => setShowConfirmPassword(!showConfirmPassword)}
                                /> Show Password
                                <button type="submit" disabled={isLoading}>Sign Up</button>
                                {isLoading && <p>Loading...</p>}
                                {signupMessages?.length > 0 && (
                                    <div className="signup-messages">
                                        {signupMessages.map((message, index) => (
                                            <p key={index}>{message}</p>
                                        ))}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default LoginSignUp;