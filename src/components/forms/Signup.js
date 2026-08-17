import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { message } from 'antd';
import { UserContext } from '../../contexts/UserContext';
import BrandOnboardingForm from './BrandOnboardingForm';
import CreatorOnboardingForm from './CreatorOnboardingForm';
import styled from 'styled-components';
import { ShopOutlined, UserOutlined } from '@ant-design/icons';
import './Signup.css';
import { Helmet } from 'react-helmet-async';

// ============================================================================
// V4 SIGNUP FLOW - Role chooser matching the CreatorSignup design language.
// Creator -> /register/creator | Brand -> /for-brands
// ============================================================================

const colors = {
  rose: '#E11D48',
  black: '#0F0F0F',
  violet: '#7C3AED',
  border: '#EBEBEB',
  text: '#0F0F0F',
  text2: '#5A5A5A',
  text3: '#A0A0A0',
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 15% 10%, rgba(225,29,72,.10) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 90%, rgba(124,58,237,.08) 0%, transparent 45%),
    radial-gradient(ellipse at 75% 5%, rgba(251,146,60,.08) 0%, transparent 40%),
    #FBF8F6;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', sans-serif;
`;

const TopBar = styled.div`
  width: 100%;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 24px;
  width: auto;
  display: block;
`;

const TopBarLink = styled.span`
  font-size: 13px;
  color: ${colors.text2};
  font-weight: 500;
  a { color: ${colors.rose}; font-weight: 700; text-decoration: none; }
`;

const Card = styled.div`
  background: #fff;
  border: 1px solid rgba(0,0,0,.07);
  border-radius: 22px;
  padding: 38px 36px;
  width: 100%;
  max-width: 440px;
  margin: 24px auto 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 32px rgba(0,0,0,.07);
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 28px 22px;
    border-radius: 18px;
    margin: 12px 16px 32px;
    width: auto;
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  color: ${colors.rose};
  margin-bottom: 12px;
  letter-spacing: 0.2px;
`;

const EyebrowDot = styled.div`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${colors.rose};
`;

const Headline = styled.h1`
  font-size: 26px;
  font-weight: 900;
  letter-spacing: -0.7px;
  line-height: 1.18;
  margin: 0 0 10px;
  color: ${colors.black};
  em { font-style: normal; color: ${colors.rose}; }
`;

const Subline = styled.p`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.6;
  margin: 0 0 22px;
`;

const RoleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RoleOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  background: #fff;
  border: 1.5px solid ${colors.border};
  border-radius: 14px;
  padding: 18px 18px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.15s;
  box-sizing: border-box;

  &:hover {
    border-color: ${props => props.$accent || colors.rose};
    box-shadow: 0 4px 16px rgba(0,0,0,.06);
    transform: translateY(-1px);
  }
  &:active { transform: scale(0.99); }
`;

const RoleIconWrap = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 20px;
  color: ${props => props.$accent || colors.rose};
  background: ${props => props.$bg || 'rgba(225,29,72,.08)'};
`;

const RoleBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const RoleTag = styled.div`
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: ${props => props.$accent || colors.rose};
  margin-bottom: 3px;
`;

const RoleTitle = styled.div`
  font-size: 15.5px;
  font-weight: 800;
  color: ${colors.black};
  letter-spacing: -0.2px;
  margin-bottom: 3px;
`;

const RoleDesc = styled.div`
  font-size: 12.5px;
  color: ${colors.text2};
  line-height: 1.45;
`;

const RoleArrow = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${colors.text3};
  flex-shrink: 0;
`;

const AltLink = styled.p`
  font-size: 13px;
  color: ${colors.text2};
  font-weight: 500;
  text-align: center;
  margin: 18px 0 0;
  a { color: ${colors.rose}; font-weight: 700; text-decoration: none; }
`;

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
                onClick={() => navigate('/register/creator')}
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

  // Full-page version — role chooser in the V4 signup design.
  // Creators continue to /register/creator; brands go to the /for-brands flow.
  return (
    <>
      <Helmet>
        <title>Sign Up | NewCollab</title>
        <link rel="canonical" href="https://newcollab.co/register" />
      </Helmet>
      <PageWrapper>
        <TopBar>
          <LogoLink to="/">
            <LogoImg src="/newcollab-logo-dark.png" alt="newcollab" />
          </LogoLink>
          <TopBarLink>
            Already a member? <Link to="/login">Sign in</Link>
          </TopBarLink>
        </TopBar>

        <Card>
          <Eyebrow>
            <EyebrowDot />
            Free to join · No credit card
          </Eyebrow>

          <Headline>
            Start your next <em>collaboration.</em>
          </Headline>

          <Subline>
            Tell us who you are and we'll take you to the right place.
          </Subline>

          <RoleList>
            <RoleOption
              type="button"
              $accent={colors.rose}
              onClick={() => navigate('/register/creator')}
              aria-label="Sign up as a content creator"
            >
              <RoleIconWrap $accent={colors.rose} $bg="rgba(225,29,72,.08)">
                <UserOutlined />
              </RoleIconWrap>
              <RoleBody>
                <RoleTag $accent={colors.rose}>For creators</RoleTag>
                <RoleTitle>Content creator</RoleTitle>
                <RoleDesc>Find brands, pitch with AI, and land PR packages and paid deals.</RoleDesc>
              </RoleBody>
              <RoleArrow>→</RoleArrow>
            </RoleOption>

            <RoleOption
              type="button"
              $accent={colors.violet}
              onClick={() => navigate('/for-brands')}
              aria-label="Get started as a brand"
            >
              <RoleIconWrap $accent={colors.violet} $bg="rgba(124,58,237,.08)">
                <ShopOutlined />
              </RoleIconWrap>
              <RoleBody>
                <RoleTag $accent={colors.violet}>For brands</RoleTag>
                <RoleTitle>Brand</RoleTitle>
                <RoleDesc>Get discovered by micro-creators actively looking for brands like yours.</RoleDesc>
              </RoleBody>
              <RoleArrow>→</RoleArrow>
            </RoleOption>
          </RoleList>

          <AltLink>
            Already a member? <Link to="/login">Sign in</Link>
          </AltLink>
        </Card>
      </PageWrapper>
    </>
  );
}

export default Signup;