import React, { useState, useMemo, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { apiClient } from '../../utils/api';
import { UserContext, persistLoggedInUser } from '../../contexts/UserContext';
import { Helmet } from 'react-helmet-async';
import { auth, firebaseConfigured } from '../firebase';
import {
  inAppBrowserName,
  inAppGoogleMessage,
  openInSystemBrowserUrl,
  googleSignInErrorMessage,
  startGoogleSignIn,
  consumeGoogleRedirectResult,
  googleRedirectPending,
  isIgnorableGoogleCancel,
  isRegionBlockedError,
  reportGoogleStep,
} from '../../utils/googleSignIn';
import { FaTiktok } from 'react-icons/fa6';
import { validateSignupField, MIN_PASSWORD } from '../../utils/signupValidation';

// ============================================================================
// CREATOR SIGNUP - one promise, Google first, three fields. Everything else
// (country, handle, niche) is asked in short steps at /onboarding.
// ============================================================================

// Promote Newcollab: QueryParamRedirect saves ?promo= on any page, so the code survives a click to signup.
const readPromo = () => {
  try { return localStorage.getItem('nc_promo') || null; } catch { return null; }
};

// Link offers (?ref=polly_trial7): QueryParamRedirect strips ref from the URL but keeps the offer here.
const readOffer = () => {
  try { return localStorage.getItem('nc_offer') || null; } catch { return null; }
};

const colors = {
  rose: '#E11D48',
  roseDark: '#BE123C',
  black: '#0F0F0F',
  violet: '#7C3AED',
  green: '#059669',
  amber: '#D97706',
  border: '#E6E3E0',
  text: '#0F0F0F',
  text2: '#55524F',
  text3: '#9A9693',
  cream: '#FBF8F6',
};

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${colors.cream};
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: ${colors.text};
`;

const TopBar = styled.div`
  width: 100%;
  max-width: 1120px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 14px 16px;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 24px;
  width: auto;
  display: block;
`;

const TopBarLink = styled.span`
  font-size: 13.5px;
  color: ${colors.text2};
  font-weight: 500;
  a { color: ${colors.text}; font-weight: 700; text-decoration: none; margin-left: 4px; }
  a:hover { text-decoration: underline; }
`;

const Shell = styled.main`
  width: 100%;
  max-width: 1120px;
  box-sizing: border-box;
  padding: 12px 24px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 440px);
  grid-template-areas: 'pitch form' 'proof form';
  grid-template-rows: auto 1fr;
  column-gap: 64px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'pitch' 'form' 'proof';
    grid-template-rows: auto;
    max-width: 480px;
    padding: 4px 16px 40px;
    row-gap: 18px;
  }
`;

const Pitch = styled.section`
  grid-area: pitch;
  padding-top: 40px;

  @media (max-width: 960px) {
    padding-top: 6px;
  }
`;

const Eyebrow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  color: ${colors.roseDark};
  background: rgba(225,29,72,.08);
  border-radius: 999px;
  padding: 6px 11px;
  margin-bottom: 18px;
  letter-spacing: .1px;

  @media (max-width: 960px) {
    margin-bottom: 12px;
    font-size: 11.5px;
  }
`;

const Headline = styled.h1`
  font-size: 50px;
  font-weight: 800;
  letter-spacing: -1.8px;
  line-height: 1.04;
  margin: 0 0 16px;
  color: ${colors.black};
  em {
    font-family: 'Instrument Serif', Georgia, serif;
    font-style: italic;
    font-weight: 400;
    letter-spacing: -0.5px;
    color: ${colors.rose};
  }

  @media (max-width: 960px) {
    font-size: 31px;
    letter-spacing: -1px;
    line-height: 1.1;
    margin-bottom: 10px;
  }
`;

const Subline = styled.p`
  font-size: 17px;
  color: ${colors.text2};
  line-height: 1.55;
  margin: 0 0 30px;
  max-width: 520px;

  @media (max-width: 960px) {
    font-size: 15px;
    margin: 0;
  }
`;

const Benefits = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 14px;
  max-width: 520px;

  @media (max-width: 960px) {
    display: none;
  }
`;

const MobileBenefits = styled(Benefits)`
  display: none;
  @media (max-width: 960px) {
    display: grid;
    gap: 12px;
  }
`;

const Benefit = styled.li`
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 14px;
  align-items: start;
  strong { display: block; font-size: 15.5px; font-weight: 700; margin-bottom: 2px; color: ${colors.black}; }
  span { font-size: 14px; color: ${colors.text2}; line-height: 1.5; }
