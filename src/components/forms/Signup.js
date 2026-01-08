import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { message, Typography } from 'antd';
import { UserContext } from '../../contexts/UserContext';
import BrandOnboardingForm from './BrandOnboardingForm';
import CreatorOnboardingForm from './CreatorOnboardingForm';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { ShopOutlined, UserOutlined } from '@ant-design/icons';
import './Signup.css';
import { Helmet } from 'react-helmet-async';

const { Title, Text } = Typography;

// Gradient animation
// eslint-disable-next-line no-unused-vars
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #a7c7ff 0%, #c3aed6 100%);
  font-family: 'Inter', sans-serif;
  padding: 24px 8px;
  overflow-x: hidden;
  box-sizing: border-box;
`;

const SignupCard = styled.div`
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 24px rgba(16,185,129,0.10);
  padding: 40px 32px 32px 32px;
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(16,185,129,0.15);
  }
  @media (max-width: 600px) {
    padding: 18px 6px 18px 6px;
    max-width: 100%;
  }
`;

const RoleSelection = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 18px;
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: center;
    gap: 14px;
    margin-bottom: 12px;
  }
`;

const RoleCard = styled(motion.div)`
  background: #fff;
  border-radius: 16px;
  border: 1.5px solid #e8ecef;
  box-shadow: 0 6px 16px rgba(16,185,129,0.08);
  padding: 28px 18px 22px 18px;
  width: 100%;
  max-width: 320px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-sizing: border-box;
  font-size: 17px;
  font-weight: 600;
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(16,185,129,0.12);
    border-color: #10b981;
  }
  @media (max-width: 600px) {
    max-width: 95%;
    padding: 16px 6px 14px 6px;
    font-size: 15px;
  }
`;

const StyledButton = styled.button`
  border-radius: 12px;
  padding: 14px 0;
  background: linear-gradient(90deg, #10b981 0%, #4ade80 100%);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  width: 100%;
  border: none;
  height: 48px;
  margin-top: 8px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  box-shadow: 0 2px 8px rgba(16,185,129,0.08);
  &:hover {
    background: linear-gradient(90deg, #22d3ee 0%, #10b981 100%);
    color: #fff;
    transform: scale(1.02);
  }
  &:active {
    transform: scale(0.98);
  }
  @media (max-width: 600px) {
    font-size: 15px;
    height: 44px;
  }
`;

const TitleStyled = styled(Title)`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
  margin-bottom: 12px;
  font-family: 'Inter', 'Poppins', sans-serif;
  @media (max-width: 600px) {
    font-size: 24px;
  }
`;

const Subtitle = styled(Text)`
  display: block;
  text-align: center;
  color: #4b5563;
  font-size: 15px;
  margin-bottom: 28px;
  font-family: 'Inter', 'Poppins', sans-serif;
  @media (max-width: 600px) {
    font-size: 13px;
    margin-bottom: 18px;
  }
`;

const BackHomeButton = styled.button`
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: none;
  border: 1px solid #D1D5DB;
  color: #6B7280;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  &:hover {
    background: #F9FAFB;
    border-color: #9CA3AF;
    color: #374151;
  }
  
  @media (max-width: 768px) {
    top: 1rem;
    left: 1rem;
    font-size: 0.8rem;
    padding: 0.375rem 0.75rem;
  }
  
  @media (max-width: 480px) {
    top: 0.75rem;
    left: 0.75rem;
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 0;
  }
`;

// Framer Motion variants
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const roleCardVariants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } },
};

