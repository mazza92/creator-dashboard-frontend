// /for-brands: classic 3-step brand signup. 1 Create account (Google or work email) -> 2 Your brand
// (name, website or app link, category) -> 3 First campaign -> Start my campaign -> brand workspace.
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowRight, Check, ChevronLeft, Loader2, Lock, Mail } from 'lucide-react';
import api from '../config/api';
import { auth, firebaseConfigured } from '../components/firebase';
import { UserContext, persistLoggedInUser } from '../contexts/UserContext';
import {
  consumeGoogleRedirectResult, googleRedirectPending, googleSignInErrorMessage, inAppBrowserName,
  inAppGoogleMessage, startGoogleSignIn,
} from '../utils/googleSignIn';
import CampaignForm, {
  CATEGORIES, Chip, Chips, EMPTY_CAMPAIGN, Field, TextInput, campaignPayload, campaignReady,
} from './CampaignForm';

const STEPS = [['Create account', 'Account'], ['Your brand', 'Brand'], ['First campaign', 'Campaign']];

function readCookie(name) {
  try {
    const hit = document.cookie.split('; ').find((c) => c.startsWith(`${name}=`));
    return hit ? decodeURIComponent(hit.split('=').slice(1).join('=')) : '';
  } catch {
    return '';
  }
}

function errorText(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.error || err?.message || fallback;
}

// ============================================================================
// STYLES
// ============================================================================

const Page = styled.div`
  min-height: 100vh;
  background: radial-gradient(1200px 600px at 50% -10%, #fde8ec 0%, rgba(253, 232, 236, 0) 60%),
    linear-gradient(180deg, #f7f8fb 0%, #eef1f7 100%);
  color: #111214;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 20px 16px 64px;

  *, *::before, *::after { box-sizing: border-box; }
`;

const Top = styled.header`
  max-width: 1040px;
  margin: 0 auto 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  a.logo {
    font-weight: 800;
    letter-spacing: -0.02em;
    font-size: 18px;
    color: #111214;
    text-decoration: none;
  }

  a.login {
    font-size: 14px;
    color: #3f424a;
    text-decoration: none;
  }

  a.login b { color: #111214; }
`;

const Pills = styled.ol`
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 6px;
  margin: 0 auto 40px;
  padding: 0;
  flex-wrap: wrap;

  li {
    font-size: 14px;
    color: #8a8e96;
    padding: 8px 14px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  li.on {
    color: #111214;
    font-weight: 600;
    background: #fff;
    box-shadow: 0 1px 2px rgba(17, 18, 20, 0.06), 0 4px 14px rgba(17, 18, 20, 0.06);
  }

  li.done { color: #0f9d58; }
  .short { display: none; }

  @media (max-width: 520px) {
    margin-bottom: 28px;
    flex-wrap: nowrap;
    gap: 2px;
    li { padding: 6px 10px; font-size: 13px; white-space: nowrap; }
    .long { display: none; }
    .short { display: inline; }
  }
`;

const Body = styled.main`
  max-width: ${(p) => (p.$wide ? '620px' : '460px')};
  margin: 0 auto;
`;

const H1 = styled.h1`
  font-size: clamp(30px, 5vw, 44px);
  line-height: 1.08;
  letter-spacing: -0.03em;
  font-weight: 800;
  text-align: center;
  margin: 0 0 12px;
`;

const Sub = styled.p`
  font-size: 16px;
  line-height: 1.55;
  color: #555962;
  text-align: center;
  margin: 0 auto 32px;
  max-width: 440px;
`;

const Pill = styled.button`
  width: 100%;
  height: 54px;
  border-radius: 999px;
  border: 1px solid ${(p) => (p.$dark ? '#111214' : '#dfe2e8')};
  background: ${(p) => (p.$dark ? 'linear-gradient(180deg, #2a2b30 0%, #0d0e10 100%)' : '#fff')};
  color: ${(p) => (p.$dark ? '#fff' : '#111214')};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: ${(p) => (p.$dark ? '0 8px 20px rgba(17,18,20,0.18)' : '0 1px 2px rgba(17,18,20,0.05)')};
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;

  &:hover:not(:disabled) { transform: translateY(-1px); }
  &:disabled { opacity: 0.5; cursor: default; }

  svg.spin { animation: spin 0.9s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

const Or = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  font-size: 13px;
  color: #9a9ea6;

  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #dfe2e8;
  }
`;

