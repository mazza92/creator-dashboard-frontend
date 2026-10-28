import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import api from '../../config/api';
import { creatorTokens as tokens } from '../../theme/creatorTokens';
import BriefMemo from '../brief/BriefMemo';
import RosterChat, { MessageButton } from '../chat/RosterChat';

const DUE_DAYS = 10;

function brandTag(app) {
  const raw = String(app.instagram || app.tiktok || '').trim().replace(/^@/, '');
  return raw && !raw.includes('/') && !raw.includes(' ') ? `@${raw}` : app.name;
}

function statusLine(app) {
  const pick = app.pick || {};
  if (pick.delivered) return 'Delivered. The brand has your links.';
  if (pick.shipped) return `Box shipped. Submit within ${DUE_DAYS} days of it arriving.`;
  return `${app.name} picked you and is preparing your box.`;
}

// The brand's size / shade / variant question from the brief, answered before they ship.
function VariantAsk({ app }) {
  const pick = app.pick || {};
  const [answer, setAnswer] = useState(pick.variant_answer || '');
  const [saved, setSaved] = useState(pick.variant_answer || '');
  const [editing, setEditing] = useState(!pick.variant_answer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!pick.variant_question) return null;

  async function save(e) {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Add your answer.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/api/pr-crm/applications/${app.application_id}/variant`, { answer: answer.trim() });
      if (!data?.success) throw new Error(data?.error || 'Could not save');
      setSaved(data.variant_answer);
      setAnswer(data.variant_answer);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not save your answer');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Ask $done={!editing}>
      <b>{app.name} asks:</b> {pick.variant_question}
      {editing ? (
        <form onSubmit={save}>
          <input type="text" maxLength={120} value={answer} placeholder="Your answer, e.g. Queen"
            aria-label={pick.variant_question} onChange={(e) => setAnswer(e.target.value)} />
          <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Send answer'}</button>
        </form>
      ) : (
        <p>
          Your answer: <b>{saved}</b>{' '}
          {!pick.shipped && <button type="button" onClick={() => setEditing(true)}>Change</button>}
        </p>
      )}
      {error && <Err role="alert">{error}</Err>}
    </Ask>
  );
}

function PickedCard({ app, focused, openChat, onDelivered }) {
  const pick = app.pick || {};
  const delivered = pick.delivered;
  const [editing, setEditing] = useState(!delivered);
  const [organic, setOrganic] = useState(delivered?.organic_url || '');
  const [ugc, setUgc] = useState(delivered?.ugc_url || '');
  const [note, setNote] = useState(delivered?.note || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);
  const [chatOpen, setChatOpen] = useState(Boolean(focused && openChat));
  const [unread, setUnread] = useState(Number(pick.unread_messages) || 0);

  useEffect(() => {
    if (focused && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [focused]);

  async function submit(e) {
    e.preventDefault();
    if (!organic.trim() && !ugc.trim()) {
      setError('Add your post link or your UGC video link.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post(`/api/pr-crm/applications/${app.application_id}/deliver`, {
        organic_url: organic.trim(),
        ugc_url: ugc.trim(),
        note: note.trim(),
      });
      if (!data?.success) throw new Error(data?.error || 'Could not save');
      onDelivered(app.application_id, { ...data.delivered, delivered_at: new Date().toISOString() });
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Could not save your content');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card ref={ref} $focused={focused}>
      <Top>
        {app.logo ? <Logo src={app.logo} alt="" /> : <LogoFallback>{(app.name || '?')[0]}</LogoFallback>}
        <div>
          <h3>{app.name}</h3>
          <Status $done={!!delivered}>{statusLine(app)}</Status>
        </div>
        <MessageButton className="msg" unread={unread} label={`Message ${app.name}`} onClick={() => setChatOpen(true)} />
      </Top>
      <RosterChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={app.name}
        subtitle={pick.product || 'PR box'}
        avatarUrl={app.logo}
        loadUrl={`/api/pr-crm/applications/${app.application_id}/messages`}
        sendUrl={`/api/pr-crm/applications/${app.application_id}/messages`}
        onRead={() => setUnread(0)}
        quickReplies={['Thank you so much! 🙏', 'My box arrived 🎉', 'Any update on shipping?', 'Posting this week!']}
        emptyHint={`Questions about your size, shipping or timing? Ask ${app.name} here. They get an email when you write.`}
      />
      {pick.product && <Product>Sending you: <b>{pick.product}</b></Product>}
      <VariantAsk app={app} />
      <Brief>
        <li><b>1 organic post</b> on TikTok or Instagram tagging {brandTag(app)}</li>
        <li><b>1 raw UGC video</b>, no music or captions, they can reuse in ads for 6 months</li>
      </Brief>
      <BriefMemo brief={pick.brief} brandName={app.name} />
      {delivered && !editing ? (
        <Done>
          {delivered.organic_url && <a href={delivered.organic_url} target="_blank" rel="noreferrer">Organic post</a>}
          {delivered.ugc_url && <a href={delivered.ugc_url} target="_blank" rel="noreferrer">UGC video</a>}
          <button type="button" onClick={() => setEditing(true)}>Update links</button>
        </Done>
      ) : (
        <Form onSubmit={submit}>
          <label>
            Organic post link
            <input
              type="url"
              inputMode="url"
              placeholder="https://www.tiktok.com/@you/video/…"
              value={organic}
              onChange={(e) => setOrganic(e.target.value)}
            />
          </label>
          <label>
            Raw UGC video link
            <input
              type="url"
              inputMode="url"
              placeholder="Google Drive or Dropbox link"
              value={ugc}
              onChange={(e) => setUgc(e.target.value)}
            />
          </label>
          <label>
            Note for the brand <em>(optional)</em>
            <input type="text" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
          {error && <Err role="alert">{error}</Err>}
          <Submit type="submit" disabled={busy}>
            {busy ? 'Sending…' : delivered ? 'Save links' : `Send to ${app.name}`}
          </Submit>
        </Form>
      )}
    </Card>
  );
}

export default function PickedBrands({ apps, focusId, openChat = false, onDelivered }) {
  if (!apps?.length) return null;
  const open = apps.filter((a) => !a.pick?.delivered).length;
  return (
    <Wrap aria-label="Brands that picked you">
      <Head>
        <h2>Picked for a PR box</h2>
        <span>{open ? `${open} to deliver` : 'All delivered'}</span>
      </Head>
      {apps.map((app) => (
        <PickedCard
          key={app.application_id}
          app={app}
          focused={Number(focusId) === Number(app.application_id)}
          openChat={openChat}
          onDelivered={onDelivered}
        />
      ))}
    </Wrap>
  );
}

const Wrap = styled.section`
  margin: 0 0 24px;
  display: grid;
  gap: 12px;
`;

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  h2 {
    margin: 0;
    font-family: ${tokens.fontDisplay};
    font-weight: 400;
    font-size: 26px;
    color: ${tokens.ink};
  }
  span {
    font-size: 13px;
    font-weight: 600;
    color: ${tokens.accentDeep};
  }
`;

const Card = styled.article`
  background: ${tokens.white};
  border: 1px solid ${(p) => (p.$focused ? tokens.accent : tokens.line)};
  box-shadow: ${(p) => (p.$focused ? `0 0 0 3px ${tokens.accentSoft}` : tokens.shadowCard)};
  border-radius: ${tokens.radiusCard};
  padding: 18px;
  font-family: ${tokens.fontSans};
  color: ${tokens.ink};
`;

const Top = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  h3 { margin: 0; font-size: 17px; }
  > div { flex: 1; min-width: 0; }
  .msg { flex-shrink: 0; }
  @media (max-width: 480px) {
    flex-wrap: wrap;
    .msg { width: 100%; justify-content: center; }
  }
`;

const Logo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid ${tokens.line};
`;

const LogoFallback = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: ${tokens.accentSoft};
  color: ${tokens.accentDeep};
  font-weight: 700;
`;

const Status = styled.div`
  font-size: 13px;
  color: ${(p) => (p.$done ? tokens.success : tokens.muted)};
  margin-top: 2px;
`;

const Product = styled.p`
  margin: 14px 0 0;
  font-size: 14px;
`;

const Brief = styled.ul`
  margin: 10px 0 0;
  padding: 12px 14px 12px 30px;
  background: ${tokens.paper};
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.5;
  li + li { margin-top: 4px; }
`;

const Form = styled.form`
  display: grid;
  gap: 10px;
  margin-top: 14px;
  label {
    display: grid;
    gap: 4px;
    font-size: 13px;
    font-weight: 600;
    color: ${tokens.inkSoft};
  }
  em { font-weight: 400; color: ${tokens.muted}; font-style: normal; }
  input {
    font: inherit;
    font-weight: 400;
    font-size: 15px;
    padding: 10px 12px;
    border: 1px solid ${tokens.line};
    border-radius: ${tokens.radiusInput};
    background: ${tokens.white};
  }
  input:focus { outline: none; border-color: ${tokens.accent}; }
`;

const Err = styled.div`
  color: ${tokens.hot};
  font-size: 13px;
`;

const Submit = styled.button`
  justify-self: start;
  padding: 11px 18px;
  border: 0;
  border-radius: ${tokens.radiusBtn};
  background: ${tokens.action};
  color: ${tokens.white};
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  &:disabled { opacity: 0.6; cursor: default; }
`;

const Done = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  margin-top: 14px;
  font-size: 14px;
  a { color: ${tokens.accentDeep}; font-weight: 600; }
  button {
    border: 0;
    background: none;
    color: ${tokens.muted};
    text-decoration: underline;
    font: inherit;
    cursor: pointer;
  }
`;

const Ask = styled.div`
  margin: 0 0 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: ${(p) => (p.$done ? '#f5f5f7' : '#fff7ed')};
  font-size: 14px;
  line-height: 1.5;
  color: ${tokens.ink};

  form {
    display: flex;
    gap: 8px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  input {
    flex: 1 1 180px;
    min-width: 0;
    border: 1px solid ${tokens.line};
    border-radius: 10px;
    padding: 9px 11px;
    font: inherit;
    background: #fff;
  }

  form button {
    border: 0;
    border-radius: 10px;
    padding: 9px 14px;
    font: inherit;
    font-weight: 600;
    color: #fff;
    background: ${tokens.ink};
    cursor: pointer;
  }

  form button:disabled { opacity: 0.6; }

  p { margin: 6px 0 0; }

  p button {
    border: 0;
    background: none;
    padding: 0;
    font: inherit;
    color: ${tokens.muted};
    text-decoration: underline;
    cursor: pointer;
  }
`;
