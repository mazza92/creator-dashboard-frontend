import React, { useState, useContext } from 'react';
import { Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { auth, firebaseConfigured } from './firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { apiClient } from '../config/api';

// V5 design tokens — kept consistent with About / Landing pages
const colors = {
  rose: '#E11D48',
  roseLight: '#FFF1F3',
  black: '#0F0F0F',
  black2: '#1a1a1a',
  violet: '#7C3AED',
  violetLight: '#F5F3FF',
  bg: '#FAFAF9',
  surface: '#FFFFFF',
  border: '#EBEBEB',
  text: '#0F0F0F',
  text2: '#4A4A4A',
  text3: '#8A8A8A',
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ── Full-page wrapper ──────────────────────────────────────
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background:
    radial-gradient(ellipse at 5% 0%, rgba(225, 29, 72, 0.08) 0%, transparent 55%),
    radial-gradient(ellipse at 95% 100%, rgba(124, 58, 237, 0.07) 0%, transparent 50%),
    ${colors.bg};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 24px;
  position: relative;
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;

  @media (max-width: 480px) {
    padding: 16px;
    align-items: flex-start;
    padding-top: 40px;
  }
`;

const LoginCard = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04), 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 40px;
  width: 100%;
  max-width: 420px;
  z-index: 2;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 28px 24px;
    max-width: 100%;
    border-radius: 16px;
  }

  @media (max-width: 480px) {
    padding: 24px 20px;
    border-radius: 16px;
  }
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
`;

const BrandLogo = styled.img`
  height: 28px;
  width: auto;
  display: block;
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${colors.rose};
  margin-bottom: 8px;

  &::before {
    content: '';
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: ${colors.rose};
  }
`;

const TitleH1 = styled.h1`
  font-size: 28px;
  font-weight: 900;
  color: ${colors.text};
  letter-spacing: -0.8px;
  line-height: 1.1;
  margin: 0 0 8px 0;
  word-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.5;
  margin: 0 0 28px 0;
  word-wrap: break-word;

  @media (max-width: 480px) {
    font-size: 13px;
    margin: 0 0 24px 0;
  }
`;

const HeaderBlock = styled.div`
  text-align: center;
`;

// ── Form ───────────────────────────────────────────────────
const StyledInput = styled(Input)`
  border-radius: 12px;
  padding: 12px 16px;
  border: 1.5px solid ${colors.border};
  font-size: 15px;
  font-family: inherit;
  background: #fff;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${colors.text3};
  }

  &:focus,
  &.ant-input-focused,
  &:focus-within {
    border-color: ${colors.black};
    box-shadow: 0 0 0 3px rgba(15, 15, 15, 0.08);
  }

  .ant-input-prefix {
    color: ${colors.text3};
    margin-right: 10px;
  }

  .ant-input {
    font-family: inherit;
    font-size: 15px;
  }
`;

const StyledPasswordInput = styled(Input.Password)`
  border-radius: 12px;
  padding: 12px 16px;
  border: 1.5px solid ${colors.border};
  font-size: 15px;
  font-family: inherit;
  background: #fff;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${colors.text3};
  }

  &:focus,
  &.ant-input-affix-wrapper-focused,
  &:focus-within {
    border-color: ${colors.black};
    box-shadow: 0 0 0 3px rgba(15, 15, 15, 0.08);
  }

  .ant-input-prefix {
    color: ${colors.text3};
    margin-right: 10px;
  }

  .ant-input {
    font-family: inherit;
    font-size: 15px;
  }
`;

const StyledLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 6px;
`;

const PrimaryButton = styled.button`
  width: 100%;
  padding: 13px 22px;
  background: ${colors.black};
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    background: ${colors.black2};
  }

  &:disabled {
    background: ${colors.text3};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 12px 22px;
  background: #fff;
  color: ${colors.text};
  border: 1.5px solid ${colors.border};
  border-radius: 12px;
  font-size: 14.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${colors.text3};
    background: ${colors.bg};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: ${colors.text3};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${colors.border};
  }
`;

const LinkText = styled(Link)`
  color: ${colors.text};
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: ${colors.border};
  transition: all 0.15s;

  &:hover {
    color: ${colors.rose};
    text-decoration-color: ${colors.rose};
  }
`;

const ErrorBanner = styled.div`
  background: ${colors.roseLight};
  color: #9F1239;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13.5px;
  line-height: 1.5;
  margin-bottom: 20px;
  border: 1px solid #FECDD3;
  animation: ${fadeIn} 0.25s ease;
`;

const FirebaseWarning = styled.div`
  margin: 14px 0 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  color: #9A3412;
  font-size: 12.5px;
  line-height: 1.5;
`;

const FootRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  font-size: 13.5px;
  color: ${colors.text2};

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-size: 13px;
  }
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  padding: 0;
  font-size: inherit;
  font-family: inherit;
  font-weight: 600;
  color: ${colors.text};
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-color: ${colors.border};
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    color: ${colors.rose};
    text-decoration-color: ${colors.rose};
  }
`;

const BackHomeRow = styled.div`
  text-align: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${colors.border};
  font-size: 13px;
  color: ${colors.text3};
`;

// ── Google G logo (multi-color, official-looking) ──────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.94l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.07.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════
function Login({ onSuccess, showSignupLink, onSignupClick, isModal = false }) {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [form] = Form.useForm();

  const googleLoginEnabled = Boolean(firebaseConfigured && auth);

  const handleLogin = async (values) => {
    const { email, password } = values;
    setLoading(true);
    setError('');

    try {
      console.log('🟢 Attempting login for:', email);
      const response = await apiClient.post('/login', { email, password });
      const data = response.data;

      console.log('🟢 Login Response:', data);

      if (
        data.message &&
        (data.message.includes('Login successful') || data.profile_incomplete)
      ) {
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userRole', data.user_role);
        setUser({
          id: data.user_id,
          role: data.user_role,
          creator_id: data.creator_id,
          brand_id: data.brand_id,
        });

        if (data.profile_incomplete) {
          console.log('🔄 User has incomplete profile, redirecting to onboarding');
          message.info("Welcome back! Let's complete your profile setup.");
        }

        console.log('✅ Login successful, redirecting to:', data.redirect_url);

        if (onSuccess) {
          onSuccess();
          return;
        }

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
    } catch (err) {
      console.error('❌ Login error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!googleLoginEnabled) {
      message.error('Google Sign-In is unavailable (missing Firebase configuration).');
      return;
    }
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

      const redirectUrl =
        data.redirect_url ||
        (data.user_role === 'creator'
          ? '/creator/dashboard/for-you'
          : '/brand/dashboard/overview');
      console.log('🔄 Navigating to:', redirectUrl);
      navigate(redirectUrl, { replace: true });
    } catch (err) {
      console.error('❌ Google Sign-In error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Google Sign-In failed. Please try again.';
      if (
        err.response?.status === 404 &&
        errorMessage.includes('Please register first')
      ) {
        message.info('No account available. Redirecting to registration.');
        navigate('/register/creator', {
          state: { email: err.response?.data?.email || '' },
        });
      } else {
        message.error(errorMessage);
      }
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  // Shared inner form markup used by both modal and full-page versions
  const renderFormBody = () => (
    <>
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <Form
        form={form}
        name="login_form"
        onFinish={handleLogin}
        layout="vertical"
        requiredMark={false}
      >
        <Form.Item
          name="email"
          label={<StyledLabel htmlFor="login-email">Email</StyledLabel>}
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
          style={{ marginBottom: 16 }}
        >
          <StyledInput
            id="login-email"
            prefix={<UserOutlined />}
            placeholder="you@email.com"
            autoComplete="email"
            aria-label="Email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label={<StyledLabel htmlFor="login-password">Password</StyledLabel>}
          rules={[{ required: true, message: 'Please enter your password' }]}
          style={{ marginBottom: 20 }}
        >
          <StyledPasswordInput
            id="login-password"
            prefix={<LockOutlined />}
            placeholder="Enter your password"
            autoComplete="current-password"
            aria-label="Password"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <PrimaryButton
            type="submit"
            disabled={loading || googleLoading}
            aria-label="Sign in"
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </PrimaryButton>
        </Form.Item>
      </Form>

      <Divider>or</Divider>

      <GoogleButton
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading || googleLoading || !googleLoginEnabled}
        aria-label="Sign in with Google"
      >
        <GoogleIcon />
        {googleLoading ? 'Processing…' : 'Continue with Google'}
      </GoogleButton>

      {!googleLoginEnabled && (
        <FirebaseWarning>
          Google Sign-In is disabled because Firebase env vars are missing.
        </FirebaseWarning>
      )}
    </>
  );

  // ── Modal version (used in marketplace flow) ─────────────
  if (isModal) {
    return (
      <div style={{ width: '100%', fontFamily: "'Inter', -apple-system, sans-serif" }}>
        <HeaderBlock style={{ marginBottom: 24 }}>
          <TitleH1 style={{ fontSize: 24 }}>Welcome back</TitleH1>
          <Subtitle style={{ marginBottom: 0 }}>
            Log in to continue with your PR package proposal.
          </Subtitle>
        </HeaderBlock>

        {renderFormBody()}

        {showSignupLink && (
          <FootRow style={{ justifyContent: 'center' }}>
            <span>
              Don&apos;t have an account?{' '}
              {onSignupClick ? (
                <TextBtn type="button" onClick={onSignupClick}>
                  Sign up
                </TextBtn>
              ) : (
                <LinkText to="/register/creator">Sign up</LinkText>
              )}
            </span>
          </FootRow>
        )}

        <FootRow style={{ justifyContent: 'center', marginTop: 12 }}>
          <TextBtn type="button" onClick={() => navigate('/forgot-password')}>
            Forgot password?
          </TextBtn>
        </FootRow>
      </div>
    );
  }

  // ── Full-page version (/login route) ─────────────────────
  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <LoginCard>
          <Brand>
            <Link to="/" aria-label="newcollab home">
              <BrandLogo
                src="/newcollab-logo-dark.png"
                alt="newcollab"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Link>
          </Brand>

          <HeaderBlock>
            <Eyebrow>Sign in</Eyebrow>
            <TitleH1>Welcome back.</TitleH1>
            <Subtitle>
              Log in to keep pitching brands and tracking your PR pipeline.
            </Subtitle>
          </HeaderBlock>

          {renderFormBody()}

          <FootRow>
            <TextBtn type="button" onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </TextBtn>
            <span>
              New here?{' '}
              <LinkText to="/register/creator">Create account</LinkText>
            </span>
          </FootRow>

          <BackHomeRow>
            <LinkText to="/">← Back to home</LinkText>
          </BackHomeRow>
        </LoginCard>
      </motion.div>
    </Container>
  );
}

export default Login;
