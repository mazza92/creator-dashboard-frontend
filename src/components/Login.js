import React, { useState, useContext } from 'react';
import { Form, Input, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { apiClient } from '../config/api'; // Import apiClient

const { Title, Text } = Typography;

// Keyframes and Styled Components (unchanged)
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-8px);}
  to { opacity: 1; transform: translateY(0);}
`;

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

const LoginCard = styled.div`
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
  background: ${props =>
    props.primary === "true" ? "linear-gradient(90deg, #10b981 0%, #4ade80 100%)" : "#fff"};
  border: ${props => (props.primary === "true" ? "none" : "1px solid #d1d5db")};
  color: ${props => (props.primary === "true" ? "#fff" : "#4b5563")};
  font-weight: 600;
  font-size: 15px;
  width: 100%;
  height: 48px;
  min-height: 48px;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  &:hover {
    background: ${props =>
      props.primary === "true"
        ? "linear-gradient(90deg, #22d3ee 0%, #10b981 100%)"
        : "#e6f7ff"};
    color: ${props => (props.primary === "true" ? "#fff" : "#10b981")};
    border-color: ${props => (props.primary === "true" ? "none" : "#10b981")};
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
    height: 48px;
    min-height: 48px;
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
    border-color: #10b981;
  }
  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
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

const StyledPasswordInput = styled(Input.Password)`
  border-radius: 24px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  background: #fff;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:hover {
    border-color: #10b981;
  }
  &:focus {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
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
  color: #10b981;
  font-weight: 500;
  transition: color 0.2s ease;
  &:hover {
    color: #4ade80;
    text-decoration: underline;
  }
`;

const ErrorText = styled(Text)`
  display: block;
  text-align: center;
  color: #ef4444;
  font-size: 14px;
  margin-bottom: 16px;
  animation: ${fadeIn} 0.3s;
`;

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

