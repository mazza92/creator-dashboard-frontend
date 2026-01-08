import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import PasswordStrengthBar from 'react-password-strength-bar';
import { LoadingOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet-async';

const GradientBg = styled.div`
  min-height: 100vh;
  width: 100%;
  background: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  
  @media (max-width: 768px) {
    align-items: flex-start;
    padding-top: 2rem;
    min-height: 100vh;
  }
  
  @media (max-width: 480px) {
    padding-top: 1rem;
    align-items: flex-start;
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  padding: 2rem 1rem;
  box-sizing: border-box;
  
  @media (max-width: 480px) {
    padding: 1rem 0.5rem;
    max-width: 100%;
    margin: 0;
  }
`;

const Card = styled.div`
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 2rem 1.5rem;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: stretch;
  border: 1px solid #E5E7EB;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
    border-radius: 8px;
    margin: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 1.25rem 0.75rem;
    border-radius: 6px;
    gap: 0.875rem;
    margin: 0 0.25rem;
    min-height: auto;
  }
`;
// eslint-disable-next-line no-unused-vars
const Logo = styled.img`
  width: 56px;
  height: 56px;
  margin-bottom: 8px;
`;
const Title = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  text-align: center;
  margin-bottom: 0.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const Subheading = styled.div`
  color: #6B7280;
  text-align: center;
  font-size: 1rem;
  margin-bottom: 1.5rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
`;
const StyledInput = styled.input`
  width: 100%;
  max-width: 100%;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  font-size: 16px; /* Prevent zoom on iOS */
  margin-bottom: 0.25rem;
  background: #FFFFFF;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.15s ease;
  box-sizing: border-box;
  -webkit-appearance: none; /* Remove default iOS styling */
  -moz-appearance: none;
  appearance: none;
  
  &:focus {
    border-color: #8B5CF6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  }
  
  &.error {
    border-color: #EF4444;
  }
  
  &.success {
    border-color: #10B981;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 0.875rem;
    font-size: 16px; /* Keep 16px to prevent zoom */
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0.625rem 0.75rem;
    font-size: 16px; /* Keep 16px to prevent zoom */
    border-radius: 6px;
  }
`;
const Label = styled.label`
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.375rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: block;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const Error = styled.div`
  color: #EF4444;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;
const TermsRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  margin-top: 0.5rem;
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    gap: 0.375rem;
  }
`;
const CTAButton = styled.button`
  width: 100%;
  background: #8B5CF6;
  color: #FFFFFF;
  font-weight: 600;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  padding: 0.875rem 0;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.15s ease;
  opacity: ${props => props.disabled ? 0.5 : 1};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: 48px;
  
  &:hover:not(:disabled) {
    background: #7C3AED;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    padding: 0.75rem 0;
    min-height: 44px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    border-radius: 6px;
    padding: 0.625rem 0;
    margin-top: 0.75rem;
    min-height: 40px;
  }
`;
// eslint-disable-next-line no-unused-vars
const UsernamePreview = styled.div`
  font-size: 0.97em;
  color: #6b7280;
  margin-bottom: 2px;
  font-family: 'Inter', 'Poppins', sans-serif;
`;
const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;
const ShowHide = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #8B5CF6;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  z-index: 2;
  border-radius: 4px;
  transition: background-color 0.15s ease;
  
  &:hover {
    background-color: rgba(139, 92, 246, 0.1);
  }
  
  @media (max-width: 480px) {
    right: 0.5rem;
    font-size: 0.75rem;
    padding: 0.2rem 0.4rem;
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
  z-index: 10;
  
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
    top: 0.5rem;
    left: 0.5rem;
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
    position: fixed;
  }
`;

const initialState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false,
};

