// src/pages/SuccessPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button } from 'antd';

function SuccessPage() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    // ✅ Fetch role from session API (More reliable)
    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/session", {
                    credentials: "include",
                });
                const sessionData = await response.json();

                if (sessionData.user_role) {
                    setUserRole(sessionData.user_role);
                } else {
                    setUserRole("user"); // Fallback
                }
            } catch (error) {
                console.error("Session fetch error:", error);
                setUserRole("user");
            }
        };

        fetchUserRole();
    }, []);

    // ✅ Redirect user after 5 seconds
    useEffect(() => {
        console.log("🟢 [Success Page Debug] userRole:", userRole);
    
        const timer = setTimeout(() => {
            if (userRole === 'creator') {
                console.log("🚀 [Success Page Debug] Redirecting to Creator Dashboard");
                navigate('/creator/dashboard/overview');
            } else {
                console.log("🚀 [Success Page Debug] Redirecting to Brand Dashboard");
                navigate('/brand/dashboard/overview');
            }
        }, 5000);
    
        return () => clearTimeout(timer);
    }, [navigate, userRole]);
    

    // ✅ Buttons to manually navigate
    const handleExplore = () => {
        navigate(userRole === "creator" ? "/creator/dashboard/overview" : "/brand/dashboard/overview");
    };

    const handleCompleteProfile = () => {
        navigate(userRole === "creator" ? "/creator-profile" : "/brand-profile");
    };

    return (
        <div className="success-page-container">
            <Result
                status="success"
                title={`Welcome, ${userRole === 'creator' ? 'Creator' : 'Brand'}!`}
                subTitle="Your account has been successfully created."
                extra={[
                    <Button type="primary" key="dashboard" onClick={handleExplore}>
                        {userRole === 'creator' ? 'Explore Campaigns' : 'Create Your First Campaign'}
                    </Button>,
                    <Button key="profile" onClick={handleCompleteProfile}>
                        Complete Your Profile
                    </Button>,
                ]}
            />
            <p className="redirect-message">You will be redirected to your dashboard shortly...</p>
        </div>
    );
}

export default SuccessPage;

