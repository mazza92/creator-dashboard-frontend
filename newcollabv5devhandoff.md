# NewCollab v5 — Full Developer Handoff

**Reference file:** `newcollab-brand-v5.html` (open in browser to see the final result)
**Scope:** Apply the new NewCollab brand system across the creator dashboard. Two files change:
- `src/Layouts/CreatorDashboardLayout.js`
- `src/cra-pages/UnifiedBrandDirectory.js`

No backend changes. No business logic changes.

---

## 1. Brand Principles

1. **One primary color.** Warm Rose `#E11D48`. Used sparingly — logo accent, saved state, follower tags, avatar.
2. **Near-black for primary action.** `#0F0F0F`. Contact button, active nav tab, logo mark. Black > color for trust on the main CTA.
3. **Emerald for success only.** `#059669`. Response rates and confirmed states.
4. **Violet for Pro moments only.** `#7C3AED`. Used in the rose→violet gradient on upgrade CTAs and locked cards. **Nowhere else.**
5. **No emojis as primary UI icons.** Use a single icon library (Lucide React recommended). Emojis only in user-generated content, never in chrome.
6. **One typeface.** Inter, loaded from Google Fonts. Weights 400/500/600/700/800.
7. **Flat, clean, no gradients** — except the Pro gradient.

---

## 2. Setup

### 2a. Install Lucide for icons

```bash
npm install lucide-react
```

### 2b. Load Inter