const IconInput = styled.div`
  position: relative;
  margin-bottom: 12px;

  svg {
    position: absolute;
    left: 18px;
    top: 50%;
    transform: translateY(-50%);
    color: #8a8e96;
  }

  input {
    height: 54px;
    border-radius: 999px;
    padding-left: 48px;
  }
`;

const Fine = styled.p`
  text-align: center;
  font-size: 14px;
  color: #3f424a;
  margin: 14px 0 0;

  b { color: #0f9d58; }
  a { color: #111214; font-weight: 600; }
`;

const Legal = styled.p`
  text-align: center;
  font-size: 12px;
  line-height: 1.6;
  color: #8a8e96;
  margin: 24px auto 0;
  max-width: 400px;

  a { color: #6b6f78; }
`;

const ErrorBox = styled.div`
  margin: 0 0 14px;
  padding: 11px 14px;
  border-radius: 14px;
  background: #fef2f4;
  color: #c92549;
  font-size: 14px;
  line-height: 1.5;

  a { color: #c92549; font-weight: 600; }
`;

const Card = styled.section`
  background: #fff;
  border: 1px solid #e7e9ee;
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 10px 40px rgba(17, 18, 20, 0.06);

  @media (max-width: 520px) {
    padding: 20px 16px;
    border-radius: 20px;
  }
`;

const Eyebrow = styled.div`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #8a8e96;
  text-transform: uppercase;
  margin-bottom: 10px;
`;

const LeftH = styled.h1`
  font-size: clamp(26px, 4.4vw, 36px);
  line-height: 1.12;
  letter-spacing: -0.025em;
  font-weight: 800;
  margin: 0 0 8px;
`;

const LeftSub = styled.p`
  font-size: 15px;
  line-height: 1.55;
  color: #555962;
  margin: 0 0 24px;
`;

const Toggle = styled.div`
  display: inline-flex;
  gap: 6px;
  margin-bottom: 10px;

  button {
    border: 1px solid #dfe2e8;
    background: #fff;
    color: #3f424a;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  button.on {
    background: #111214;
    border-color: #111214;
    color: #fff;
  }
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 8px;

  button.back {
    border: 0;
    background: none;
    color: #555962;
    font-size: 15px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
    padding: 0;
  }

  > :last-child { width: auto; padding: 0 28px; margin-left: auto; }

  @media (max-width: 520px) {
    flex-direction: column-reverse;
    align-items: stretch;

    > :last-child { width: 100%; margin-left: 0; }
    button.back { justify-content: center; padding: 6px; }
  }
`;

const Skip = styled.button`
  display: block;
  margin: 16px auto 0;
  border: 0;
  background: none;
  color: #6b6f78;
  font-size: 14px;
  text-decoration: underline;
  cursor: pointer;
`;

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 38.6 44 33 44 24c0-1.3-.1-2.4-.4-3.5z" />
  </svg>
);

// ============================================================================
// STEPS
// ============================================================================

