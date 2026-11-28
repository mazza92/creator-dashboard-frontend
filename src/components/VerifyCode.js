import React, { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { apiClient } from '../config/api';
import { UserContext } from '../contexts/UserContext';
import { creatorTokens as t } from '../theme/creatorTokens';

/**
 * Email signup, step 2: the 6-digit code we emailed (services/email_code.py on the server). One field with
 * autocomplete="one-time-code", so phones offer the code from the email in one tap; it submits itself at 6 digits.
 */
const COOLDOWN = 30;

export default function VerifyCode() {
  const navigate = useNavigate();
  const { setUser, refreshUser, handleLogout } = useContext(UserContext) || {};
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [wait, setWait] = useState(COOLDOWN);
  const input = useRef(null);

  useEffect(() => {
    apiClient.get('/profile').then(({ data }) => {
      if (data?.email) setEmail(data.email);
      if (data?.email_verified !== false) navigate('/onboarding', { replace: true });
    }).catch(() => {});
  }, [navigate]);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);

  const submit = async (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 6);
    if (digits.length !== 6 || busy) return;
    setBusy(true);
    setError('');
    try {
      await apiClient.post('/api/auth/email-code/verify', { code: digits });
      if (setUser) setUser((u) => (u ? { ...u, email_verified: true } : u));
      if (refreshUser) await refreshUser();
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'That code isn’t right. Try again.');
      setCode('');
      setBusy(false);
      if (input.current) input.current.focus();
    }
  };

  const onChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    setError('');
    if (digits.length === 6) submit(digits);
  };

  const resend = async () => {
    if (wait > 0) return;
    setError('');
    setNote('');
    try {
      const { data } = await apiClient.post('/api/auth/email-code/resend', {});
      if (data?.verified) { navigate('/onboarding', { replace: true }); return; }
      setNote('New code sent. Check your inbox.');
      setWait(Number(data?.retry_in) || COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || 'We couldn’t send a new code. Try again in a moment.');
      setWait(Number(err.response?.data?.retry_in) || COOLDOWN);
    }
  };

  return (
    <Page>
      <Card>
        <Icon aria-hidden="true"><Mail size={26} /></Icon>
        <H1>Check your email</H1>
        <Sub>
          We sent a 6-digit code to {email ? <b>{email}</b> : 'your email'}. Enter it below to continue.
        </Sub>
        <form onSubmit={(e) => { e.preventDefault(); submit(code); }}>
          <Label htmlFor="email-code">Verification code</Label>
          <CodeInput
            id="email-code"
            ref={input}
            value={code}
            onChange={onChange}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="••••••"
            autoFocus
            disabled={busy}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'email-code-error' : undefined}
            $error={Boolean(error)}
          />
          {error ? <Error id="email-code-error" role="alert">{error}</Error> : null}
          {note && !error ? <Note role="status">{note}</Note> : null}
          <Primary type="submit" disabled={busy || code.length !== 6}>{busy ? 'Checking…' : 'Continue'}</Primary>
        </form>
        <Small>
          Didn’t get it? Check spam, or{' '}
          {wait > 0
            ? <span className="wait">send a new code in {wait}s</span>
            : <LinkBtn type="button" onClick={resend}>send a new code</LinkBtn>}
          .
        </Small>
        <Small>
          Wrong email? <LinkBtn type="button" onClick={() => (handleLogout ? handleLogout() : navigate('/register/creator'))}>Start again</LinkBtn>
        </Small>
      </Card>
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh; min-height: 100dvh; display: flex; align-items: flex-start; justify-content: center;
  padding: 48px 16px; box-sizing: border-box; background: ${t.paper}; font-family: ${t.fontSans}; color: ${t.ink};
  @media (min-width: 600px) { align-items: center; }
`;
const Card = styled.div`
  width: 100%; max-width: 420px; background: #fff; border: 1px solid ${t.line}; border-radius: 20px;
  padding: 32px 24px; box-sizing: border-box; text-align: center;
`;
const Icon = styled.div`
  width: 56px; height: 56px; margin: 0 auto 16px; border-radius: 50%; display: grid; place-items: center;
  background: ${t.accentSoft}; color: ${t.accentDeep};
`;
const H1 = styled.h1`margin: 0 0 8px; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;`;
const Sub = styled.p`
  margin: 0 0 24px; font-size: 15px; line-height: 1.5; color: ${t.muted};
  b { color: ${t.ink}; overflow-wrap: anywhere; }
`;
const Label = styled.label`
  position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
`;
const CodeInput = styled.input`
  width: 100%; box-sizing: border-box; height: 64px; border-radius: 14px; text-align: center;
  border: 1.5px solid ${(p) => (p.$error ? '#dc2626' : t.line)}; background: #fff; color: ${t.ink};
  font-family: inherit; font-size: 30px; font-weight: 800; letter-spacing: 0.45em; padding-left: 0.45em;
  &::placeholder { color: #c9c6bf; }
  &:focus { outline: none; border-color: ${(p) => (p.$error ? '#dc2626' : t.accent)}; box-shadow: 0 0 0 3px ${(p) => (p.$error ? 'rgba(220,38,38,.15)' : t.accentSoft)}; }
`;
const Error = styled.p`margin: 10px 0 0; font-size: 14px; color: #b91c1c;`;
const Note = styled.p`margin: 10px 0 0; font-size: 14px; color: ${t.accentDeep};`;
const Primary = styled.button`
  width: 100%; min-height: 52px; margin-top: 16px; border: 0; border-radius: 14px; background: ${t.ink}; color: #fff;
  font-family: inherit; font-size: 16px; font-weight: 750; cursor: pointer;
  &:disabled { opacity: .5; cursor: default; }
`;
const Small = styled.p`
  margin: 16px 0 0; font-size: 14px; color: ${t.muted};
  .wait { color: ${t.muted}; font-variant-numeric: tabular-nums; }
`;
const LinkBtn = styled.button`
  border: 0; background: none; padding: 0; font: inherit; font-weight: 650; color: ${t.accentDeep};
  text-decoration: underline; text-underline-offset: 3px; cursor: pointer;
`;