function Signup({ defaultRole, redirectTo, onSuccess, isModal = false, onLoginClick }) {
  const [selectedRole, setSelectedRole] = useState(defaultRole || null);
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  // Set default role on mount if provided
  useEffect(() => {
    if (defaultRole) {
      setSelectedRole(defaultRole);
    }
  }, [defaultRole]);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
  };

  const handleFormSuccess = ({ data }) => {
    console.log('✅ Registration Successful:', data);
    console.log('✅ Data keys:', Object.keys(data));
    console.log('✅ user_id:', data.user_id, 'brand_id:', data.brand_id, 'creator_id:', data.creator_id);
    const userRole = data.user_role || data.role || selectedRole;
    if (!userRole) {
      console.error('🔥 Registration failed: Missing user_role');
      message.error('Registration failed: Missing user role.');
      return;
    }
    
    // Set user context with profile completion data
    const userData = {
      id: data.user_id || data.id,
      role: userRole,
      creator_id: data.creator_id || null,
      brand_id: data.brand_id || null,
    };
    setUser(userData);
    localStorage.setItem('userRole', userRole);
  
    // If onSuccess callback is provided, call it instead of navigating
    if (onSuccess) {
      onSuccess();
      return;
    }

    // Use redirectTo prop if provided, otherwise use data.redirect_url
    let redirectUrl = redirectTo || data.redirect_url;
    
    // Always extract just the pathname to avoid URL concatenation issues
    try {
      const urlObj = new URL(redirectUrl, window.location.origin);
      redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
      console.log('🔄 Extracted pathname:', redirectUrl);
    } catch (e) {
      console.log('🔄 Using redirect URL as-is:', redirectUrl);
    }

    try {
      if (!redirectUrl || typeof redirectUrl !== 'string') {
        throw new Error('Invalid redirect URL');
      }
      console.log('🔄 Navigating to:', redirectUrl);
      navigate(redirectUrl, { replace: true }); // Use navigate instead of window.location.href
    } catch (error) {
      console.error('🔥 Redirect error:', error);
      const fallbackUrl = userRole === 'creator'
        ? '/creator/overview'
        : '/brand/overview';
      message.warning(`Redirect failed. Navigating to ${fallbackUrl}...`);
      navigate(fallbackUrl, { replace: true });
    }
  };

  const handleFormError = (error) => {
    console.error('🔥 Registration error:', error);
    message.error(error.message || error.response?.data?.error || 'Registration failed. Please try again.');
  };

  // Modal version - cleaner and more organic layout
  if (isModal) {
    return (
      <div style={{ width: '100%' }}>
        {!selectedRole ? (
          <div>
            <div style={{
              textAlign: 'center',
              marginBottom: 40
            }}>
              <h2 style={{
                fontSize: 28,
                fontWeight: 700,
                color: '#1f2937',
                margin: '0 0 12px 0',
                letterSpacing: '-0.02em'
              }}>
                Create Account
              </h2>
              <p style={{
                fontSize: 15,
                color: '#6b7280',
                margin: 0,
                lineHeight: 1.5
              }}>
                Sign up to propose a PR package
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}>
              <button
                onClick={() => handleRoleChange('brand')}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <ShopOutlined style={{ fontSize: 28, color: '#10b981' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>
                    Brand
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                    Find the best creators for your brand
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleChange('creator')}
                style={{
                  width: '100%',
                  padding: '20px 24px',
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: 16,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 20,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#10b981';
                  e.currentTarget.style.background = '#f0fdf4';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fff';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <UserOutlined style={{ fontSize: 28, color: '#10b981' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 600, color: '#1f2937', marginBottom: 6 }}>
                    Creator
                  </div>
                  <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.5 }}>
                    Monetize your content and grow your audience
                  </div>
                </div>
              </button>
            </div>

            {onLoginClick && (
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <span style={{ fontSize: 14, color: '#6b7280' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={onLoginClick}
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
                    Sign in
                  </button>
                </span>
              </div>
            )}
          </div>
        ) : (
          <div>
            {selectedRole === 'brand' && (
              <BrandOnboardingForm
                role="brand"
                onSuccess={handleFormSuccess}
                onError={handleFormError}
                isModal={true}
              />
            )}
            {selectedRole === 'creator' && (
              <CreatorOnboardingForm
                role="creator"
                onSuccess={handleFormSuccess}
                onError={handleFormError}
                isModal={true}
              />
            )}
            {selectedRole && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  onClick={() => setSelectedRole(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    fontSize: 14,
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: 8,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.color = '#1f2937';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  ← Back to role selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full-page version
  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://newcollab.co/register" />
      </Helmet>
      <Container>
        <BackHomeButton type="button" onClick={() => navigate('/')}>
          ← Back Home
        </BackHomeButton>
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          key={selectedRole ? 'form' : 'role-selection'}
        >
          {!selectedRole ? (
            <SignupCard>
              <TitleStyled>Start your next collaboration</TitleStyled>
              <Subtitle>Whether you're a Brand or a Creator, grow your opportunities with us!</Subtitle>
              <RoleSelection role="radiogroup" aria-label="Select your role">
                <RoleCard
                  variants={roleCardVariants}
                  initial="rest"
                  whileHover="hover"
                  onClick={() => handleRoleChange('brand')}
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && handleRoleChange('brand')}
                  role="radio"
                  aria-checked={selectedRole === 'brand'}
                  aria-label="Select Brand role"
                >
                  <ShopOutlined style={{ fontSize: '32px', color: '#26A69A', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>Brand</h3>
                  <Text style={{ color: '#4b5563', fontSize: '14px' }}>
                    Find the best content for your brand
                  </Text>
                </RoleCard>
                <RoleCard
                  variants={roleCardVariants}
                  initial="rest"
                  whileHover="hover"
                  onClick={() => navigate('/register/creator')}
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && navigate('/register/creator')}
                  role="radio"
                  aria-checked={selectedRole === 'creator'}
                  aria-label="Select Creator role"
                >
                  <UserOutlined style={{ fontSize: '32px', color: '#26A69A', marginBottom: '16px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937' }}>Content creator</h3>
                  <Text style={{ color: '#4b5563', fontSize: '14px' }}>
                    Find the perfect partner for your next content
                  </Text>
                </RoleCard>
              </RoleSelection>
            </SignupCard>
          ) : (
            <FormContainer>
              {selectedRole === 'brand' && (
                <BrandOnboardingForm
                  role="brand"
                  onSuccess={handleFormSuccess}
                  onError={handleFormError}
                />
              )}
              {selectedRole === 'creator' && (
                <CreatorOnboardingForm
                  role="creator"
                  onSuccess={handleFormSuccess}
                  onError={handleFormError}
                />
              )}
              <motion.div variants={roleCardVariants} whileHover="hover" style={{ marginTop: '16px', textAlign: 'center' }}>
                <StyledButton
                  onClick={() => setSelectedRole(null)}
                  aria-label="Back to role selection"
                >
                  Back to Role Selection
                </StyledButton>
              </motion.div>
            </FormContainer>
          )}
        </motion.div>
      </Container>
    </>
  );
}

export default Signup;