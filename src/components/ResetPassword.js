import React, { useState, useEffect } from "react";
import { Form, Input, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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

const ResetPasswordCard = styled.div`
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

const StyledPasswordInput = styled(Input.Password)`
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

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      message.error("Invalid or missing reset token.");
      setTimeout(() => navigate("/login"), 3000);
    }
  }, [searchParams, navigate]);

  const handleResetPassword = async values => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          new_password: values.new_password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reset password.");
      }

      const data = await response.json();
      message.success(data.message);
      setTimeout(() => navigate("/login"), 3000); // Redirect to login after 3 seconds
    } catch (error) {
      message.error(error.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <motion.div variants={cardVariants} initial="hidden" animate="visible">
        <ResetPasswordCard>
          <Title
            level={2}
            style={{
              textAlign: "center",
              fontSize: "28px",
              color: "#1f2937",
              marginBottom: 8,
            }}
          >
            Reset Password
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
            Enter your new password
          </Text>
          <Form
            form={form}
            name="reset_password_form"
            onFinish={handleResetPassword}
            layout="vertical"
          >
            <Form.Item
              name="new_password"
              label="New Password"
              rules={[
                { required: true, message: "Please enter your new password" },
                { min: 8, message: "Password must be at least 8 characters" },
              ]}
            >
              <StyledPasswordInput
                prefix={<LockOutlined />}
                placeholder="Enter your new password"
                aria-label="New Password"
              />
            </Form.Item>

            <Form.Item
              name="confirm_password"
              label="Confirm Password"
              dependencies={['new_password']}
              rules={[
                { required: true, message: "Please confirm your new password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('new_password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <StyledPasswordInput
                prefix={<LockOutlined />}
                placeholder="Confirm your new password"
                aria-label="Confirm Password"
              />
            </Form.Item>

            <Form.Item>
              <motion.div variants={buttonVariants} whileHover="hover">
                <StyledButton
                  primary
                  type="submit"
                  disabled={loading || !token}
                  aria-label="Reset Password"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </StyledButton>
              </motion.div>
            </Form.Item>

            <Form.Item style={{ textAlign: "center", marginTop: 16 }}>
              <Text style={{ color: "#4b5563", fontSize: "14px" }}>
                Back to <LinkText to="/login">Sign In</LinkText>
              </Text>
            </Form.Item>
          </Form>
        </ResetPasswordCard>
      </motion.div>
    </Container>
  );
}

export default ResetPassword;