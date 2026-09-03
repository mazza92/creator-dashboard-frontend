import styled from 'styled-components';

const LogoWrap = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 28px;
  width: auto;
  max-width: 168px;
  display: block;
  object-fit: contain;
  object-position: left center;

  @media (max-width: 840px) {
    height: 22px;
    max-width: 132px;
  }
`;

export default function Logo() {
  return (
    <LogoWrap href="/creator/dashboard/for-you">
      <LogoImg src="/newcollab-logo-dark.png" alt="NEWCOLLAB" />
    </LogoWrap>
  );
}
