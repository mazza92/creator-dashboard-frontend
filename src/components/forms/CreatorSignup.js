import React, { useState, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../../utils/api';
import { Helmet } from 'react-helmet-async';
import { auth, firebaseConfigured } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FaTiktok } from 'react-icons/fa6';

// ============================================================================
// V4 SIGNUP FLOW - Registration with first/last name, Google SSO
// ============================================================================

const colors = {
  rose: '#E11D48',
  black: '#0F0F0F',
  violet: '#7C3AED',
  green: '#059669',
  amber: '#D97706',
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
  max-width: 420px;
  margin: 0 auto 40px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 32px rgba(0,0,0,.07);

  @media (max-width: 480px) {
    padding: 28px 22px;
    border-radius: 18px;
    margin: 0 16px 32px;
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
  margin-bottom: 10px;
  color: ${colors.black};
  em { font-style: normal; color: ${colors.rose}; }
`;

const Subline = styled.p`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.6;
  margin-bottom: 22px;
`;

const Benefits = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 22px;
`;

const BenefitPill = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  background: #F5F5F5;
  border-radius: 20px;
  padding: 6px 11px;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.text2};
`;

const ProofRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: #F9F5FF;
  border: 1px solid #E9D5FF;
  border-radius: 12px;
  padding: 11px 14px;
  margin-bottom: 22px;
`;

const ProofAvatars = styled.div`
  display: flex;
`;

const ProofAv = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-right: -6px;
  font-size: 8.5px;
  font-weight: 800;
  display: grid;
  place-items: center;
  color: #fff;
  background: ${props => props.$bg || colors.rose};
`;

const ProofText = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #581C87;
  line-height: 1.35;
  margin-left: 9px;
  span { color: #7C3AED; font-weight: 700; }
`;

const GoogleBtn = styled.button`
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  border: 1.5px solid ${colors.border};
  background: #fff;
  color: ${colors.text};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s;
  font-family: 'Inter', sans-serif;

  &:hover { background: #fafafa; }
  &:active { transform: scale(0.98); }
`;

const OrBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: ${colors.text3};
  font-weight: 600;
  margin: 13px 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${colors.border};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 5px;
  color: ${colors.text};
`;

const InputWrap = styled.div`
  position: relative;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${colors.border};
  border-radius: 11px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: ${colors.text};
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;

  &:focus {
    border-color: ${colors.black};
    box-shadow: 0 0 0 3px rgba(15,15,15,.06);
  }
  &::placeholder { color: ${colors.text3}; }
`;

const InputSuffix = styled.span`
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 700;
  color: ${colors.text3};
  cursor: pointer;
  &:hover { color: ${colors.text}; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  padding: 13px 16px;
  border-radius: 12px;
  border: none;
  background: ${colors.black};
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.15s;
  font-family: 'Inter', sans-serif;
  margin-top: 8px;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) { background: #1a1a1a; }
  &:active:not(:disabled) { transform: scale(0.98); }
`;

const Terms = styled.p`
  font-size: 11.5px;
  color: ${colors.text3};
  text-align: center;
  margin-top: 13px;
  line-height: 1.55;
  a { color: ${colors.text2}; font-weight: 600; text-decoration: underline; }
`;

const AltLink = styled.p`
  font-size: 13px;
  color: ${colors.text2};
  font-weight: 500;
  text-align: center;
  margin-top: 18px;
  a { color: ${colors.rose}; font-weight: 700; text-decoration: none; }
`;

const NameRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 12px;
`;

const ErrorMsg = styled.div`
  color: ${colors.rose};
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

// Region blocked UI
const RegionBlockedCard = styled.div`
  background: #fff;
  border: 1px solid rgba(0,0,0,.07);
  border-radius: 22px;
  padding: 48px 36px;
  width: 100%;
  max-width: 420px;
  margin: 60px auto;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 8px 32px rgba(0,0,0,.07);
  text-align: center;

  @media (max-width: 480px) {
    padding: 36px 22px;
    margin: 40px 16px;
    width: auto;
  }
`;

const RegionIcon = styled.div`
  font-size: 56px;
  margin-bottom: 20px;
`;

const RegionTitle = styled.h2`
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
  color: ${colors.black};
`;

const RegionMessage = styled.p`
  font-size: 15px;
  color: ${colors.text2};
  line-height: 1.6;
  margin-bottom: 24px;
`;

const TikTokFollowBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  background: ${colors.black};
  text-decoration: none;
  padding: 14px 24px;
  border-radius: 12px;
  margin-bottom: 12px;
  transition: all 0.15s;
  box-sizing: border-box;

  &:hover {
    background: #222;
    transform: translateY(-1px);
  }

  svg {
    font-size: 18px;
  }
`;

const RegionNote = styled.div`
  font-size: 13px;
  color: ${colors.text3};
  padding: 16px;
  background: #F9F9F9;
  border-radius: 12px;
  margin-bottom: 20px;
  line-height: 1.5;
`;

const RegionBackLink = styled(Link)`
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text3};
  text-decoration: none;
  padding: 12px 24px;
  border: 1.5px solid ${colors.border};
  border-radius: 12px;
  transition: all 0.15s;

  &:hover {
    background: #F5F5F5;
    border-color: #ccc;
    color: ${colors.text2};
  }
`;

export default function CreatorSignup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [regionBlocked, setRegionBlocked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract signup context params from URL (blog widget, landing pages, etc.)
  const signupContext = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      ref: params.get('ref') || null,  // e.g. "blog_widget"
      brand: params.get('brand') || null,  // matched brand slug
      brand_query: params.get('brand_query') || null,  // unmatched brand search
      source_page: params.get('source_page') || null,  // blog post slug
      intent: params.get('intent') || null,  // e.g. "brand_specific"
    };
  }, [location.search]);

  const googleEnabled = Boolean(firebaseConfigured && auth);
  const isValid = firstName.trim().length > 0 && email.includes('@') && password.length >= 8;

  const doRedirect = (url) => {
    try {
      const urlObj = new URL(url, window.location.origin);
      navigate(urlObj.pathname + urlObj.search + urlObj.hash);
    } catch {
      navigate(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim()) { setError('First name is required'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }

    setLoading(true);
    try {
      const res = await apiClient.post('/register/creator/account', {
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        terms_accepted: true,
        // Signup context from URL params (blog widget, landing pages)
        ...(signupContext.ref && { signup_ref: signupContext.ref }),
        ...(signupContext.brand && { first_unlock_intent: signupContext.brand }),
        ...(signupContext.brand_query && { brand_query: signupContext.brand_query }),
        ...(signupContext.source_page && { signup_source_page: signupContext.source_page }),
        ...(signupContext.intent && { signup_intent: signupContext.intent }),
      }, { headers: { 'Content-Type': 'application/json' } });

      // Track signup completion in TikTok pixel with user data for better EMQ
      // TikTok standard event requires exact format: 'Complete Registration' (with space)
      if (window.ttq) {
        // Identify user with email and external_id for better event matching
        window.ttq.identify({
          email: email.trim().toLowerCase(),
          external_id: res.data?.user_id || email.trim().toLowerCase()
        });
        window.ttq.track('Complete Registration');
      }

      doRedirect(res.data?.redirect_url || '/verify-email-pending');
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong';
      // Check for region restriction (403 with "region" in message)
      if (err.response?.status === 403 && (msg.toLowerCase().includes('region') || msg.toLowerCase().includes('restricted'))) {
        setRegionBlocked(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSSO = async () => {
    if (!googleEnabled) {
      setError('Google sign-in is unavailable. Please use email.');
      return;
    }
    setGoogleLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await apiClient.post('/google-signup', {
        idToken,
        email: result.user.email,
        name: result.user.displayName,
        // Signup context from URL params (blog widget, landing pages)
        ...(signupContext.ref && { signup_ref: signupContext.ref }),
        ...(signupContext.brand && { first_unlock_intent: signupContext.brand }),
        ...(signupContext.brand_query && { brand_query: signupContext.brand_query }),
        ...(signupContext.source_page && { signup_source_page: signupContext.source_page }),
        ...(signupContext.intent && { signup_intent: signupContext.intent }),
      });

      // Track signup completion in TikTok pixel (only for new accounts) with user data for better EMQ
      if (window.ttq && response.data?.needs_onboarding) {
        // Identify user with email and external_id for better event matching
        window.ttq.identify({
          email: result.user.email,
          external_id: response.data?.user_id || result.user.email
        });
        window.ttq.track('Complete Registration');
      }

      const redirectUrl = response.data?.redirect_url ||
        (response.data?.needs_onboarding ? '/onboarding' : '/creator/dashboard/for-you');
      doRedirect(redirectUrl);
    } catch (err) {
      // Handle user-cancelled popup - not an error, just ignore silently
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setGoogleLoading(false);
        return;
      }

      const msg = err.response?.data?.error || err.message || 'Google sign-in failed';
      // Check for region restriction (403 with "region" in message)
      if (err.response?.status === 403 && (msg.toLowerCase().includes('region') || msg.toLowerCase().includes('restricted'))) {
        setRegionBlocked(true);
      } else if (err.response?.status === 404 && msg.includes('register')) {
        setError('No account found. Please sign up with email first.');
      } else {
        setError(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Show region blocked screen
  if (regionBlocked) {
    return (
      <>
        <Helmet>
          <title>Not Available in Your Region | NewCollab</title>
        </Helmet>
        <PageWrapper>
          <TopBar>
            <LogoLink to="/">
              <LogoImg src="/newcollab-logo-dark.png" alt="newcollab" />
            </LogoLink>
          </TopBar>
          <RegionBlockedCard>
            <RegionIcon>🌍</RegionIcon>
            <RegionTitle>newcollab isn't available in your region yet</RegionTitle>
            <RegionMessage>
              We're currently focused on serving creators in the US, UK, Canada, Australia, New Zealand, and Europe.
              Follow us on TikTok to be the first to know when we expand to your region!
            </RegionMessage>
            <TikTokFollowBtn
              href="https://www.tiktok.com/@newcollabco"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTiktok /> Follow @newcollabco
            </TikTokFollowBtn>
            <RegionNote>
              If you believe this is an error, try connecting from a different network
              or contact us at team@newcollab.co
            </RegionNote>
            <RegionBackLink to="/">← Back to Home</RegionBackLink>
          </RegionBlockedCard>
        </PageWrapper>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sign Up | NewCollab - Get Brand Deals</title>
        <meta name="description" content="Join NewCollab free. Find brands, write the perfect pitch, and track your outreach. 2,000+ brand contacts, AI pitch writer, and more." />
        <link rel="canonical" href="https://newcollab.co/register/creator" />
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

        <Card as="form" onSubmit={handleSubmit}>
          <Eyebrow>
            <EyebrowDot />
            Free to start · No credit card
          </Eyebrow>

          <Headline>
            The tool that gets<br />you <em>brand deals.</em>
          </Headline>

          <Subline>
            You know how to create content. We handle everything else: finding brands,
            writing the perfect pitch, tracking your outreach, reminding you to follow up.
          </Subline>

          <Benefits>
            <BenefitPill>2,000+ brand contacts</BenefitPill>
            <BenefitPill>AI pitch writer</BenefitPill>
            <BenefitPill>Track all outreach</BenefitPill>
            <BenefitPill>New brand alerts</BenefitPill>
          </Benefits>

          <ProofRow>
            <ProofAvatars>
              <ProofAv $bg={colors.rose}>C</ProofAv>
              <ProofAv $bg={colors.violet}>M</ProofAv>
              <ProofAv $bg={colors.green}>Z</ProofAv>
              <ProofAv $bg={colors.amber}>A</ProofAv>
            </ProofAvatars>
            <ProofText>
              <span>carolstyle</span> landed Rhode Skin 3 days after joining.
              <br />900+ creators are already pitching brands.
            </ProofText>
          </ProofRow>

          <GoogleBtn type="button" onClick={handleGoogleSSO} disabled={googleLoading || loading}>
            {googleLoading ? 'Signing in...' : (
              <>
                <svg width="17" height="17" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </GoogleBtn>

          <OrBar>or</OrBar>

          <NameRow>
            <div>
              <FormLabel>First name</FormLabel>
              <FormInput
                type="text"
                placeholder="Alex"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setError(''); }}
                disabled={loading}
                autoComplete="given-name"
              />
            </div>
            <div>
              <FormLabel>Last name</FormLabel>
              <FormInput
                type="text"
                placeholder="Johnson"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setError(''); }}
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </NameRow>

          <FormGroup>
            <FormLabel>Email address</FormLabel>
            <FormInput
              type="email"
              placeholder="you@gmail.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
              autoComplete="email"
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Password</FormLabel>
            <InputWrap>
              <FormInput
                type={showPw ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                disabled={loading}
                autoComplete="new-password"
              />
              <InputSuffix onClick={() => setShowPw(!showPw)}>
                {showPw ? 'Hide' : 'Show'}
              </InputSuffix>
            </InputWrap>
          </FormGroup>

          {error && <ErrorMsg>{error}</ErrorMsg>}

          <SubmitBtn type="submit" disabled={!isValid || loading || googleLoading}>
            {loading ? 'Creating account...' : 'Create my free account →'}
          </SubmitBtn>

          <Terms>
            By signing up you agree to our{' '}
            <Link to="/terms-of-service">Terms</Link> and{' '}
            <Link to="/privacy-policy">Privacy Policy</Link>.
          </Terms>

          <AltLink>
            Already a member? <Link to="/login">Sign in</Link>
          </AltLink>
        </Card>
      </PageWrapper>
    </>
  );
}
