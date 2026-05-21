import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../utils/api';
import { UserContext } from '../../contexts/UserContext';
import { Helmet } from 'react-helmet-async';
import { FaInstagram, FaTiktok, FaYoutube, FaPinterest, FaXTwitter } from 'react-icons/fa6';
import { HiOutlinePencilSquare } from 'react-icons/hi2';

// ============================================================================
// V4 ONBOARDING - 3-step flow
// Step 1: Username + Platform + Followers
// Step 2: Bio + Audience age range
// Step 3: Niche selection
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
  justify-content: flex-start;
  box-sizing: border-box;
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
`;

const LogoMark = styled.div`
  width: 28px;
  height: 28px;
  background: ${colors.black};
  border-radius: 7px;
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 900;
  font-size: 13px;
`;

const LogoWord = styled.span`
  font-size: 15px;
  font-weight: 800;
  color: ${colors.text};
  letter-spacing: -0.3px;
  em { color: ${colors.rose}; font-style: normal; }
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

const ProgressWrap = styled.div`
  margin-bottom: 26px;
`;

const ProgressTop = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${colors.text3};
  margin-bottom: 7px;
`;

const ProgressPct = styled.span`
  color: ${colors.black};
`;

const ProgressTrack = styled.div`
  height: 3px;
  background: ${colors.border};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 3px;
  background: ${colors.black};
  transition: width 0.4s ease;
  width: ${props => props.$pct}%;
`;

const Headline = styled.h2`
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
  color: ${colors.black};
`;

const Subline = styled.p`
  font-size: 14px;
  color: ${colors.text2};
  line-height: 1.6;
  margin-bottom: 18px;
`;

const FormGroup = styled.div`
  margin-bottom: 14px;
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

const InputPre = styled.span`
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: ${colors.text3};
  pointer-events: none;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  padding-left: ${props => props.$hasPrefix ? '38px' : '14px'};
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

const PlatformGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 14px;
`;

const PlatformChip = styled.div`
  border: 1.5px solid ${props => props.$selected ? colors.black : colors.border};
  background: ${props => props.$selected ? '#F8F8F8' : '#fff'};
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;

  &:hover { border-color: #ccc; }

  ${props => props.$selected && `
    &::after {
      content: '\\2713';
      position: absolute;
      top: 6px;
      right: 7px;
      font-size: 9px;
      font-weight: 900;
      color: ${colors.black};
    }
  `}
`;

const PlatformIcon = styled.div`
  font-size: 19px;
  margin-bottom: 4px;
`;

const PlatformName = styled.div`
  font-size: 10.5px;
  font-weight: 700;
  color: ${colors.text2};
`;

const FollowerReveal = styled.div`
  display: ${props => props.$show ? 'flex' : 'none'};
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  background: #F9F9F9;
  border: 1.5px solid ${colors.border};
  border-radius: 10px;
  margin-bottom: 14px;
`;

const FollowerLabel = styled.span`
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

const FollowerInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: ${colors.text};
  outline: none;
  &::placeholder { color: ${colors.text3}; }
`;

const BtnRow = styled.div`
  display: flex;
  gap: 9px;
  margin-top: 16px;
`;

const BackBtn = styled.button`
  background: transparent;
  color: ${colors.text2};
  border: 1.5px solid ${colors.border};
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  flex-shrink: 0;

  &:hover { background: #f5f5f5; }
  &:active { transform: scale(0.98); }
`;

const ContinueBtn = styled.button`
  flex: 1;
  padding: 13px 16px;
  border-radius: 12px;
  border: none;
  background: ${colors.black};
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.15s;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover:not(:disabled) { background: #1a1a1a; }
  &:active:not(:disabled) { transform: scale(0.98); }
`;

const SkipLink = styled.span`
  display: block;
  text-align: center;
  font-size: 12.5px;
  font-weight: 600;
  color: ${colors.text3};
  margin-top: 10px;
  cursor: pointer;
  &:hover { color: ${colors.text2}; }
`;

// Step 2 styles
const Teaser = styled.div`
  background: #FFF8F9;
  border: 1px solid #FECDD3;
  border-radius: 12px;
  padding: 13px 15px;
  margin-bottom: 18px;
  font-size: 13px;
  color: ${colors.text2};
  line-height: 1.5;
  strong { color: ${colors.rose}; font-weight: 800; }
`;

const NicheGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 18px;
`;

const NicheChip = styled.div`
  padding: 8px 13px;
  border: 1.5px solid ${props => props.$selected ? colors.black : colors.border};
  background: ${props => props.$selected ? colors.black : '#fff'};
  color: ${props => props.$selected ? '#fff' : colors.text2};
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover { border-color: ${props => props.$selected ? colors.black : '#bbb'}; }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid ${colors.border};
  border-radius: 11px;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  color: ${colors.text};
  background: #fff;
  outline: none;
  resize: vertical;
  min-height: 90px;
  transition: border-color 0.15s, box-shadow 0.15s;
  box-sizing: border-box;
  &:focus {
    border-color: ${colors.black};
    box-shadow: 0 0 0 3px rgba(15,15,15,.06);
  }
  &::placeholder { color: ${colors.text3}; }
`;

const AgeGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 4px;
`;

const AgeChip = styled.div`
  padding: 7px 13px;
  border: 1.5px solid ${props => props.$selected ? colors.black : colors.border};
  background: ${props => props.$selected ? colors.black : '#fff'};
  color: ${props => props.$selected ? '#fff' : colors.text2};
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  &:hover { border-color: ${props => props.$selected ? colors.black : '#bbb'}; }
`;

const CharCount = styled.span`
  font-size: 11px;
  color: ${colors.text3};
  float: right;
  margin-top: 4px;
`;

const AvatarUpload = styled.label`
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
`;

