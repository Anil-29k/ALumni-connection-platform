import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Index from './components/Index';
import LoginSignUp from './components/LoginSignUp';
import AboutIndex from './components/AboutIndex';
import Platform from './Platform';  // Import the Platform component
import ProtectedRoute from './components/ProtectedRoute';
function IndexPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to track authentication

    // Handle successful login or signup
    const handleLoginSuccess = () => {
        setIsAuthenticated(true); // Update authentication state
        localStorage.setItem('userToken', 'yourToken'); // Store token in localStorage
    };

    // Create the router
    const router = createBrowserRouter([
        {
            path: '/',
            element: <Index />
        },
        {
            path: '/login-signup',
            element: <LoginSignUp onLoginSuccess={handleLoginSuccess} />  // Pass login success handler
        },
        {
            path: '/aboutindex',
            element: <AboutIndex />
        },
        {
            path: '/platform/*', // Add trailing '*' to allow nested routes
            element: (
                <ProtectedRoute>
                    <Platform />
                </ProtectedRoute>
            )
        }
    ]);

    return (
        <div>
            <RouterProvider router={router} />
        </div>
    );
}

export default IndexPage;