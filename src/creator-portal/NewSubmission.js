import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Select from 'react-select';
import axios from 'axios';
import './TypeformStyle.css'; // Include relevant CSS
import './ConfirmationStyle.css'; // Include new CSS for the confirmation page

function NewSubmission() {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        brandId: '',  // Assuming you need to store brand ID
        brandName: '',
        productName: '',
        contentBrief: '',
        commercialModel: '',
        bid: '',
        commissionPercentage: '',
        fixedFee: '',
        followerCount: '',
        accountsReached: '',
        impressions: '',
        topLocations: [],
        primaryAgeRange: [],
        genderReachRatio: '',
        customMaleRatio: '',
        customFemaleRatio: '',
        collaborationLinks: ['']
    });

    const [brands, setBrands] = useState([]);
    const [wordCount, setWordCount] = useState(0);
    const [isCustomRatio, setIsCustomRatio] = useState(false);
    const maxWords = 300;
    const [showConfirmation, setShowConfirmation] = useState(false); // Track confirmation page


    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get('http://localhost:5000/brands');
                const brandOptions = response.data.map(brand => ({
                    value: brand.id,
                    label: brand.name
                }));
                setBrands(brandOptions);  // Set the fetched brands as options for the Select component
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        fetchBrands();
    }, []);

    // Options for multi-select (age ranges and locations)
    const locationOptions = [
        { value: 'United States', label: 'United States' },
        { value: 'United Kingdom', label: 'United Kingdom' },
        { value: 'Canada', label: 'Canada' },
        { value: 'Australia', label: 'Australia' },
    ];

    const ageRangeOptions = [
        { value: '13-17', label: '13-17' },
        { value: '18-24', label: '18-24' },
        { value: '25-34', label: '25-34' },
        { value: '35-44', label: '35-44' },
        { value: '45-54', label: '45-54' },
        { value: '55-64', label: '55-64' },
        { value: '65+', label: '65+' }
    ];

    // Handle step navigation
    const handleNextStep = () => {
        if (step < 6) setStep(step + 1);  // Adjusted for 6 steps
    };

    const handlePreviousStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        console.log(`${name} updated:`, value);

        // Handle word count for content brief
        if (name === 'contentBrief') {
            const words = value.trim().split(/\s+/).length;
            if (words <= maxWords) {
                setWordCount(words);
            }
        }

        // Handle custom gender ratio toggle
        if (name === 'genderReachRatio' && value === 'Custom') {
            setIsCustomRatio(true);
            setFormData({ ...formData, genderReachRatio: '', customMaleRatio: '', customFemaleRatio: '' });
        } else if (name === 'genderReachRatio') {
            setIsCustomRatio(false);
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleBrandChange = (selectedOption) => {
        setFormData({ ...formData, brandId: selectedOption ? selectedOption.value : '' });
    };

    const handleCollaborationLinkChange = (index, value) => {
        const updatedLinks = [...formData.collaborationLinks];
        updatedLinks[index] = value;
        setFormData({ ...formData, collaborationLinks: updatedLinks });
    };

    const handleAddCollaborationLink = () => {
        setFormData({ ...formData, collaborationLinks: [...formData.collaborationLinks, ''] });
    };

    const handleRemoveCollaborationLink = (index) => {
        const updatedLinks = [...formData.collaborationLinks];
        updatedLinks.splice(index, 1);
        setFormData({ ...formData, collaborationLinks: updatedLinks });
    };

    const handleLocationChange = (selectedOptions) => {
        setFormData({ ...formData, topLocations: selectedOptions });
        console.log("Top locations updated:", selectedOptions);
    };

    const handleAgeRangeChange = (selectedOptions) => {
        setFormData({ ...formData, primaryAgeRange: selectedOptions });
        console.log("Primary age range updated:", selectedOptions);
    };

    const handleCommercialModelChange = (option) => {
        setFormData({ ...formData, commercialModel: option.value });
        
        // Reset commission and fixed fee when changing models
        if (option.value !== 'commission') {
            setFormData((prevData) => ({ ...prevData, commissionPercentage: '' }));
        }
        if (option.value !== 'fixed') {
            setFormData((prevData) => ({ ...prevData, fixedFee: '' }));
        }
        if (option.value !== 'hybrid') {
            setFormData((prevData) => ({ ...prevData, commissionPercentage: '', fixedFee: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.brandId) {
            alert('Please select a brand.');
            return;
        }

        const creatorId = 1;  // Replace with dynamic creator ID from session or state
        const newRequest = {
            creator_id: creatorId,
            brand_id: formData.brandId,
            product_name: formData.productName,
            content_brief: formData.contentBrief,
            follower_count: formData.followerCount,
            accounts_reached: formData.accountsReached,
            impressions: formData.impressions,
            top_locations: formData.topLocations.map(loc => loc.value),
            primary_age_range: formData.primaryAgeRange.map(age => age.value),
            gender_reach_ratio: isCustomRatio ? {
                male: formData.customMaleRatio,
                female: formData.customFemaleRatio
            } : formData.genderReachRatio,
            commercial_model: formData.commercialModel,
            commission_percentage: formData.commercialModel === 'commission' || formData.commercialModel === 'hybrid' ? formData.commissionPercentage : null,
            fixed_fee: formData.commercialModel === 'fixed' || formData.commercialModel === 'hybrid' ? formData.fixedFee : null,
            previous_collaborations: formData.collaborationLinks.join(', ')
        };

        try {
            await axios.post('http://localhost:5000/submit-collaboration-request', newRequest);
            console.log('Form data submitted:', formData);
            setShowConfirmation(true);
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };

    const handleBackToDashboard = () => {
        // Logic to go back to the dashboard
        window.location.href = '/creator-portal'; // Simulated routing
    };

    const handleNewRequest = () => {
        // Reset form and go back to the first step
        setFormData({
            brandId: '',
            brandName: '',
            productName: '',
            contentBrief: '',
            commercialModel: '',
            bid: '',
            commissionPercentage: '',
            fixedFee: '',
            followerCount: '',
            accountsReached: '',
            impressions: '',
            topLocations: [],
            primaryAgeRange: [],
            genderReachRatio: '',
            customMaleRatio: '',
            customFemaleRatio: '',
            collaborationLinks: ['']
        });
        setStep(1);
        setShowConfirmation(false);
    };

    const steps = [
        { label: "Brand", field: "brandId", placeholder: "Select a brand" },
        { label: "Product Name", field: "productName", placeholder: "What product/service would you like to promote?" },
        { label: "Content Brief", field: "contentBrief", placeholder: "Describe your content ideas for the brand" },
        { label: "Statistics", field: "statistics" },
        { label: "Commercial Model", field: "commercialModel" },
        { label: "Your Best Collaborations", field: "collaborationLinks" },
    ];

    if (showConfirmation) {
        return (
            <div className="confirmation-page">
                <div className="confirmation-card">
                    <img
                        src="https://www.iconpacks.net/icons/2/free-check-icon-3278-thumb.png" // Placeholder success image
                        alt="Success"
                        className="confirmation-image"
                    />
                    <h2 className="confirmation-title">Request Submitted Successfully!</h2>
                    <p className="confirmation-message">
                        Your collaboration request is now with the brand for review.<br></br> You can check the request status from your Creator dashboard. 
                        <br></br>Let's make your dream collaboration a reality!
                    </p>
                    <div className="confirmation-buttons">
                        <button className="primary-btn" onClick={handleBackToDashboard}>Back to My Dashboard</button>
                        <button className="secondary-btn" onClick={handleNewRequest}>Submit New Request</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="typeform-container">
            <motion.div
                className="form-step"
                key={step}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5 }}
            >
                <h2>{steps[step - 1].label}</h2>

                {step === 1 && (
                    <div className="brand-input-container">
                        <Select
                            name="brandId"
                            value={brands.find(brand => brand.value === formData.brandId) || null}
                            onChange={handleBrandChange}
                            options={brands}
                            placeholder="Select a brand"
                            required
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="product-input-container">
                        <input
                            type="text"
                            name="productName"
                            value={formData.productName}
                            onChange={handleChange}
                            placeholder="What product/service would you like to promote?"
                            required
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="content-brief-container">
                        <textarea
                            name="contentBrief"
                            value={formData.contentBrief}
                            onChange={handleChange}
                            placeholder="Describe your content ideas for the brand"
                            className="fixed-textarea"
                            required
                        />
                        <p>{wordCount}/{maxWords} words</p>
                    </div>
                )}

                {/* For Statistics Step */}
                {step === 4 && (
                    <div className="statistics-container">
                        <h3>Provide your Social Media Statistics</h3>
                        <div className="statistics-grid">
                            <div className="statistics-group">
                                <label>Follower Count</label>
                                <input
                                    type="number"
                                    name="followerCount"
                                    value={formData.followerCount}
                                    onChange={handleChange}
                                    placeholder="e.g., 10000"
                                    required
                                    className="statistics-input"
                                />
                            </div>

                            <div className="statistics-group">
                                <label>Accounts Reached</label>
                                <input
                                    type="number"
                                    name="accountsReached"
                                    value={formData.accountsReached}
                                    onChange={handleChange}
                                    placeholder="e.g., 50000"
                                    required
                                    className="statistics-input"
                                />
                            </div>

                            <div className="statistics-group">
                                <label>Impressions</label>
                                <input
                                    type="number"
                                    name="impressions"
                                    value={formData.impressions}
                                    onChange={handleChange}
                                    placeholder="e.g., 150000"
                                    required
                                    className="statistics-input"
                                />
                            </div>

                            <div className="statistics-group">
                                <label>Top Locations Reach</label>
                                <Select
                                    isMulti
                                    name="topLocations"
                                    value={formData.topLocations}
                                    onChange={handleLocationChange}
                                    options={locationOptions}
                                    className="multi-select"
                                    classNamePrefix="select"
                                    placeholder="Select top locations"
                                    required
                                />
                            </div>

                            <div className="statistics-group">
                                <label>Primary Age Range</label>
                                <Select
                                    isMulti
                                    name="primaryAgeRange"
                                    value={formData.primaryAgeRange}
                                    onChange={handleAgeRangeChange}
                                    options={ageRangeOptions}
                                    className="multi-select"
                                    classNamePrefix="select"
                                    placeholder="Select age range"
                                    required
                                />
                            </div>

                            <div className="statistics-group">
                                <label>Gender Reach Ratio</label>
                                <select
                                    name="genderReachRatio"
                                    value={formData.genderReachRatio}
                                    onChange={handleChange}
                                    required
                                    className="statistics-input"
                                >
                                    <option value="">Select gender reach ratio</option>
                                    <option value="50% Male / 50% Female">50% Male / 50% Female</option>
                                    <option value="60% Male / 40% Female">60% Male / 40% Female</option>
                                    <option value="40% Male / 60% Female">40% Male / 60% Female</option>
                                    <option value="70% Male / 30% Female">70% Male / 30% Female</option>
                                    <option value="30% Male / 70% Female">30% Male / 70% Female</option>
                                    <option value="Custom">Custom</option>
                                </select>
                            </div>

                            {isCustomRatio && (
                                <>
                                    <div className="statistics-group">
                                        <label>Male %</label>
                                        <input
                                            type="number"
                                            name="customMaleRatio"
                                            value={formData.customMaleRatio}
                                            onChange={handleChange}
                                            placeholder="Enter male %"
                                            required
                                            className="statistics-input"
                                            max="100"
                                        />
                                    </div>

                                    <div className="statistics-group">
                                        <label>Female %</label>
                                        <input
                                            type="number"
                                            name="customFemaleRatio"
                                            value={formData.customFemaleRatio}
                                            onChange={handleChange}
                                            placeholder="Enter female %"
                                            required
                                            className="statistics-input"
                                            max="100"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* For Commercial Model Step */}
                {step === 5 && (
                    <div className="commercial-model-container">
                        <Select
                            name="commercialModel"
                            options={[
                                { value: 'commission', label: 'Commission per sale' },
                                { value: 'fixed', label: 'Fixed fee' },
                                { value: 'gifting', label: 'Gifting' },
                                { value: 'hybrid', label: 'Hybrid (Commission + Fixed fee)' }
                            ]}
                            onChange={handleCommercialModelChange}
                            placeholder="Select a commercial model"
                            required
                        />

                        {/* Display Commission Percentage input when commission or hybrid model is selected */}
                        {(formData.commercialModel === 'commission' || formData.commercialModel === 'hybrid') && (
                            <div className="form-group">
                                <label>Commission Percentage</label>
                                <input
                                    type="text"
                                    name="commissionPercentage"
                                    value={formData.commissionPercentage}
                                    onChange={handleChange}
                                    placeholder="Enter commission percentage"
                                    required
                                />
                            </div>
                        )}

                        {/* Display Fixed Fee input when fixed or hybrid model is selected */}
                        {(formData.commercialModel === 'fixed' || formData.commercialModel === 'hybrid') && (
                            <div className="form-group">
                                <label>Fixed Fee</label>
                                <input
                                    type="text"
                                    name="fixedFee"
                                    value={formData.fixedFee}
                                    onChange={handleChange}
                                    placeholder="Enter fixed fee"
                                    required
                                />
                            </div>
                        )}
                    </div>
                )}

                {step === 6 && (
                    <div className="best-collaborations-container">
                        <label>Share links to your best collaborations with brands</label>
                        {formData.collaborationLinks.map((link, index) => (
                            <div key={index} className="collaboration-link-input">
                                <input
                                    type="url"
                                    name={`collaborationLink${index}`}
                                    value={link}
                                    onChange={(e) => handleCollaborationLinkChange(index, e.target.value)}
                                    placeholder="Paste collaboration link"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveCollaborationLink(index)}
                                    className="remove-link-button"
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddCollaborationLink}
                            className="add-link-button"
                        >
                            Add another link
                        </button>
                    </div>
                )}
            </motion.div>

            <div className="form-navigation">
                {step > 1 && <button onClick={handlePreviousStep}>Back</button>}
                {step < steps.length && <button onClick={handleNextStep}>Next</button>}
                {step === steps.length && <button onClick={handleSubmit}>Submit</button>}
            </div>

            <div className="progress-bar">
                <div style={{ width: `${(step / steps.length) * 100}%` }}></div>
            </div>
        </div>
    );
}

export default NewSubmission;