function AccountStep({ onDone, entry }) {
  const { setUser } = useContext(UserContext) || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const googleEnabled = Boolean(firebaseConfigured && auth);

  const extra = useCallback(() => ({
    ref: entry.get('ref') || 'for-brands',
    niche: entry.get('niche') || '',
    free_scan: readCookie('nc_free_scan'),
    oref: entry.get('oref') || readCookie('nc_oref') || undefined,
  }), [entry]);

  const signedIn = useCallback((data) => {
    persistLoggedInUser(setUser, data);
    if (window.ttq) window.ttq.track('CompleteRegistration');
    onDone(data);
  }, [onDone, setUser]);

  const finishGoogle = useCallback(async (googleUser) => {
    const idToken = await googleUser.getIdToken();
    const { data } = await api.post('/api/brand-workspace/google', { idToken, ...extra() });
    signedIn(data);
  }, [extra, signedIn]);

  useEffect(() => {
    if (!googleEnabled || !googleRedirectPending()) return undefined;
    let cancelled = false;
    (async () => {
      setBusy('google');
      try {
        const googleUser = await consumeGoogleRedirectResult(auth, () => cancelled);
        if (!cancelled && googleUser) await finishGoogle(googleUser);
      } catch (err) {
        if (!cancelled) setError(err?.response ? errorText(err) : googleSignInErrorMessage(err));
      } finally {
        if (!cancelled) setBusy('');
      }
    })();
    return () => { cancelled = true; };
  }, [finishGoogle, googleEnabled]);

  const google = async () => {
    setError('');
    const inApp = inAppBrowserName();
    if (inApp) {
      setError(inAppGoogleMessage(inApp));
      return;
    }
    setBusy('google');
    let redirected = false;
    try {
      const result = await startGoogleSignIn(auth);
      redirected = result.redirected;
      if (!redirected && result.user) await finishGoogle(result.user);
    } catch (err) {
      setError(err?.response ? errorText(err) : googleSignInErrorMessage(err));
    } finally {
      if (!redirected) setBusy('');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!showPassword) {
      setShowPassword(true);
      return;
    }
    setBusy('email');
    try {
      const { data } = await api.post('/api/brand-workspace/signup', { email: email.trim(), password, ...extra() });
      signedIn(data);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy('');
    }
  };

  const loginHint = /log in/i.test(error);
  return (
    <Body>
      <H1>Create your free brand account</H1>
      <Sub>Scan any competitor&apos;s creators, then run your first gifted campaign free.</Sub>
      {error && (
        <ErrorBox role="alert">
          {error} {loginHint && <a href="/login?returnTo=%2Fbrand%2Fworkspace">Log in</a>}
        </ErrorBox>
      )}
      {googleEnabled && (
        <>
          <Pill type="button" onClick={google} disabled={Boolean(busy)}>
            {busy === 'google' ? <Loader2 size={18} className="spin" /> : <GoogleIcon />}
            Continue with Google
          </Pill>
          <Or>or</Or>
        </>
      )}
      <form onSubmit={submit}>
        <IconInput>
          <Mail size={18} />
          <TextInput type="email" autoComplete="email" required placeholder="Work email address" value={email}
            onChange={(e) => setEmail(e.target.value)} aria-label="Work email" />
        </IconInput>
        {showPassword && (
          <IconInput>
            <Lock size={18} />
            <TextInput type="password" autoComplete="new-password" autoFocus placeholder="Create a password (8+ characters)"
              value={password} onChange={(e) => setPassword(e.target.value)} aria-label="Password" minLength={8} />
          </IconInput>
        )}
        <Pill $dark type="submit" disabled={Boolean(busy) || !email.trim() || (showPassword && password.length < 8)}>
          {busy === 'email' && <Loader2 size={18} className="spin" />}
          {showPassword ? 'Create my free account' : 'Continue with email'}
        </Pill>
      </form>
      <Fine><Check size={14} color="#0f9d58" style={{ verticalAlign: '-2px' }} /> <b>$0 today</b> · first campaign free · cancel anytime</Fine>
      <Fine style={{ marginTop: 22 }}>Already have an account? <a href="/login?returnTo=%2Fbrand%2Fworkspace">Log in</a></Fine>
      <Fine style={{ marginTop: 6 }}>Are you a creator? <a href="/register/creator">Sign up as a creator</a></Fine>
      <Legal>
        By continuing, you agree to the <a href="https://newcollab.co/terms-of-service">Terms of Service</a> and
        acknowledge the <a href="https://newcollab.co/privacy-policy">Privacy Policy</a>.
      </Legal>
    </Body>
  );
}

function BrandStep({ initial, onDone }) {
  const [name, setName] = useState(initial.name || '');
  const [mode, setMode] = useState(initial.app_url && !initial.website ? 'app' : 'website');
  const [link, setLink] = useState((mode === 'app' ? initial.app_url : initial.website) || '');
  const [category, setCategory] = useState(initial.category || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ready = name.trim() && link.trim() && category;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/brand-workspace/profile', {
        brand_name: name.trim(),
        website: mode === 'website' ? link.trim() : '',
        app_url: mode === 'app' ? link.trim() : '',
        category,
      });
      onDone({ name: name.trim(), category });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Body $wide>
      <Card as="form" onSubmit={submit}>
        <Eyebrow>Your brand</Eyebrow>
        <LeftH>Tell us about your brand</LeftH>
        <LeftSub>We use this to match you with creators in your niche, so you won&apos;t be asked twice.</LeftSub>
        {error && <ErrorBox role="alert">{error}</ErrorBox>}
        <Field>
          <span>Brand name</span>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Glow Co" autoFocus />
        </Field>
        <Field as="div">
          <span>Your site or app</span>
          <Toggle>
            <button type="button" className={mode === 'website' ? 'on' : ''} onClick={() => setMode('website')}>Website</button>
            <button type="button" className={mode === 'app' ? 'on' : ''} onClick={() => setMode('app')}>App</button>
          </Toggle>
          <TextInput
            value={link}
            onChange={(e) => setLink(e.target.value)}
            inputMode="url"
            placeholder={mode === 'website' ? 'yourbrand.com' : 'App Store or Google Play link'}
            aria-label={mode === 'website' ? 'Website' : 'App Store or Google Play link'}
          />
        </Field>
        <Field as="div">
          <span>Category</span>
          <Chips>
            {CATEGORIES.map((c) => (
              <Chip key={c.value} type="button" $on={category === c.value} onClick={() => setCategory(c.value)}>{c.label}</Chip>
            ))}
          </Chips>
        </Field>
        <Nav>
          <span />
          <Pill $dark type="submit" disabled={!ready || busy}>
            {busy ? <Loader2 size={18} className="spin" /> : null} Continue <ArrowRight size={16} />
          </Pill>
        </Nav>
      </Card>
    </Body>
  );
}

