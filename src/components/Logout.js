import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

function Logout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies for session management
            });

            if (response.ok) {
                // Redirect to the login or home page
                navigate('/login');
            } else {
                console.error('Logout failed');
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <Button type="primary" onClick={handleLogout}>
            Logout
        </Button>
    );
}

export default Logout;
