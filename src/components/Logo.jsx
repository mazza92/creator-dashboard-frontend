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
  border-radius: 9px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
      <LogoMark>
        <img src="/logo.png" alt="NewCollab" />
      </LogoMark>
      <Wordmark>new<span>collab</span></Wordmark>
    </LogoWrap>
  );
}
