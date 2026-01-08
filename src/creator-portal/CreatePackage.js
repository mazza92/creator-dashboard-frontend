import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import Select from 'react-select';
import { Slider, InputNumber, notification } from 'antd';
import './TypeformStyle.css'; // Assuming you use similar styling to NewSubmission
import './ConfirmationStyle.css'; // Assuming you have a confirmation page

function CreatePackage() {
    const [step, setStep] = useState(1);
    const [packageData, setPackageData] = useState({
        package_name: '',
        platform: '',
        deliverables: [],
        price: 500, // Default starting value for price
        description: '',
        estimate_reach: 10000 // Default estimate reach
    });

    const [wordCount, setWordCount] = useState(0);
    const maxWords = 300; // Limit word count for description

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false); // Show the confirmation page

    // Options for platform and deliverables
    const platforms = [
        { value: 'Instagram', label: 'Instagram' },
        { value: 'YouTube', label: 'YouTube' },
        { value: 'TikTok', label: 'TikTok' },
        { value: 'Twitter', label: 'Twitter' }
    ];

    const deliverables = [
        { value: 'Post', label: 'Post' },
        { value: 'Video', label: 'Video' },
        { value: 'Story', label: 'Story' },
        { value: 'Blog Post', label: 'Blog Post' }
    ];

    // Handle step navigation
    const handleNextStep = () => {
        if (step < 4) setStep(step + 1); // 4 steps total
    };

    const handlePreviousStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPackageData({ ...packageData, [name]: value });

        // Update word count for description
        if (name === 'description') {
            const words = value.trim().split(/\s+/).length;
            if (words <= maxWords) {
                setWordCount(words);
            }
        }
    };

    const handleSelectChange = (selectedOption, field) => {
        setPackageData({ ...packageData, [field]: selectedOption ? selectedOption.map(option => option.value) : [] });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const response = await axios.post('http://localhost:5000/packages', {
                creator_id: 1, // Replace with dynamic creator_id
                ...packageData
            });
            notification.success({
                message: 'Success',
                description: response.data.message
            });
            setShowConfirmation(true); // Show confirmation after successful submission
        } catch (error) {
            notification.error({
                message: 'Error',
                description: error.response ? error.response.data.error : 'Failed to create package'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showConfirmation) {
        return (
            <div className="confirmation-page">
                <div className="confirmation-card">
                    <img
                        src="https://www.iconpacks.net/icons/2/free-check-icon-3278-thumb.png" // Success icon
                        alt="Success"
                        className="confirmation-image"
                    />
                    <h2 className="confirmation-title">Package Created Successfully!</h2>
                    <p className="confirmation-message">
                        Your package has been successfully created. It is now available for brands to view and book.
                    </p>
                    <button className="primary-btn" onClick={() => setShowConfirmation(false)}>
                        Back to Dashboard
                    </button>
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
                {step === 1 && (
                    <div className="form-group">
                        <h2>Package Name</h2>
                        <input
                            type="text"
                            name="package_name"
                            value={packageData.package_name}
                            onChange={handleChange}
                            placeholder="Enter package name"
                            required
                        />
                    </div>
                )}

                {step === 2 && (
                    <div className="form-group">
                        <h2>Platform & Deliverables</h2>
                        <label>Platform</label>
                        <Select
                            isMulti={false}
                            name="platform"
                            options={platforms}
                            onChange={(option) => handleSelectChange([option], 'platform')}
                            placeholder="Select platform"
                            required
                        />

                        <label>Deliverables</label>
                        <Select
                            isMulti
                            name="deliverables"
                            options={deliverables}
                            onChange={(options) => handleSelectChange(options, 'deliverables')}
                            placeholder="Select deliverables"
                            required
                        />
                    </div>
                )}

                {step === 3 && (
                    <div className="form-group">
                        <h2>Pricing & Estimated Reach</h2>
                        <label>Price</label>
                        <Slider
                            min={50}
                            max={5000}
                            onChange={(value) => setPackageData({ ...packageData, price: value })}
                            value={packageData.price}
                            tooltipVisible
                        />
                        <InputNumber
                            min={50}
                            max={5000}
                            value={packageData.price}
                            onChange={(value) => setPackageData({ ...packageData, price: value })}
                            formatter={(value) => `$ ${value}`}
                            parser={(value) => value.replace('$', '')}
                        />

                        <label>Estimated Reach</label>
                        <InputNumber
                            min={1000}
                            max={1000000}
                            value={packageData.estimate_reach}
                            onChange={(value) => setPackageData({ ...packageData, estimate_reach: value })}
                            formatter={(value) => `${value.toLocaleString()} users`}
                            parser={(value) => value.replace(/\D/g, '')}
                        />
                    </div>
                )}

                {step === 4 && (
                    <div className="form-group">
                        <h2>Description</h2>
                        <textarea
                            name="description"
                            value={packageData.description}
                            onChange={handleChange}
                            placeholder="Describe the details of the package"
                            required
                            rows="5"
                        />
                        <p>{wordCount}/{maxWords} words</p>
                    </div>
                )}
            </motion.div>

            <div className="form-navigation">
                {step > 1 && <button onClick={handlePreviousStep}>Back</button>}
                {step < 4 && <button onClick={handleNextStep}>Next</button>}
                {step === 4 && (
                    <button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </button>
                )}
            </div>

            <div className="progress-bar">
                <div style={{ width: `${(step / 4) * 100}%` }}></div>
            </div>
        </div>
    );
}

export default CreatePackage;
