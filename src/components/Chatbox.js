import React from 'react';
import { Input, Button } from 'antd';
import './Chatbox.css'; // Import the updated CSS

const Chatbox = ({ messages, currentMessage, onMessageChange, onSendMessage, senderType }) => (
    <div className="chatbox-container">
        {/* Display messages */}
        <div className="chatbox-messages">
            {messages.map((msg, index) => (
                <div
                    key={index}
                    className={`chat-bubble ${
                        msg.sender_type === senderType ? 'my-message' : 'other-message'
                    }`}
                >
                    {/* Display sender's name based on sender_type */}
                    {msg.sender_type !== senderType && (
                        <p className="sender-name">
                            {msg.sender_type === 'creator' ? 'Creator' : 'Brand'}
                        </p>
                    )}
                    <p className="message-text">{msg.message}</p>
                    <small className="message-timestamp">
                        {new Date(msg.created_at).toLocaleString()}
                    </small>
                </div>
            ))}
        </div>

        {/* Input for new message */}
        <div className="input-area">
            <Input.TextArea
                value={currentMessage}
                onChange={onMessageChange}
                placeholder="Type your message..."
                className="chat-input"
                autoSize={{ minRows: 1, maxRows: 3 }}
            />
            <Button type="primary" onClick={onSendMessage} className="send-button">
                Send
            </Button>
        </div>
    </div>
);

export default Chatbox;