function CampaignStep({ brandName, onBack, onDone, onSkip }) {
  const [value, setValue] = useState(EMPTY_CAMPAIGN);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post('/api/brand-workspace/campaigns', campaignPayload(value));
      onDone();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Body $wide>
      <Card as="form" onSubmit={submit}>
        <Eyebrow>Your first campaign · free</Eyebrow>
        <LeftH>What do you want creators to make{brandName ? ` for ${brandName}` : ''}?</LeftH>
        <LeftSub>Vetted creators apply, you pick who to gift, and you get 5–10 ad-ready videos with 6-month ad rights.</LeftSub>
        {error && <ErrorBox role="alert">{error}</ErrorBox>}
        <CampaignForm value={value} onChange={setValue} />
        <Nav>
          <button type="button" className="back" onClick={onBack}><ChevronLeft size={16} /> Back</button>
          <Pill $dark type="submit" disabled={!campaignReady(value) || busy}>
            {busy ? <Loader2 size={18} className="spin" /> : null} Start my campaign <ArrowRight size={16} />
          </Pill>
        </Nav>
      </Card>
      <Skip type="button" onClick={onSkip}>I&apos;ll set up my campaign later</Skip>
    </Body>
  );
}

// ============================================================================
// PAGE
// ============================================================================

export default function BrandSignup() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext) || {};
  const entry = useRef(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')).current;
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({});
  const [checking, setChecking] = useState(false);

  // A signed-in brand resumes where it left off: brand details, then the campaign, else the workspace.
  useEffect(() => {
    if (!user || user.role !== 'brand' || step !== 0) return;
    setChecking(true);
    api.get('/api/brand-workspace/me')
      .then(({ data }) => {
        const ws = data.workspace;
        setProfile(ws.brand || {});
        if (!ws.profile_complete) setStep(1);
        else if (!ws.campaign) setStep(2);
        else navigate('/brand/workspace', { replace: true });
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [navigate, step, user]);

  useEffect(() => { window.scrollTo({ top: 0 }); }, [step]);

  const openWorkspace = () => navigate('/brand/workspace?welcome=1', { replace: true });

  return (
    <Page>
      <Top>
        <a className="logo" href="https://newcollab.co">newcollab</a>
        {step === 0 && <a className="login" href="/login?returnTo=%2Fbrand%2Fworkspace">Have an account? <b>Log in</b></a>}
      </Top>
      <Pills>
        {STEPS.map(([label, short], i) => (
          <li key={label} className={i === step ? 'on' : i < step ? 'done' : ''}>
            {i < step ? <Check size={14} /> : `${i + 1}.`} <span className="long">{label}</span><span className="short">{short}</span>
          </li>
        ))}
      </Pills>
      {checking ? null : step === 0 ? (
        // An existing brand signing in again is routed by the resume effect above (user context updates).
        <AccountStep entry={entry} onDone={(data) => { if (data.needs_profile !== false) setStep(1); }} />
      ) : step === 1 ? (
        <BrandStep initial={profile} onDone={(p) => { setProfile((prev) => ({ ...prev, ...p })); setStep(2); }} />
      ) : (
        <CampaignStep brandName={profile.name} onBack={() => setStep(1)} onDone={openWorkspace} onSkip={openWorkspace} />
      )}
    </Page>
  );
}