export default function CreatorSignup() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  // eslint-disable-next-line no-unused-vars
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { trackSignUp, trackFormSubmission } = useAnalytics();

  // Check for PR list source parameter
  useEffect(() => {
    const source = searchParams.get('source');
    if (source === 'pr-list') {
      localStorage.setItem('pr_list_signup', 'true');
    }
  }, [searchParams]);

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Invalid email address.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    if (!form.terms) errs.terms = 'You must accept the terms.';
    return errs;
  };

  const allValid = Object.keys(validate()).length === 0;

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors(e => ({ ...e, [name]: undefined }));
    setSignupError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    setSignupError('');
    try {
      // Check if user came from PR list post
      const prListSignup = localStorage.getItem('pr_list_signup') === 'true';
      
      // Create account
      const formData = new FormData();
      formData.append('firstName', form.firstName.trim());
      formData.append('lastName', form.lastName.trim());
      formData.append('email', form.email.trim());
      formData.append('password', form.password);
      formData.append('role', 'creator');
      if (prListSignup) {
        formData.append('pr_list_signup', 'true');
      }
      const res = await apiClient.post('/register/creator/account', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Track new account creation
      trackSignUp('email', 'creator', {
        email: form.email.trim(),
        username: res.data?.username || null
      });
      trackFormSubmission('creator_signup', true);
      
      // If PR list signup, PDF will be sent automatically by backend
      // Clear the flag after successful signup
      if (prListSignup) {
        localStorage.removeItem('pr_list_signup');
        console.log('PR list signup detected - PDF will be sent by backend');
      }
      
      // Save account fields for onboarding (optional, if needed later)
      localStorage.setItem('onboarding_firstName', form.firstName.trim());
      localStorage.setItem('onboarding_lastName', form.lastName.trim());
      localStorage.setItem('onboarding_email', form.email.trim());
      localStorage.setItem('onboarding_password', form.password);
      // Redirect to verify email pending page
      let redirectUrl = res.data?.redirect_url || '/verify-email-pending';
      
      // Always extract just the pathname to avoid URL concatenation issues
      try {
        const urlObj = new URL(redirectUrl, window.location.origin);
        redirectUrl = urlObj.pathname + urlObj.search + urlObj.hash;
        console.log('🔄 Redirecting to:', redirectUrl);
      } catch (e) {
        console.log('🔄 Using fallback redirect:', redirectUrl);
      }
      
      navigate(redirectUrl);
    } catch (err) {
      setSignupError(err.response?.data?.error || 'Failed to create account.');
      trackFormSubmission('creator_signup', false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Sign Up as a Creator | Newcollab</title>
        <meta name="description" content="Create your Newcollab creator account in seconds. Start receiving brand bids and unlock your creator dashboard." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="canonical" href="https://newcollab.co/register/creator" />
        <meta property="og:title" content="Sign Up as a Creator | Newcollab" />
        <meta property="og:description" content="Create your Newcollab creator account in seconds. Start receiving brand bids and unlock your creator dashboard." />
        <meta property="og:url" content="https://newcollab.co/register/creator" />
        <meta property="og:image" content="https://newcollab.co/og-image.jpg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Newcollab" />
      </Helmet>
      <GradientBg>
        <BackHomeButton type="button" onClick={() => navigate('/')}>
          ← Back Home
        </BackHomeButton>
        <Container>
          <Card as="form" onSubmit={handleSubmit} autoComplete="off">
                         <Title>Start receiving bids <span style={{ background: 'none', WebkitBackgroundClip: 'initial', WebkitTextFillColor: 'initial', backgroundClip: 'initial' }}>💸</span></Title>
            <Subheading>Join Newcollab and unlock your creator profile in seconds</Subheading>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <InputWrapper>
                <StyledInput
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  disabled={loading}
                  inputMode="text"
                />
              </InputWrapper>
              {errors.firstName && <Error>{errors.firstName}</Error>}
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <InputWrapper>
                <StyledInput
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  disabled={loading}
                  inputMode="text"
                />
              </InputWrapper>
              {errors.lastName && <Error>{errors.lastName}</Error>}
            </div>
            <div>
              {/* Username field removed; now only asked in onboarding */}
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <InputWrapper>
                <StyledInput
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  inputMode="email"
                />
              </InputWrapper>
              {errors.email && <Error>{errors.email}</Error>}
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <InputWrapper>
                <StyledInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  style={{ marginBottom: 0 }}
                  inputMode="text"
                />
                <ShowHide type="button" tabIndex={-1} onClick={() => setShowPassword(s => !s)}>{showPassword ? 'Hide' : 'Show'}</ShowHide>
              </InputWrapper>
              <PasswordStrengthBar password={form.password} style={{ marginTop: 4, marginBottom: 2 }} />
              {errors.password && <Error>{errors.password}</Error>}
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <InputWrapper>
                <StyledInput
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                  style={{ marginBottom: 0 }}
                  inputMode="text"
                />
                <ShowHide type="button" tabIndex={-1} onClick={() => setShowConfirm(s => !s)}>{showConfirm ? 'Hide' : 'Show'}</ShowHide>
              </InputWrapper>
              {errors.confirmPassword && <Error>{errors.confirmPassword}</Error>}
            </div>
            <TermsRow>
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={form.terms}
                onChange={handleChange}
                disabled={loading}
                                 style={{ accentColor: '#8B5CF6', width: 18, height: 18 }}
              />
                             <label htmlFor="terms" style={{ cursor: 'pointer' }}>
                 I accept the <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: '#8B5CF6', textDecoration: 'underline' }}>Terms and Conditions</a>
               </label>
            </TermsRow>
            {errors.terms && <Error>{errors.terms}</Error>}
            {signupError && <Error>{signupError}</Error>}
            <CTAButton type="submit" disabled={!allValid || loading} style={{ position: 'relative' }}>
              {loading && (
                <LoadingOutlined spin style={{ position: 'absolute', left: 24, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#8B5CF6' }} />
              )}
              <span style={{ opacity: loading ? 0.5 : 1 }}>Create My Account</span>
            </CTAButton>
          </Card>
        </Container>
      </GradientBg>
    </>
  );
} 