function Login({ onSuccess, showSignupLink, onSignupClick, isModal = false }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [form] = Form.useForm();

  const handleLogin = async (values) => {
      const { email, password } = values;
      setLoading(true);
      setError('');

      try {
          console.log('🟢 Attempting login for:', email);
          const response = await apiClient.post('/login', { email, password });
          const data = response.data;

          console.log('🟢 Login Response:', data);

          if (data.message && (data.message.includes('Login successful') || data.profile_incomplete)) {
              localStorage.setItem('userId', data.user_id);
              localStorage.setItem('userRole', data.user_role);
              setUser({
                  id: data.user_id,
                  role: data.user_role,
                  creator_id: data.creator_id,
                  brand_id: data.brand_id,
              });
              
              // Handle incomplete profile case
              if (data.profile_incomplete) {
                  console.log('🔄 User has incomplete profile, redirecting to onboarding');
                  message.info('Welcome back! Let\'s complete your profile setup.');
              }
              
              console.log('✅ Login successful, redirecting to:', data.redirect_url);
              
              // If onSuccess callback is provided, call it instead of navigating
              if (onSuccess) {
                onSuccess();
                return;
              }
              
              // Always extract just the pathname to avoid URL concatenation issues
              try {
                const urlObj = new URL(data.redirect_url, window.location.origin);
                const redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
                console.log('🔄 Extracted pathname:', redirectUrl);
                navigate(redirectUrl);
              } catch (e) {
                console.log('🔄 Using redirect URL as-is:', data.redirect_url);
                navigate(data.redirect_url);
              }
          } else {
              console.warn('🚖 Unexpected login response:', data);
              setError('Login failed. Please try again.');
          }
      } catch (error) {
          console.error('❌ Login error:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data,
          });
          setError(error.response?.data?.error || 'An error occurred. Please try again.');
      } finally {
          setLoading(false);
      }
  };

  const handleGoogleSignIn = async () => {
      setGoogleLoading(true);
      try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          const idToken = await user.getIdToken();

          console.log('🔑 Google Sign-In success:', {
              email: user.email,
              name: user.displayName,
          });

          const response = await apiClient.post('/google-signup', {
              idToken,
              email: user.email,
              name: user.displayName,
          });

          const data = response.data;
          console.log('✅ Google Sign-In response:', {
              status: response.status,
              data: {
                  user_id: data.user_id,
                  user_role: data.user_role,
                  creator_id: data.creator_id,
                  brand_id: data.brand_id,
                  redirect_url: data.redirect_url,
              },
          });

          localStorage.setItem('userId', data.user_id);
          localStorage.setItem('userRole', data.user_role);
          setUser({
              id: data.user_id,
              role: data.user_role,
              creator_id: data.creator_id,
              brand_id: data.brand_id,
          });

          const redirectUrl = data.redirect_url || (data.user_role === 'creator' ? '/creator/dashboard/pr-brands' : '/brand/dashboard/overview');
          console.log('🔄 Navigating to:', redirectUrl);
          navigate(redirectUrl, { replace: true });
      } catch (error) {
          console.error('❌ Google Sign-In error:', {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
          });
          const errorMessage = error.response?.data?.error || error.message || 'Google Sign-In failed. Please try again.';
          if (error.response?.status === 404 && errorMessage.includes('Please register first')) {
              message.info('No account available. Redirecting to registration.');
              navigate('/register', { state: { email: error.response?.data?.email || '' } });
          } else {
              message.error(errorMessage);
          }
          setError(errorMessage);
      } finally {
          setGoogleLoading(false);
      }
  };

  // Modal version - cleaner and more compact
  if (isModal) {
    return (
      <div style={{ width: '100%' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: 32
        }}>
          <h2 style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Welcome Back
          </h2>
          <p style={{
            fontSize: 14,
            color: '#6b7280',
            margin: 0
          }}>
            Log in to continue with your PR package proposal
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: 8,
            marginBottom: 20,
            fontSize: 14
          }}>
            {error}
          </div>
        )}

        <Form
          form={form}
          name="login_form"
          onFinish={handleLogin}
          layout="vertical"
          style={{ marginBottom: 20 }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
            style={{ marginBottom: 16 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Email"
              size="large"
              style={{
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 15
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
            style={{ marginBottom: 20 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Password"
              size="large"
              style={{
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 15
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <button
              type="submit"
              disabled={loading || googleLoading}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loading || googleLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading && !googleLoading) {
                  e.target.style.background = '#059669';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !googleLoading) {
                  e.target.style.background = '#10b981';
                }
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </Form.Item>
        </Form>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          margin: '20px 0',
          gap: 12
        }}>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          <span style={{ fontSize: 12, color: '#9ca3af' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
        </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading || googleLoading}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: '#fff',
            color: '#1f2937',
            border: '1.5px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: loading || googleLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
            marginBottom: 20
          }}
          onMouseEnter={(e) => {
            if (!loading && !googleLoading) {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.background = '#f9fafb';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && !googleLoading) {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = '#fff';
            }
          }}
        >
          <GoogleOutlined style={{ fontSize: 18 }} />
          {googleLoading ? "Processing..." : "Continue with Google"}
        </button>

        {showSignupLink && (
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onSignupClick}
                style={{
                  color: '#10b981',
                  fontWeight: 600,
                  textDecoration: 'none',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = 'none';
                }}
              >
                Sign up
              </button>
            </span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            style={{
              fontSize: 13,
              color: '#6b7280',
              textDecoration: 'none',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#10b981';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#6b7280';
            }}
          >
            Forgot password?
          </button>
        </div>
      </div>
    );
  }

  // Full-page version
  return (
      <Container>
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <LoginCard>
                  <Title
                      level={2}
                      style={{
                          textAlign: "center",
                          fontSize: "28px",
                          color: "#1f2937",
                          marginBottom: 8,
                      }}
                  >
                      Welcome Back
                  </Title>
                  <Text
                      style={{
                          display: "block",
                          textAlign: "center",
                          color: "#4b5563",
                          fontSize: "15px",
                          marginBottom: 24,
                          fontWeight: 500,
                      }}
                  >
                      Welcome back! Log in to continue.
                  </Text>
                  {error && (
                      <ErrorText>{error}</ErrorText>
                  )}
                  <Form
                      form={form}
                      name="login_form"
                      initialValues={{ remember: true }}
                      onFinish={handleLogin}
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
                              prefix={<UserOutlined />}
                              placeholder="Enter your email"
                              aria-label="Email"
                          />
                      </Form.Item>

                      <Form.Item
                          name="password"
                          label="Password"
                          rules={[{ required: true, message: "Please enter your password" }]}
                      >
                          <StyledPasswordInput
                              prefix={<LockOutlined />}
                              placeholder="Enter your password"
                              aria-label="Password"
                          />
                      </Form.Item>

                      <Form.Item>
                          <motion.div variants={buttonVariants} whileHover="hover">
                              <StyledButton
                                  primary="true"
                                  type="submit"
                                  disabled={loading || googleLoading}
                                  aria-label="Sign in"
                              >
                                  {loading ? "Signing in..." : "Sign in"}
                              </StyledButton>
                          </motion.div>
                      </Form.Item>
                  </Form>

                  <Text
                      style={{
                          display: "block",
                          textAlign: "center",
                          color: "#4b5563",
                          fontSize: "14px",
                          margin: "16px 0",
                      }}
                  >
                      Or
                  </Text>

                  <motion.div variants={buttonVariants} whileHover="hover">
                      <StyledButton
                          onClick={handleGoogleSignIn}
                          disabled={loading || googleLoading}
                          aria-label="Sign in with Google"
                      >
                          <GoogleOutlined />
                          {googleLoading ? "Processing..." : "Sign in with Google"}
                      </StyledButton>
                  </motion.div>

                  {showSignupLink && (
                    <Form.Item style={{ textAlign: "center", marginTop: 16 }}>
                        <Text style={{ color: "#4b5563", fontSize: "14px" }}>
                            Don't have an account?{' '}
                            {onSignupClick ? (
                              <button
                                type="button"
                                onClick={onSignupClick}
                                style={{ 
                                  color: "#10b981", 
                                  fontWeight: 500, 
                                  textDecoration: "none",
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  fontSize: 'inherit',
                                  fontFamily: 'inherit'
                                }}
                              >
                                Sign up
                              </button>
                            ) : (
                              <LinkText to="/register">Register</LinkText>
                            )}
                        </Text>
                    </Form.Item>
                  )}
                  {!showSignupLink && (
                    <Form.Item style={{ textAlign: "center", marginTop: 16 }}>
                        <Text style={{ color: "#4b5563", fontSize: "14px" }}>
                            Don't have an account? <LinkText to="/register">Register</LinkText>
                        </Text>
                    </Form.Item>
                  )}
                  <Form.Item style={{ textAlign: "center" }}>
                      <LinkText to="/forgot-password">Forgot Password?</LinkText>
                  </Form.Item>
                  <Form.Item style={{ textAlign: "center", marginTop: 0 }}>
                      <LinkText to="/">← Back to Home</LinkText>
                  </Form.Item>
              </LoginCard>
          </motion.div>
      </Container>
  );
}

export default Login;