`;

const BenefitIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-size: 19px;
  background: ${(p) => p.$bg};
`;

const ProBadge = styled.em`
  font-style: normal;
  font-size: 10.5px;
  font-weight: 800;
  color: ${colors.violet};
  background: rgba(124,58,237,.1);
  border-radius: 6px;
  padding: 2px 6px;
  margin-left: 6px;
  vertical-align: 2px;
`;

const Proof = styled.section`
  grid-area: proof;
  margin-top: 30px;
  max-width: 520px;

  @media (max-width: 960px) {
    margin-top: 6px;
    display: grid;
    gap: 18px;
  }
`;

const ProofCard = styled.figure`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border: 1px solid rgba(0,0,0,.06);
  border-radius: 16px;
  padding: 14px 16px;
  box-shadow: 0 1px 2px rgba(0,0,0,.03);
`;

const ProofAvatars = styled.div`
  display: flex;
  flex-shrink: 0;
`;

const ProofAv = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-right: -9px;
  font-size: 11px;
  font-weight: 800;
  display: grid;
  place-items: center;
  color: #fff;
  background: ${(props) => props.$bg || colors.rose};
`;

const ProofText = styled.figcaption`
  font-size: 13.5px;
  color: ${colors.text2};
  line-height: 1.45;
  margin-left: 8px;
  b { color: ${colors.black}; font-weight: 700; }
`;

const Card = styled.form`
  grid-area: form;
  background: #fff;
  border: 1px solid rgba(0,0,0,.07);
  border-radius: 22px;
  padding: 34px 32px 28px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04), 0 18px 48px rgba(15,15,15,.08);
  box-sizing: border-box;
  width: 100%;

  @media (max-width: 960px) {
    padding: 22px 18px 20px;
    border-radius: 18px;
  }
`;

const CardTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
  margin: 0 0 4px;

  @media (max-width: 960px) {
    font-size: 19px;
  }
`;

const CardSub = styled.p`
  font-size: 13.5px;
  color: ${colors.text2};
  margin: 0 0 20px;

  @media (max-width: 960px) {
    margin-bottom: 16px;
  }
`;