const AvatarCircle = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${props => props.$hasPhoto ? 'transparent' : '#F3F3F3'};
  border: 2px dashed ${props => props.$hasPhoto ? colors.black : colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color 0.15s;
  &:hover { border-color: ${colors.black}; }
`;

const AvatarImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
`;

const AvatarHint = styled.div`
  font-size: 13px;
  color: ${colors.text2};
  line-height: 1.5;
  strong { display: block; font-size: 13px; font-weight: 700; color: ${colors.text}; margin-bottom: 2px; }
`;

const ErrorMsg = styled.div`
  color: ${colors.rose};
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
`;

const PLATFORMS = [
  { id: 'instagram', icon: <FaInstagram color="#E4405F" />, name: 'Instagram', label: 'Followers' },
  { id: 'tiktok', icon: <FaTiktok color="#000000" />, name: 'TikTok', label: 'Followers' },
  { id: 'youtube', icon: <FaYoutube color="#FF0000" />, name: 'YouTube', label: 'Subscribers' },
  { id: 'pinterest', icon: <FaPinterest color="#E60023" />, name: 'Pinterest', label: 'Monthly views' },
  { id: 'twitter', icon: <FaXTwitter color="#000000" />, name: 'X / Twitter', label: 'Followers' },
  { id: 'blog', icon: <HiOutlinePencilSquare color="#6B7280" />, name: 'Blog', label: 'Readers/mo' },
];

const NICHES = [
  { id: 'beauty', label: '💄 Beauty' },
  { id: 'fashion', label: '👗 Fashion' },
  { id: 'food', label: '🍽️ Food' },
  { id: 'fitness', label: '💪 Fitness' },
  { id: 'travel', label: '✈️ Travel' },
  { id: 'lifestyle', label: '🏠 Lifestyle' },
  { id: 'tech', label: '💻 Tech' },
  { id: 'wellness', label: '🌿 Wellness' },
  { id: 'education', label: '📚 Education' },
  { id: 'gaming', label: '🎮 Gaming' },
  { id: 'pets', label: '🐾 Pets' },
  { id: 'parenting', label: '🍼 Parenting' },
];

const AGE_RANGES = [
  { id: '13-17', label: '13–17' },
  { id: '18-24', label: '18–24' },
  { id: '25-34', label: '25–34' },
  { id: '35-44', label: '35–44' },
  { id: '45-54', label: '45–54' },
  { id: '55+',   label: '55+' },
];

const REGIONS = [
  { id: 'US',     label: '🇺🇸 United States' },
  { id: 'UK',     label: '🇬🇧 United Kingdom' },
  { id: 'Canada', label: '🇨🇦 Canada' },
  { id: 'Europe', label: '🇪🇺 Europe' },
  { id: 'LATAM',  label: '🌎 Latin America' },
  { id: 'MENA',   label: '🌍 Middle East & Africa' },
  { id: 'Asia',   label: '🌏 Asia Pacific' },
  { id: 'Global', label: '🌐 Global' },
];

export default function CreatorOnboarding() {
  const [step, setStep] = useState(1);
  // Step 1
  const [username, setUsername] = useState('');
  const [platform, setPlatform] = useState('');
  const [followers, setFollowers] = useState('');
  // Step 2
  const [bio, setBio] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [regions, setRegions] = useState([]);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  // Step 3
  const [niches, setNiches] = useState([]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useContext(UserContext);

  const selectedPlatform = PLATFORMS.find(p => p.id === platform);

  const toggleNiche = (id) => {
    setNiches(prev =>
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
    setError('');
  };

  const handleStep1 = async () => {
    setError('');
    if (!username.trim()) { setError('Username is required'); return; }
    if (!platform) { setError('Please select your main platform'); return; }
    if (!followers || parseInt(followers) <= 0) { setError('Please enter your follower count'); return; }
    setLoading(true);
    try {
      await apiClient.post('/api/user/onboarding/step1', {
        username: username.trim(),
        platform,
        followers: parseInt(followers),
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggleRegion = (id) => {
    setRegions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
    setError('');
  };

  const compressImage = (file, maxSizeBytes = 3 * 1024 * 1024) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        // Scale down if too large
        const MAX_DIM = 1200;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        // Try progressively lower quality until under maxSizeBytes
        let quality = 0.85;
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (blob.size <= maxSizeBytes || quality <= 0.3) {
              resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
            } else {
              quality -= 0.1;
              tryCompress();
            }
          }, 'image/jpeg', quality);
        };
        tryCompress();
      };
      img.src = url;
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    // Compress before storing — keeps upload under Vercel's 4.5MB limit
    const compressed = await compressImage(file);
    setPhotoFile(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  };

  const handleStep2 = async () => {
    setError('');
    if (!photoFile) { setError('Please upload a profile photo'); return; }
    if (!bio.trim()) { setError('Please write a short bio'); return; }
    if (!ageRange) { setError('Please select your audience age range'); return; }
    if (regions.length === 0) { setError('Please select at least one region'); return; }
    setLoading(true);
    try {
      // Upload photo first
      if (photoFile) {
        const formData = new FormData();
        formData.append('image', photoFile);
        await apiClient.post('/profile/update-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      await apiClient.post('/api/user/onboarding/step2', {
        bio: bio.trim(),
        primary_age_range: ageRange,
        regions,
      });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    setError('');
    if (niches.length === 0) { setError('Select at least one niche'); return; }
    setLoading(true);
    try {
      const res = await apiClient.post('/api/user/onboarding/step3', { niches });
      // Refresh user context so creator_id is set before navigating to dashboard
      // This prevents the incomplete-profile guard from redirecting back to /onboarding
      await refreshUser();
      sessionStorage.setItem('justCompletedOnboarding', 'true');
      const redirectUrl = res.data?.redirect || '/creator/dashboard/pr-brands';
      try {
        const urlObj = new URL(redirectUrl, window.location.origin);
        navigate(urlObj.pathname + urlObj.search + urlObj.hash, { replace: true });
      } catch (e) {
        navigate('/creator/dashboard/pr-brands', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Complete Your Profile | NewCollab</title>
        <meta name="description" content="Tell us about yourself so we can match you with the right brands." />
      </Helmet>

      <PageWrapper>
        <TopBar>
          <Logo href="#">
            <LogoMark>N</LogoMark>
            <LogoWord>new<em>collab</em></LogoWord>
          </Logo>
        </TopBar>

        {step === 1 && (
          <Card>
            <ProgressWrap>
              <ProgressTop>
                <span>Step 1 of 3</span>
                <ProgressPct>33%</ProgressPct>
              </ProgressTop>
              <ProgressTrack>
                <ProgressFill $pct={33} />
              </ProgressTrack>
            </ProgressWrap>

            <Headline>Quick, where do you create?</Headline>
            <Subline>We'll match you with brands actively looking for creators on your platform.</Subline>

            <FormGroup>
              <FormLabel>Your creator handle</FormLabel>
              <InputWrap>
                <InputPre>@</InputPre>
                <FormInput
                  $hasPrefix
                  type="text"
                  placeholder="yourcreatorname"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  disabled={loading}
                  autoFocus
                />
              </InputWrap>
            </FormGroup>

            <FormGroup>
              <FormLabel>Main platform</FormLabel>
              <PlatformGrid>
                {PLATFORMS.map(p => (
                  <PlatformChip
                    key={p.id}
                    $selected={platform === p.id}
                    onClick={() => setPlatform(p.id)}
                  >
                    <PlatformIcon style={p.id === 'twitter' ? { fontSize: 17, fontWeight: 900 } : {}}>
                      {p.icon}
                    </PlatformIcon>
                    <PlatformName>{p.name}</PlatformName>
                  </PlatformChip>
                ))}
              </PlatformGrid>

              <FollowerReveal $show={!!platform}>
                <FollowerLabel>{selectedPlatform?.label}</FollowerLabel>
                <FollowerInput
                  type="number"
                  placeholder="e.g. 12,500"
                  value={followers}
                  onChange={(e) => setFollowers(e.target.value)}
                  disabled={loading}
                />
              </FollowerReveal>
            </FormGroup>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <BtnRow>
              <ContinueBtn onClick={handleStep1} disabled={loading || !username.trim() || !platform || !followers || parseInt(followers) <= 0}>
                {loading ? 'Saving...' : 'Continue →'}
              </ContinueBtn>
            </BtnRow>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <ProgressWrap>
              <ProgressTop>
                <span>Step 2 of 3</span>
                <ProgressPct>66%</ProgressPct>
              </ProgressTop>
              <ProgressTrack>
                <ProgressFill $pct={66} />
              </ProgressTrack>
            </ProgressWrap>

            <Headline>Tell brands about yourself</Headline>
            <Subline>Complete your profile so brands know who they're working with.</Subline>

            <FormGroup>
              <FormLabel>Profile photo</FormLabel>
              <AvatarUpload htmlFor="avatar-upload">
                <AvatarCircle $hasPhoto={!!photoPreview}>
                  {photoPreview
                    ? <AvatarImg src={photoPreview} alt="preview" />
                    : <span style={{ fontSize: 24, color: colors.text3 }}>+</span>
                  }
                </AvatarCircle>
                <AvatarHint>
                  <strong>{photoPreview ? 'Photo selected ✓' : 'Upload a photo'}</strong>
                  JPG, PNG or WebP · auto-compressed
                </AvatarHint>
              </AvatarUpload>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handlePhotoChange}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Your bio</FormLabel>
              <Textarea
                placeholder="e.g. Beauty & skincare creator based in NYC. I help brands connect with women 25–34 who care about clean ingredients."
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 200))}
                disabled={loading}
              />
              <CharCount>{bio.length}/200</CharCount>
            </FormGroup>

            <FormGroup>
              <FormLabel>Audience age range</FormLabel>
              <AgeGrid>
                {AGE_RANGES.map(a => (
                  <AgeChip
                    key={a.id}
                    $selected={ageRange === a.id}
                    onClick={() => setAgeRange(prev => prev === a.id ? '' : a.id)}
                  >
                    {a.label}
                  </AgeChip>
                ))}
              </AgeGrid>
            </FormGroup>

            <FormGroup>
              <FormLabel>Audience region(s)</FormLabel>
              <AgeGrid>
                {REGIONS.map(r => (
                  <AgeChip
                    key={r.id}
                    $selected={regions.includes(r.id)}
                    onClick={() => toggleRegion(r.id)}
                  >
                    {r.label}
                  </AgeChip>
                ))}
              </AgeGrid>
            </FormGroup>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <BtnRow>
              <BackBtn onClick={() => setStep(1)} disabled={loading}>← Back</BackBtn>
              <ContinueBtn onClick={handleStep2} disabled={loading || !photoFile || !bio.trim() || !ageRange || regions.length === 0}>
                {loading ? 'Saving...' : 'Continue →'}
              </ContinueBtn>
            </BtnRow>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <ProgressWrap>
              <ProgressTop>
                <span>Step 3 of 3</span>
                <ProgressPct>Almost done</ProgressPct>
              </ProgressTop>
              <ProgressTrack>
                <ProgressFill $pct={90} />
              </ProgressTrack>
            </ProgressWrap>

            <Headline>What kind of content do you make?</Headline>
            <Subline>Pick your niches and we'll show you brands actively looking for your type of content.</Subline>

            <Teaser>
              Creators who select a niche see <strong>3× more relevant brands</strong> in their feed — and get replies faster.
            </Teaser>

            <NicheGrid>
              {NICHES.map(n => (
                <NicheChip
                  key={n.id}
                  $selected={niches.includes(n.id)}
                  onClick={() => toggleNiche(n.id)}
                >
                  {n.label}
                </NicheChip>
              ))}
            </NicheGrid>

            {error && <ErrorMsg>{error}</ErrorMsg>}

            <BtnRow>
              <BackBtn onClick={() => setStep(2)} disabled={loading}>← Back</BackBtn>
              <ContinueBtn onClick={handleStep3} disabled={loading || niches.length === 0}>
                {loading ? 'Finishing...' : 'Show my brand matches →'}
              </ContinueBtn>
            </BtnRow>
          </Card>
        )}
      </PageWrapper>
    </>
  );
}
