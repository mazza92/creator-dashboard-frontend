import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LoadingSpinner } from './LoadingSpinner';

const PartnerMatch = () => {
    const [websiteURL, setWebsiteURL] = useState("");
    const [matchedCreators, setMatchedCreators] = useState([]);
    const [loading, setLoading] = useState(false);

    const handlePartnerMatch = async () => {
        setLoading(true);
        try {
            const response = await axios.post("http://127.0.0.1:5000/partner-match", { url: websiteURL });
            setMatchedCreators(response.data.creators);
        } catch (error) {
            console.error("Error fetching matched partners:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "600px", margin: "20px auto", padding: "20px" }}>
            <h1>Partner Match</h1>
            <input 
                type="text" 
                value={websiteURL} 
                onChange={(e) => setWebsiteURL(e.target.value)} 
                placeholder="Enter your website URL" 
                style={{ width: "100%", padding: "10px", marginBottom: "10px" }} 
            />
            <button onClick={handlePartnerMatch} style={{ padding: "10px 20px" }}>Generate my partner</button>

            {loading && <LoadingSpinner text="Finding matches..." />}

            <ul style={{ listStyleType: "none", padding: 0, marginTop: "20px" }}>
                {matchedCreators.length > 0 ? matchedCreators.map((creator, index) => (
                    <li key={index} style={{ border: "1px solid #ddd", padding: "15px", margin: "10px 0" }}>
                        <strong>{creator.Name}</strong> - Type: {creator.Type} <br />
                        URL: <a href={creator.URL} target="_blank" rel="noopener noreferrer">{creator.URL}</a> <br />
                        Country: {creator.Country} <br />
                        Topics: {creator.Topics} <br />
                    </li>
                )) : !loading && <li>No matching partners found.</li>}
            </ul>
        </div>
    );
};

export default PartnerMatch;
