import React from 'react';

const Modal = ({ show, onClose, creator }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay" style={{ /* Your modal styles */ }}>
            <div className="modal-content" style={{ /* Your content styles */ }}>
                <button onClick={onClose} style={{ /* Close button styles */ }}>X</button>
                {creator && (
                    <>
                        <h2>{creator.Name}</h2>
                        <p><strong>Platform:</strong> {creator.Platforme}</p>
                        <p><strong>Followers:</strong> {creator.Followers}</p>
                        <p><strong>Country:</strong> {creator.Country}</p>
                        <p><strong>Budget:</strong> ${creator.Budget}</p>
                        <a href={creator.URL} target="_blank" rel="noopener noreferrer">Visit Profile</a>
                    </>
                )}
            </div>
        </div>
    );
};

export default Modal;
