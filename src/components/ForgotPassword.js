import React, { useState } from "react";
import { Form, Input, Typography, message } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

// Keyframes for background animation
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components (reused from Login.jsx)
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #26A69A, #4DB6AC, #3B82F6);
  background-size: 200% 200%;
  animation: ${gradientShift} 15s ease infinite;
  font-family: "Inter", sans-serif;
  padding: 20px;
  position: relative;
`;

const ForgotPasswordCard = styled.div`
  background: rgba(255, 255, 255, 0.98);
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 32px;
  width: 100%;
  max-width: 420px;
  z-index: 2;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  }
  @media (max-width: 768px) {
    padding: 24px;
    max-width: 90%;
  }
`;

const StyledButton = styled.button`
  border-radius: 24px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #26A69A, #4DB6AC);
  border: none;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  width: 100%;
  height: 44px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover {
    background: linear-gradient(135deg, #4DB6AC, #26A69A);
    transform: scale(1.02);
  }
  &:disabled {
    background: #d1d5db;
    color: #6b7280;
    cursor: not-allowed;
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 16px;
    height: 40px;
  }
`;

const StyledInput = styled(Input)`
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    border-color: #26A69A;
  }
  &:focus {
    border-color: #26A69A;
    box-shadow: 0 0 0 3px rgba(38, 166, 154, 0.2);
  }
  .ant-input-prefix {
    color: #4b5563;
    margin-right: 8px;
  }
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 8px 12px;
  }
`;

const LinkText = styled(Link)`
  color: #26A69A;
  font-weight: 500;
  transition: color 0.2s ease;
  &:hover {
    color: #4DB6AC;
    text-decoration: underline;
  }
`;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleForgotPassword = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reset email.');
      }

      const data = await response.json();
      message.success(data.message);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
    } catch (error) {
      message.error(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <ForgotPasswordCard>
          <Title
            level={2}
            style={{
              textAlign: "center",
              fontSize: "28px",
              color: "#1f2937",
              marginBottom: 8,
            }}
          >
            Forgot Password
          </Title>
          <Text
            style={{
              display: "block",
              textAlign: "center",
              color: "#4b5563",
              fontSize: "14px",
              marginBottom: 24,
            }}
          >
            Enter your email to receive a password reset link
          </Text>
          <Form
            form={form}
            name="forgot_password_form"
            onFinish={handleForgotPassword}
            layout="vertical"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <StyledInput
                prefix={<MailOutlined />}
                placeholder="Enter your email"
                aria-label="Email"
              />
            </Form.Item>

            <Form.Item>
              <motion.div variants={buttonVariants} whileHover="hover">
                <StyledButton
                  primary
                  type="submit"
                  disabled={loading}
                  aria-label="Send Reset Link"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </StyledButton>
              </motion.div>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginTop: 16 }}>
              <Text style={{ color: "#4b5563", fontSize: "14px" }}>
                Back to <LinkText to="/login">Sign In</LinkText>
              </Text>
            </Form.Item>
          </Form>
        </ForgotPasswordCard>
      </motion.div>
    </Container>
  );
}

export default ForgotPassword;