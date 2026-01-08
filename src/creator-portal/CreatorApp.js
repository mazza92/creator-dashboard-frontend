// src/creator-portal/CreatorApp.js
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CreatorDashboard from './CreatorDashboard';  // Overview for Creator Dashboard
import Listing from './Listing';  // Marketplace component
import NewSubmission from './NewSubmission';
import SubmissionHistory from './SubmissionHistory';
import ManagePackages from './ManagePackages';
import CreatePackage from './CreatePackage';
import Bookings from './Bookings';
import ContentBids from './ContentBids';
import Profile from './Profile';

function CreatorApp() {
    return (
        <div className="creator-portal-container">
            <Routes>
                {/* Set Overview as default at /creator/dashboard */}
                <Route path="dashboard" element={<CreatorDashboard />} />
                
                {/* Routes for Creator Dashboard sections */}
                <Route path="dashboard/marketplace" element={<Listing />} />
                <Route path="dashboard/new-submission" element={<NewSubmission />} />
                <Route path="dashboard/submission-history" element={<SubmissionHistory />} />
                <Route path="dashboard/packages" element={<ManagePackages />} />
                <Route path="dashboard/create-package" element={<CreatePackage />} />
                
                {/* New routes for Bookings, ContentBids, and Profile */}
                <Route path="dashboard/bookings" element={<Bookings />} />
                <Route path="dashboard/content-bids" element={<ContentBids />} />
                <Route path="dashboard/profile" element={<Profile />} />
            </Routes>
        </div>
    );
}

export default CreatorApp;