Add to `public/index.html` (CRA) `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### 2c. Create the theme file

Create `src/theme/tokens.js`:

```js
export const tokens = {
  // Primary — Rose. Brand accent, saved state, follower tags
  primary:        '#E11D48',
  primaryHover:   '#BE123C',
  primaryLight:   '#FFF1F3',
  primaryBorder:  '#FECDD3',

  // Action — Near-black. Contact button, active nav, logo mark
  action:         '#0F0F0F',
  actionHover:    '#1C1C1C',

  // Accent — Violet. Pro/upgrade gradient tail only
  accent:         '#7C3AED',
  accentLight:    '#F5F3FF',
  accentBorder:   '#DDD6FE',

  // Success — Emerald. Response rates, contacted state
  success:        '#059669',
  successLight:   '#ECFDF5',
  successBorder:  '#A7F3D0',

  // Neutrals
  bg:             '#FAFAFA',
  surface:        '#FFFFFF',
  border:         '#EBEBEB',
  borderHover:    '#D4D4D4',
  textPrimary:    '#0F0F0F',
  textSecondary:  '#4B4B4B',
  textMuted:      '#8C8C8C',
  subtle:         '#F4F4F4',

  // Pro gradient — ONLY for upgrade/locked moments
  proGradient:    'linear-gradient(135deg, #E11D48, #7C3AED)',

  // Radii
  radiusCard:     '20px',
  radiusBtn:      '10px',
  radiusPill:     '100px',
  radiusInput:    '12px',

  // Shadows
  shadowCard:     '0 1px 3px rgba(15,15,15,0.04), 0 4px 16px rgba(15,15,15,0.03)',
  shadowHover:    '0 8px 28px rgba(15,15,15,0.08)',

  // Font
  fontFamily:     "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};
```

### 2d. Global body styles

Update your global stylesheet (`src/index.css` or equivalent):

```css
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #FAFAFA;
  color: #0F0F0F;
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

---

## 3. Icon Library

Replace all emoji icons with Lucide React. Standard size: `16px` for inline, `18px` for nav, `20px` for mobile bottom bar.

| Emoji (old) | Lucide icon | Used for |
|-------------|-------------|----------|
| 🔍 | `Search` | Discover nav, search input |
| 📌 | `Bookmark` | Saved nav |
| 🎁 | `Gift` | PR Offers nav |
| 📄 | `FileText` | My Kit nav |
| 🔔 | `Bell` | Notifications icon button |
| 📨 / 📧 | `Mail` | Contact button, quota icon |
| ⭐ | `Sparkles` | Featured badge |
| 👥 | `Users` | Creator stats |
| ♡ | `Heart` (outline) | Save button |
| ✓ Saved | `Heart` (filled) | Saved state |
| ✓ Contacted | `Check` | Contacted state |
| 🔒 | `Lock` | Pro-locked button |
| ⚡ | `Zap` | Upgrade link |

Import pattern:
```jsx
import { Search, Bookmark, Gift, FileText, Bell, Mail, Sparkles, Users, Heart, Check, Lock, Zap } from 'lucide-react';
```

---

## 4. Logo Component

The wordmark uses a colored letter on near-black mark.

Create `src/components/Logo.jsx`:

```jsx
import styled from 'styled-components';

const LogoWrap = styled.a`
  display: flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
`;

const LogoMark = styled.div`
  width: 32px;
  height: 32px;
  background: #0F0F0F;
  border-radius: 9px;
  display: grid;
  place-items: center;
  color: white;
  font-weight: 900;
  font-size: 16px;
  letter-spacing: -0.5px;
`;

const Wordmark = styled.span`
  font-size: 16px;
  font-weight: 800;
  color: #0F0F0F;
  letter-spacing: -0.5px;
  font-family: 'Inter', sans-serif;

  span { color: #E11D48; font-weight: 900; }
`;

export default function Logo() {
  return (
    <LogoWrap href="/creator/dashboard/pr-brands">
      <LogoMark>N</LogoMark>
      <Wordmark>new<span>collab</span></Wordmark>
    </LogoWrap>
  );
}
```

---

## 5. `CreatorDashboardLayout.js` — Full Replacement

### 5a. Imports

```jsx
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, Gift, FileText, Bell } from 'lucide-react';
import Logo from '../components/Logo';
```

### 5b. Styled components

```jsx
const TopNav = styled.nav`
  background: #FFFFFF;
  box-shadow: 0 1px 0 #EBEBEB;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
  height: 60px;

  @media (max-width: 640px) { padding: 0 16px; }
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 36px;
`;

const NavTabs = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  background: #F4F4F4;
  padding: 4px;
  border-radius: 100px;

  @media (max-width: 640px) { display: none; }
`;

const NavTab = styled(Link)`
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  border-radius: 100px;
  font-size: 13.5px;
  font-weight: ${p => (p.$active ? 600 : 500)};
  color: ${p => (p.$active ? '#FFFFFF' : '#4B4B4B')};
  background: ${p => (p.$active ? '#0F0F0F' : 'transparent')};
  box-shadow: ${p => (p.$active ? '0 1px 4px rgba(0,0,0,0.15)' : 'none')};
  text-decoration: none;
  transition: all 0.15s;
  font-family: inherit;

  &:hover { color: ${p => (p.$active ? '#FFFFFF' : '#0F0F0F')}; }

  svg { width: 16px; height: 16px; }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IconBtn = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #F4F4F4;
  border: none;
  cursor: pointer;
  display: grid;
  place-items: center;
  color: #4B4B4B;
  transition: all 0.15s;

  &:hover { background: #EBEBEB; color: #0F0F0F; }

  svg { width: 17px; height: 17px; }
`;

const AvatarPill = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 14px 4px 4px;
  background: #F4F4F4;
  border: none;
  border-radius: 100px;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: #EBEBEB; }
`;

const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #E11D48;
  color: white;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 11px;
`;

const AvatarName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #0F0F0F;
`;

const MobileTabBar = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #EBEBEB;
  padding: 6px 0 8px;
  justify-content: space-around;
  z-index: 100;

  @media (max-width: 640px) { display: flex; }
`;

const MobileTab = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  color: ${p => (p.$active ? '#0F0F0F' : '#8C8C8C')};
  font-weight: ${p => (p.$active ? 700 : 500)};
  text-decoration: none;
  font-size: 10px;
  flex: 1;
  font-family: inherit;

  svg { width: 20px; height: 20px; }
`;

const Content = styled.main`
  min-height: calc(100vh - 60px);

  @media (max-width: 640px) {
    padding-bottom: 72px;
  }
`;
```

### 5c. JSX

```jsx
const navItems = [
  { label: 'Discover', icon: Search,   path: '/creator/dashboard/pr-brands' },
  { label: 'Saved',    icon: Bookmark, path: '/creator/dashboard/pr-pipeline' },
  { label: 'PR Offers', icon: Gift,    path: '/creator/dashboard/pr-offers' },
  { label: 'My Kit',   icon: FileText, path: '/creator/dashboard/my-kit' },
];

export default function CreatorDashboardLayout({ children, user }) {
  const location = useLocation();
  const initial = user?.username?.[0]?.toUpperCase() || 'C';
  const displayName = user?.username || 'Creator';

  return (
    <>
      <TopNav>
        <NavLeft>
          <Logo />
          <NavTabs>
            {navItems.map(({ label, icon: Icon, path }) => (
              <NavTab key={path} to={path} $active={location.pathname === path}>
                <Icon />
                {label}
              </NavTab>
            ))}
          </NavTabs>
        </NavLeft>
        <NavRight>
          <IconBtn><Bell /></IconBtn>
          <AvatarPill>
            <Avatar>{initial}</Avatar>
            <AvatarName>{displayName}</AvatarName>
          </AvatarPill>
        </NavRight>
      </TopNav>

      <Content>{children}</Content>

      <MobileTabBar>
        {navItems.map(({ label, icon: Icon, path }) => (
          <MobileTab key={path} to={path} $active={location.pathname === path}>
            <Icon />
            {label}
          </MobileTab>
        ))}
      </MobileTabBar>
    </>
  );
}
```

---

## 6. `UnifiedBrandDirectory.js` — Full Replacement

### 6a. Imports

```jsx
import styled from 'styled-components';
import { Search, Mail, Sparkles, Users, Heart, Check, Lock, Zap, ChevronDown } from 'lucide-react';
```

### 6b. Page layout

```jsx
const PageWrap = styled.div`
  background: #FAFAFA;
  min-height: 100vh;
`;

const PageContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px 32px;

  @media (max-width: 640px) { padding: 20px 16px; }
`;
```

### 6c. Quota strip

```jsx
const QuotaStrip = styled.div`
  background: white;
  border: 1px solid #EBEBEB;
  border-radius: 16px;
  padding: 16px 20px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) { flex-wrap: wrap; gap: 12px; }
`;

const QuotaIconBox = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: #F4F4F4;
  color: #4B4B4B;
  display: grid;
  place-items: center;
  flex-shrink: 0;

  svg { width: 18px; height: 18px; }
`;

const QuotaText = styled.div` flex: 1; min-width: 200px; `;

const QuotaTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #0F0F0F;
  margin-bottom: 6px;
`;

const QuotaBarTrack = styled.div`
  height: 5px;
  background: #F4F4F4;
  border-radius: 3px;
  overflow: hidden;
  max-width: 320px;
  margin-bottom: 5px;
`;

const QuotaBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #E11D48, #7C3AED);
  width: ${p => p.$pct}%;
  transition: width 0.3s ease;
`;

const QuotaMeta = styled.div`
  font-size: 11px;
  color: #8C8C8C;
`;

const UpgradeLink = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #E11D48;
  font-weight: 700;
  font-size: 13px;
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-family: inherit;

  &:hover { color: #BE123C; }
  svg { width: 14px; height: 14px; }
`;
```

**JSX:**
```jsx
const pct = Math.min((pitchesSentThisMonth / FREE_PITCH_LIMIT) * 100, 100);
const remaining = FREE_PITCH_LIMIT - pitchesSentThisMonth;

{subscriptionStatus === 'free' && (
  <QuotaStrip>
    <QuotaIconBox><Mail /></QuotaIconBox>
    <QuotaText>
      <QuotaTitle>
        {pitchesSentThisMonth} of {FREE_PITCH_LIMIT} brand contacts used this month
      </QuotaTitle>
      <QuotaBarTrack><QuotaBarFill $pct={pct} /></QuotaBarTrack>
      <QuotaMeta>
        {remaining > 0
          ? `${remaining} contact${remaining !== 1 ? 's' : ''} remaining · Resets in ${daysUntilReset} days`
          : 'Limit reached · Resets next month'}
      </QuotaMeta>
    </QuotaText>
    <UpgradeLink onClick={() => setShowUpgradeModal(true)}>
      <Zap /> Upgrade for unlimited
    </UpgradeLink>
  </QuotaStrip>
)}
```

### 6d. Search + filters

```jsx
const SearchRow = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
`;

const SearchWrap = styled.div`
  flex: 1;
  min-width: 240px;
  position: relative;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8C8C8C;
  pointer-events: none;
  display: grid;
  place-items: center;

  svg { width: 16px; height: 16px; }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 11px 16px 11px 42px;
  border: 1px solid #EBEBEB;
  background: white;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  font-family: inherit;
  color: #0F0F0F;

  &::placeholder { color: #8C8C8C; }
  &:focus { border-color: #0F0F0F; }
`;

const FilterPill = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  background: white;
  border: 1px solid #EBEBEB;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #4B4B4B;
  cursor: pointer;
  transition: border-color 0.15s;
  font-family: inherit;

  &:hover { border-color: #D4D4D4; }
  svg { width: 14px; height: 14px; opacity: 0.6; }
`;
```

**JSX:**
```jsx
<SearchRow>
  <SearchWrap>
    <SearchIcon><Search /></SearchIcon>
    <SearchInput
      placeholder="Search brand names..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  </SearchWrap>
  <FilterPill>All Categories <ChevronDown /></FilterPill>
  <FilterPill>All Brands <ChevronDown /></FilterPill>
  <FilterPill>All Contact Types <ChevronDown /></FilterPill>
</SearchRow>
```

### 6e. Brand grid

```jsx
const BrandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; gap: 14px; }
`;
```

### 6f. Brand card

```jsx
const Card = styled.div`
  background: white;
  border: 1px solid #EBEBEB;
  border-radius: 20px;
  padding: 18px;
  position: relative;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(15,15,15,0.04), 0 4px 16px rgba(15,15,15,0.03);

  &:hover {
    border-color: #D4D4D4;
    box-shadow: 0 8px 28px rgba(15,15,15,0.08);
    transform: translateY(-2px);
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 14px;
  left: 14px;
  background: #FFF1F3;
  color: #E11D48;
  border: 1px solid #FECDD3;
  font-size: 10px;
  font-weight: 700;
  padding: 4px 9px 4px 7px;
  border-radius: 100px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 1;
  letter-spacing: 0.3px;
  text-transform: uppercase;

  svg { width: 11px; height: 11px; }
`;

const LogoBox = styled.div`
  width: 100%;
  aspect-ratio: 2.2 / 1;
  background: #FAFAFA;
  border: 1px solid #F4F4F4;
  border-radius: 14px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  overflow: hidden;

  img {
    max-width: 70%;
    max-height: 70%;
    object-fit: contain;
  }
`;

const LogoPlaceholder = styled.div`
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -1px;
  color: #0F0F0F;
`;

const CardName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #0F0F0F;
  margin-bottom: 4px;
  letter-spacing: -0.2px;
  text-align: center;
`;

const CardDesc = styled.div`
  font-size: 12.5px;
  color: #8C8C8C;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-align: center;
`;

const CardTags = styled.div`
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  background: #F4F4F4;
  color: #4B4B4B;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 600;
`;

const FollowersTag = styled(Tag)`
  background: #FFF1F3;
  color: #E11D48;
`;

const ResponseRate = styled.div`
  text-align: center;
  color: #059669;
  font-weight: 800;
  font-size: 14px;
  margin-bottom: 4px;
`;

const CreatorsStat = styled.div`
  text-align: center;
  font-size: 11px;
  color: #8C8C8C;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;

  svg { width: 11px; height: 11px; }
`;

const StatGreen = styled.span`
  color: #059669;
  font-weight: 700;
`;

const Dot = styled.span` color: #D4D4D4; `;

const CardActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const Btn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: 1px solid transparent;
  font-family: inherit;

  svg { width: 14px; height: 14px; }
`;

const BtnContact = styled(Btn)`
  background: #0F0F0F;
  color: white;
  &:hover { background: #1C1C1C; transform: translateY(-1px); }
`;

const BtnContacted = styled(Btn)`
  background: #ECFDF5;
  color: #059669;
  border-color: #A7F3D0;
  cursor: default;
`;

const BtnSave = styled(Btn)`
  background: white;
  color: #4B4B4B;
  border-color: #EBEBEB;

  &:hover {
    background: #FFF1F3;
    color: #E11D48;
    border-color: #FECDD3;
  }
`;

const BtnSaved = styled(Btn)`
  background: #FFF1F3;
  color: #E11D48;
  border-color: #FECDD3;

  svg { fill: #E11D48; }
`;

const BtnLocked = styled(Btn)`
  background: linear-gradient(135deg, #E11D48, #7C3AED);
  color: white;

  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(225,29,72,0.25); }
`;
```

**Card JSX:**
```jsx
function BrandCard({ brand, isPro, hasPitched, isSaved, atLimit, onContact, onSave, onUpgrade }) {
  const isLocked = !isPro && brand.requires_pro;

  return (
    <Card>
      {brand.is_featured && (
        <FeaturedBadge><Sparkles /> Featured</FeaturedBadge>
      )}

      <LogoBox>
        {brand.logo_url
          ? <img src={brand.logo_url} alt={brand.brand_name} />
          : <LogoPlaceholder>{brand.brand_name?.slice(0, 3).toUpperCase()}</LogoPlaceholder>}
      </LogoBox>

      <CardName>{brand.brand_name}</CardName>
      <CardDesc>{brand.description}</CardDesc>

      <CardTags>
        {brand.category && <Tag>{brand.category}</Tag>}
        {brand.min_followers && (
          <FollowersTag>{brand.min_followers}+ followers</FollowersTag>
        )}
      </CardTags>

      {brand.response_rate != null && (
        <ResponseRate>{brand.response_rate}% response rate</ResponseRate>
      )}

      <CreatorsStat>
        {brand.total_pitches > 0 && (
          <><Users /> {brand.total_pitches} creators contacted</>
        )}
        {brand.responses_received > 0 && (
          <>
            <Dot>·</Dot>
            <StatGreen>{brand.responses_received} got response</StatGreen>
          </>
        )}
      </CreatorsStat>

      <CardActions>
        {isLocked ? (
          <BtnLocked onClick={onUpgrade}><Lock /> Pro</BtnLocked>
        ) : hasPitched ? (
          <BtnContacted><Check /> Contacted</BtnContacted>
        ) : (
          <BtnContact onClick={() => atLimit ? onUpgrade() : onContact(brand)}>
            <Mail /> Contact
          </BtnContact>
        )}

        {isSaved ? (
          <BtnSaved onClick={() => onSave(brand)}><Heart /> Saved</BtnSaved>
        ) : (
          <BtnSave onClick={() => onSave(brand)}><Heart /> Save</BtnSave>
        )}
      </CardActions>
    </Card>
  );
}
```

---

## 7. Button State Machine

| Condition | Left button | Style |
|-----------|-------------|-------|
| `brand.requires_pro && !isPro` | `🔒 Pro` | `BtnLocked` (rose→violet gradient) |
| `hasPitched === true` | `✓ Contacted` | `BtnContacted` (emerald tint) |
| `atLimit && !isPro` | `Contact` → opens `UpgradeModal` | `BtnContact` (black) |
| Default | `Contact` → opens pitch flow | `BtnContact` (black) |

| Condition | Right button |
|-----------|-------------|
| `isSaved` | `BtnSaved` — rose-tinted, filled heart icon |
| Default | `BtnSave` — white ghost, outline heart, hovers to rose |

---

## 8. Quota Strip States

| Usage | Title text | Meta text |
|-------|-----------|-----------|
| 0/3 | "0 of 3 brand contacts used this month" | "3 contacts remaining · Resets in N days" |
| 1/3 | "1 of 3 brand contacts used this month" | "2 contacts remaining · Resets in N days" |
| 2/3 | "2 of 3 brand contacts used this month" | "1 contact remaining · Resets in N days" |
| 3/3 | "3 of 3 brand contacts used this month" | "Limit reached · Resets next month" |

Bar fill: always `linear-gradient(90deg, #E11D48, #7C3AED)`. Width = `(used / 3) * 100%`.

The `⚡ Upgrade for unlimited` link is always visible for free users — don't hide it. It uses `color: #E11D48`.

---

## 9. Responsive Breakpoints

| Width | Brand grid | Top nav tabs | Mobile bottom bar |
|-------|-----------|---------------|--------------------|
| ≥ 1025px | 3 columns | Visible | Hidden |
| 641–1024px | 2 columns | Visible | Hidden |
| ≤ 640px | 1 column | **Hidden** | **Fixed bottom** |

Mobile bottom bar adds `padding-bottom: 72px` to content (already in the layout component).

---

## 10. Typography Scale

All text uses `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`.

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Wordmark | 16px | 800 | `#0F0F0F` + `#E11D48` accent |
| Nav tab (inactive) | 13.5px | 500 | `#4B4B4B` |
| Nav tab (active) | 13.5px | 600 | `#FFFFFF` on `#0F0F0F` |
| Brand name | 16px | 700 | `#0F0F0F` |
| Brand description | 12.5px | 400 | `#8C8C8C` |
| Tag | 11px | 600 | `#4B4B4B` / `#E11D48` |
| Response rate | 14px | 800 | `#059669` |
| Stat row | 11px | 400 | `#8C8C8C` |
| Button label | 13px | 600 | varies |
| Featured badge | 10px / uppercase / 0.3px tracking | 700 | `#E11D48` |
| Quota title | 13px | 600 | `#0F0F0F` |
| Quota meta | 11px | 400 | `#8C8C8C` |
| Upgrade link | 13px | 700 | `#E11D48` |
| Avatar name | 13px | 600 | `#0F0F0F` |

---

## 11. Spacing Scale

| Use | Value |
|-----|-------|
| Page side padding (desktop) | 32px |
| Page side padding (mobile) | 16px |
| Page top padding | 28px |
| Card padding | 18px |
| Card grid gap | 16px |
| Button vertical padding | 10px |
| Tag padding | 4px / 10px |
| Nav padding | 0 32px (height: 60px) |

---

## 12. Dev Checklist

**Setup**
- [ ] `npm install lucide-react`
- [ ] Add Inter font link to `public/index.html`
- [ ] Create `src/theme/tokens.js`
- [ ] Update global `body` styles (font, bg, color)
- [ ] Create `src/components/Logo.jsx`

**`CreatorDashboardLayout.js`**
- [ ] Replace old nav with new pill-tab structure
- [ ] Add 4th tab "My Kit" (icon: `FileText`, path: `/creator/dashboard/my-kit`)
- [ ] Replace all emoji icons with Lucide icons
- [ ] Active nav tab = black fill, white text (NOT white fill)
- [ ] Avatar circle uses `#E11D48` background
- [ ] Add `MobileTabBar` (fixed, ≤640px only)
- [ ] Add `padding-bottom: 72px` to mobile content

**`UnifiedBrandDirectory.js`**
- [ ] Replace quota banner with new `QuotaStrip` (icon in `#F4F4F4` box, not pink)
- [ ] Replace search + filter row with new styled components
- [ ] Replace brand cards with new `BrandCard` component
- [ ] Featured badge uses rose-tinted pill (not gold)
- [ ] Logo box uses subtle off-white bg with 1px border
- [ ] Contact button is **near-black**, not rose
- [ ] Saved state uses rose tint with filled heart icon
- [ ] Pro-locked button uses rose→violet gradient
- [ ] Wire `UpgradeModal` to: locked card, quota link, contact-when-at-limit

**QA**
- [ ] Test at 375px, 768px, 1280px viewports
- [ ] No emoji icons remain in nav, buttons, or cards
- [ ] No gradient appears outside the Pro button and quota bar fill
- [ ] All hover states work
- [ ] Heart icon fills when saved

---

## 13. What NOT to Change

- All existing state, API calls, business logic in `UnifiedBrandDirectory.js`
- `UpgradeModal.js` content (separate task)
- Backend / Flask routes
- Next.js public pages
- Authentication flow
