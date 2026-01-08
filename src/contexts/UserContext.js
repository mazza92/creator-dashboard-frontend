import React, { createContext, useState, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import { apiClient } from '../config/api';
import { useNotification } from './NotificationContext'; // Import useNotification

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const isPublicProfilePage = location.pathname.startsWith('/c/');
    const { initializeSocket, cleanupSocket } = useNotification(); // Get socket functions

    useEffect(() => {
        const fetchProfile = async () => {
            // Check if we have cached user data first
            const cachedUserRole = localStorage.getItem('userRole');
            const cachedUserId = localStorage.getItem('userId');
            const cachedAuthToken = localStorage.getItem('authToken');

            // If we have cached data and it's recent, verify with server first
            if (cachedUserRole && cachedUserId && cachedAuthToken === 'logged-in') {
                // Don't set user immediately, verify with server first
                try {
                    const response = await apiClient.get('/profile', { withCredentials: true });
                    const profileData = response.data;
                    if (profileData.user_id) {
                        const userData = {
                            id: profileData.user_id,
                            role: profileData.user_role,
                            creator_id: profileData.creator_id,
                            brand_id: profileData.brand_id,
                        };
                        setUser(userData);
                        initializeSocket(profileData.user_id, profileData.user_role);
                    } else {
                        setUser(null);
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userId');
                        localStorage.removeItem('authToken');
                    }
                } catch (error) {
                    // If verification fails, clear cache
                    setUser(null);
                    cleanupSocket();
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('authToken');
                }
                setLoading(false);
                return;
            }

            // No cached data, fetch from server
            try {
                const response = await apiClient.get('/profile', { withCredentials: true });
                const profileData = response.data;

                if (profileData.user_id) {
                    const userData = {
                        id: profileData.user_id,
                        role: profileData.user_role,
                        creator_id: profileData.creator_id,
                        brand_id: profileData.brand_id,
                    };
                    setUser(userData);
                    initializeSocket(profileData.user_id, profileData.user_role);
                    localStorage.setItem('userRole', profileData.user_role);
                    localStorage.setItem('userId', profileData.user_id);
                    localStorage.setItem('authToken', 'logged-in');
                } else {
                    setUser(null);
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('authToken');
                }
            } catch (error) {
                setUser(null);
                cleanupSocket();
                localStorage.removeItem('userRole');
                localStorage.removeItem('userId');
                localStorage.removeItem('authToken');
            } finally {
                setLoading(false);
            }
        };

        if (user === undefined && !isPublicProfilePage) {
            fetchProfile();
        } else if (user === undefined && isPublicProfilePage) {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, isPublicProfilePage]);

    const handleLogout = async () => {
        try {
            console.log('🔑 Logging out...');
            await apiClient.post('/logout', {}, { withCredentials: true });
            console.log('✅ Logout successful. Clearing user data...');
        } catch (error) {
            console.error('🔍 Error during server-side logout, proceeding with client-side cleanup:', error);
        } finally {
            // Ensure cleanup happens regardless of server response
            setUser(null);
            cleanupSocket(); // Disconnect the socket on logout
            localStorage.removeItem('userRole');
            localStorage.removeItem('userId');
            localStorage.removeItem('authToken');
            window.location.href = '/login';
        }
    };

    const refreshUser = async () => {
        try {
            const response = await apiClient.get('/profile', { withCredentials: true });
            const profileData = response.data;
            if (profileData.user_id) {
                const userData = {
                    id: profileData.user_id,
                    role: profileData.user_role,
                    creator_id: profileData.creator_id,
                    brand_id: profileData.brand_id,
                };
                setUser(userData);
                console.log('✅ User context refreshed:', userData);
            }
        } catch (error) {
            console.error('🔥 Error refreshing user context:', error);
        }
    };

    return (
        <UserContext.Provider value={{ user, setUser, loading, handleLogout, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

// We need to wrap UserProvider inside NotificationProvider in App.js
// so we can use the useNotification hook here.
// The context hook can only be used in a component that is a child of the context provider.
// So, we need to adjust the App.js structure.

// To use UserProvider, it must be a child of NotificationProvider.
// This means we need to adjust how they are nested in App.js
// eslint-disable-next-line no-unused-vars
const UserProviderWithNotifications = ({ children }) => {
  return (
    <UserProvider>
      {children}
    </UserProvider>
  )
}

// In App.js, the structure should be:
// <NotificationProvider>
//   <UserProvider>
//     ... your app ...
//   </UserProvider>
// </NotificationProvider>
// This is already the case, so we just need to use the context.