const GoogleBtn = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: 1.5px solid ${colors.border};
  background: #fff;
  color: ${colors.text};
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: background .15s, border-color .15s, transform .1s;
  font-family: inherit;

  &:hover:not(:disabled) { background: #FAF8F7; border-color: #D6D2CE; }
  &:active:not(:disabled) { transform: scale(0.99); }
  &:disabled { opacity: .65; cursor: default; }
  &:focus-visible { outline: 3px solid rgba(15,15,15,.2); outline-offset: 2px; }
`;

const OrBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: ${colors.text3};
  font-weight: 600;
  margin: 18px 0;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${colors.border};
  }
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 6px;
  color: ${colors.text};
`;

const InputWrap = styled.div`
  position: relative;
`;

const FormInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 0 ${(p) => (p.$withToggle ? '64px' : '14px')} 0 14px;
  border: 1.5px solid ${(p) => (p.$invalid ? colors.roseDark : colors.border)};
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  color: ${colors.text};
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;

  &:focus {
    border-color: ${(p) => (p.$invalid ? colors.roseDark : colors.black)};
    box-shadow: 0 0 0 3px ${(p) => (p.$invalid ? 'rgba(190,18,60,.12)' : 'rgba(15,15,15,.07)')};
  }
  &::placeholder { color: ${colors.text3}; }
  &:disabled { background: #FAFAFA; }
`;

const ToggleBtn = styled.button`
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  height: 36px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  color: ${colors.text2};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  &:hover { background: #F5F2F0; color: ${colors.text}; }
  &:focus-visible { outline: 2px solid ${colors.black}; }
`;

const FieldMsg = styled.div`
  font-size: 12.5px;
  margin-top: 6px;
  min-height: 0;
  color: ${(p) => (p.$error ? colors.roseDark : colors.text3)};
  font-weight: ${(p) => (p.$error ? 600 : 500)};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Banner = styled.div`
  background: #FFF1F2;
  border: 1px solid #FECDD3;
  color: #9F1239;
  border-radius: 12px;
  padding: 11px 13px;
  font-size: 13.5px;
  line-height: 1.45;
  margin: 4px 0 12px;
  a { color: #9F1239; font-weight: 700; }
`;

const SubmitBtn = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 12px;
  border: none;
  background: ${colors.black};
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background .15s, transform .1s;
  font-family: inherit;
  margin-top: 6px;

  &:hover:not(:disabled) { background: #26231F; }
  &:active:not(:disabled) { transform: scale(0.99); }
  &:disabled { opacity: .6; cursor: default; }
  &:focus-visible { outline: 3px solid rgba(225,29,72,.35); outline-offset: 2px; }
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: #fff;
  animation: ncspin .7s linear infinite;
  @keyframes ncspin { to { transform: rotate(360deg); } }
`;

const Terms = styled.p`
  font-size: 12px;
  color: ${colors.text3};
  text-align: center;
  margin: 14px 0 0;
  line-height: 1.55;
  a { color: ${colors.text2}; font-weight: 600; text-decoration: underline; }
`;

const Reassure = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #F1EEEC;
  font-size: 12.5px;
  color: ${colors.text2};
  font-weight: 600;
  span::before { content: '✓'; color: ${colors.green}; font-weight: 800; margin-right: 5px; }
`;

const ErrorMsg = styled.div`
  color: ${colors.roseDark};
  font-size: 12.5px;
  margin-top: 8px;
  text-align: center;
  font-weight: 600;
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

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.08 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-3.59-13.46-8.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const EyeIcon = ({ off }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);

const BENEFITS = [
  { icon: '🎁', bg: 'rgba(225,29,72,.09)', title: 'Brands that send PR packages', body: '2,000+ brands that gift creators, with the right contact and how to apply.' },
  { icon: '💸', bg: 'rgba(5,150,105,.10)', title: 'Paid UGC briefs', body: 'Open briefs from brands paying for UGC videos in your niche.' },
  { icon: '✨', bg: 'rgba(124,58,237,.10)', title: 'Polly pitches for you', pro: true, body: 'Your AI assistant finds brands, writes the pitch and follows up.' },
];

const BenefitList = ({ as: Wrap }) => (
  <Wrap>
    {BENEFITS.map((b) => (
      <Benefit key={b.title}>
        <BenefitIcon $bg={b.bg} aria-hidden="true">{b.icon}</BenefitIcon>
        <div>
          <strong>{b.title}{b.pro && <ProBadge>PRO</ProBadge>}</strong>
          <span>{b.body}</span>
        </div>
      </Benefit>
    ))}
  </Wrap>
);

export default function CreatorSignup() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');
  const [regionBlocked, setRegionBlocked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(UserContext);
  const refs = { firstName: useRef(null), email: useRef(null), password: useRef(null) };

  // Extract signup context params from URL (blog widget, landing pages, etc.)
  const signupContext = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      ref: params.get('ref') || readOffer(),  // e.g. "blog_widget", or a kept offer like "polly_trial7"
      brand: params.get('brand') || null,  // matched brand slug
      brand_query: params.get('brand_query') || null,  // unmatched brand search
      source_page: params.get('source_page') || null,  // blog post slug
      intent: params.get('intent') || null,  // e.g. "brand_specific"
      promo: params.get('promo') || readPromo(),  // Promote Newcollab referral code
    };
  }, [location.search]);

  const googleEnabled = Boolean(firebaseConfigured && auth);
  const values = { firstName, email, password };
  const fieldErrors = {
    firstName: validateSignupField('firstName', firstName),
    email: validateSignupField('email', email),
    password: validateSignupField('password', password),
  };
  const showError = (f) => (touched[f] ? fieldErrors[f] : '');
  const emailTaken = /already registered/i.test(error);

  const doRedirect = useCallback((url) => {
    try {
      const urlObj = new URL(url, window.location.origin);
      navigate(urlObj.pathname + urlObj.search + urlObj.hash);
    } catch {
      navigate(url);
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setTouched({ firstName: true, email: true, password: true });
    const firstBad = ['firstName', 'email', 'password'].find((f) => fieldErrors[f]);
    if (firstBad) {
      refs[firstBad].current && refs[firstBad].current.focus();
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/register/creator/account', {
        email: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        terms_accepted: true,
        // Signup context from URL params (blog widget, landing pages)
        ...(signupContext.ref && { signup_ref: signupContext.ref }),
        ...(signupContext.promo && { promo_code: signupContext.promo }),
        ...(signupContext.brand && { first_unlock_intent: signupContext.brand }),
        ...(signupContext.brand_query && { brand_query: signupContext.brand_query }),
        ...(signupContext.source_page && { signup_source_page: signupContext.source_page }),
        ...(signupContext.intent && { signup_intent: signupContext.intent }),
      }, { headers: { 'Content-Type': 'application/json' } });

      // Track signup completion in TikTok pixel with user data for better EMQ
      // Standard event code is CompleteRegistration (no space). A spaced name
      // registers as custom and cannot be used as an ads optimization goal.
      if (window.ttq) {
        // Identify user with email and external_id for better event matching
        window.ttq.identify({
          email: email.trim().toLowerCase(),
          external_id: res.data?.user_id || email.trim().toLowerCase()
        });
        window.ttq.track('CompleteRegistration');
      }

      persistLoggedInUser(setUser, {
        user_id: res.data?.user_id,
        user_role: 'creator',
        creator_id: res.data?.creator_id ?? null,
        approval_status: res.data?.approval_status ?? null,
      });
      doRedirect(res.data?.redirect_url || '/verify-email-pending');
    } catch (err) {
      const msg = err.response?.data?.error || (err.response ? 'Something went wrong. Please try again.' : "We couldn't reach Newcollab. Check your connection and try again.");
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

  const applyGoogleError = useCallback((err) => {
    reportGoogleStep('error', err);
    if (isIgnorableGoogleCancel(err)) return;
    const msg = googleSignInErrorMessage(err);
    if (isRegionBlockedError(err, msg)) {
      setRegionBlocked(true);
    } else {
      setGoogleError(msg);
    }
  }, []);

  const finishGoogleUser = useCallback(async (user) => {
    const idToken = await user.getIdToken();
    const response = await apiClient.post('/google-signup', {
      idToken,
      email: user.email,
      name: user.displayName,
      ...(signupContext.ref && { signup_ref: signupContext.ref }),
      ...(signupContext.promo && { promo_code: signupContext.promo }),
      ...(signupContext.brand && { first_unlock_intent: signupContext.brand }),
      ...(signupContext.brand_query && { brand_query: signupContext.brand_query }),
      ...(signupContext.source_page && { signup_source_page: signupContext.source_page }),
      ...(signupContext.intent && { signup_intent: signupContext.intent }),
    });
    reportGoogleStep('signup_ok');

    if (window.ttq && response.data?.needs_onboarding) {
      window.ttq.identify({
        email: user.email,
        external_id: response.data?.user_id || user.email,
      });
      window.ttq.track('CompleteRegistration');
    }

    persistLoggedInUser(setUser, response.data);
    const redirectUrl = response.data?.redirect_url ||
      (response.data?.needs_onboarding ? '/onboarding' : '/creator/dashboard/for-you');
    doRedirect(redirectUrl);
  }, [doRedirect, setUser, signupContext]);

  useEffect(() => {
    if (!googleEnabled) return undefined;
    let cancelled = false;
    (async () => {
      if (googleRedirectPending()) setGoogleLoading(true);
      try {
        const user = await consumeGoogleRedirectResult(auth, () => cancelled);
        if (cancelled || !user) return;
        setGoogleLoading(true);
        await finishGoogleUser(user);
      } catch (err) {
        if (!cancelled) applyGoogleError(err);
      } finally {
        if (!cancelled) setGoogleLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [googleEnabled, finishGoogleUser, applyGoogleError]);

  const handleGoogleSSO = async () => {
    if (!googleEnabled) {
      setGoogleError('Google sign-in is unavailable right now. Please use your email below.');
      return;
    }
    const inApp = inAppBrowserName();
    if (inApp) {
      const chromeUrl = openInSystemBrowserUrl();
      if (chromeUrl) window.location.href = chromeUrl;
      setGoogleError(inAppGoogleMessage(inApp));
      return;
    }
    setGoogleLoading(true);
    setError('');
    setGoogleError('');
    let redirected = false;
    try {
      const result = await startGoogleSignIn(auth);
      redirected = result.redirected;
      if (redirected || !result.user) return;
      await finishGoogleUser(result.user);
    } catch (err) {
      applyGoogleError(err);
    } finally {
      if (!redirected) setGoogleLoading(false);
    }
  };

  const fieldProps = (name) => ({
    id: `signup-${name}`,
    ref: refs[name],
    value: values[name],
    disabled: loading,
    $invalid: Boolean(showError(name)),
    'aria-invalid': Boolean(showError(name)) || undefined,
    'aria-describedby': `signup-${name}-msg`,
    onBlur: () => setTouched((t) => ({ ...t, [name]: Boolean(values[name]) || t[name] })),
  });
  const setters = { firstName: setFirstName, email: setEmail, password: setPassword };
  const onField = (name) => (e) => { setters[name](e.target.value); setError(''); };

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

  const pwHint = password && !fieldErrors.password ? '✓ Looks good' : `At least ${MIN_PASSWORD} characters`;

  return (
    <>
      <Helmet>
        <title>Sign Up Free | NewCollab - PR Packages & Paid UGC for Creators</title>
        <meta name="description" content="Join NewCollab free. Find 2,000+ brands that send PR packages, get paid UGC briefs, and let Polly pitch brands for you." />
        <link rel="canonical" href="https://newcollab.co/register/creator" />
      </Helmet>

      <PageWrapper>
        <TopBar>
          <LogoLink to="/" aria-label="Newcollab home">
            <LogoImg src="/newcollab-logo-dark.png" alt="newcollab" />
          </LogoLink>
          <TopBarLink>
            Have an account?<Link to="/login">Sign in</Link>
          </TopBarLink>
        </TopBar>

        <Shell>
          <Pitch>
            <Eyebrow>For UGC creators · Free to join</Eyebrow>
            <Headline>
              Get PR packages and <em>paid UGC deals.</em>
            </Headline>
            <Subline>
              Newcollab shows you which brands gift and pay creators like you, and Polly writes the pitches.
            </Subline>
            <BenefitList as={Benefits} />
          </Pitch>

          <Card onSubmit={handleSubmit} noValidate aria-labelledby="signup-title">
            <CardTitle id="signup-title">Create your free account</CardTitle>
            <CardSub>No credit card. You'll add your country and socials next.</CardSub>

            <GoogleBtn type="button" onClick={handleGoogleSSO} disabled={googleLoading || loading}>
              {googleLoading ? 'Connecting to Google…' : (<><GoogleIcon /> Continue with Google</>)}
            </GoogleBtn>
            {googleError && <ErrorMsg role="alert">{googleError}</ErrorMsg>}

            <OrBar>or with email</OrBar>

            <FormGroup>
              <FormLabel htmlFor="signup-firstName">First name</FormLabel>
              <FormInput
                {...fieldProps('firstName')}
                type="text"
                placeholder="Alex"
                autoComplete="given-name"
                autoCapitalize="words"
                onChange={onField('firstName')}
              />
              {showError('firstName') && <FieldMsg $error id="signup-firstName-msg">{showError('firstName')}</FieldMsg>}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="signup-email">Email</FormLabel>
              <FormInput
                {...fieldProps('email')}
                type="email"
                inputMode="email"
                placeholder="you@gmail.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                onChange={onField('email')}
              />
              {showError('email') && <FieldMsg $error id="signup-email-msg">{showError('email')}</FieldMsg>}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="signup-password">Password</FormLabel>
              <InputWrap>
                <FormInput
                  {...fieldProps('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  $withToggle
                  onChange={onField('password')}
                />
                <ToggleBtn
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  aria-pressed={showPw}
                  aria-controls="signup-password"
                >
                  <EyeIcon off={showPw} />{showPw ? 'Hide' : 'Show'}
                </ToggleBtn>
              </InputWrap>
              <FieldMsg $error={Boolean(showError('password'))} id="signup-password-msg">
                {showError('password') || pwHint}
              </FieldMsg>
            </FormGroup>

            {error && (
              <Banner role="alert">
                {emailTaken ? (
                  <>This email already has an account. <Link to="/login">Sign in instead</Link></>
                ) : error}
              </Banner>
            )}

            <SubmitBtn type="submit" disabled={loading || googleLoading} aria-busy={loading || undefined}>
              {loading ? (<><Spinner aria-hidden="true" /> Creating your account…</>) : 'Create free account'}
            </SubmitBtn>

            <Terms>
              By signing up you agree to our{' '}
              <Link to="/terms-of-service">Terms</Link> and{' '}
              <Link to="/privacy-policy">Privacy Policy</Link>.
            </Terms>

            <Reassure aria-label="What you get">
              <span>Free to start</span>
              <span>No credit card</span>
              <span>TikTok &amp; Instagram</span>
            </Reassure>
          </Card>

          <Proof aria-label="Creators on Newcollab">
            <BenefitList as={MobileBenefits} />
            <ProofCard>
              <ProofAvatars aria-hidden="true">
                <ProofAv $bg={colors.rose}>C</ProofAv>
                <ProofAv $bg={colors.violet}>M</ProofAv>
                <ProofAv $bg={colors.green}>Z</ProofAv>
                <ProofAv $bg={colors.amber}>A</ProofAv>
              </ProofAvatars>
              <ProofText>
                <b>@carolstyle</b> landed Rhode Skin 3 days after joining.
                <br />900+ creators are already pitching brands.
              </ProofText>
            </ProofCard>
          </Proof>
        </Shell>
      </PageWrapper>
    </>
  );
}
