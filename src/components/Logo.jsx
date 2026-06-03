import styled from 'styled-components';

const LogoWrap = styled.a`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const LogoImg = styled.img`
  height: 24px;
  width: auto;
  display: block;
`;

export default function Logo() {
  return (
    <LogoWrap href="/creator/dashboard/for-you">
      <LogoImg src="/newcollab-logo-dark.png" alt="NEWCOLLAB" />
    </LogoWrap>
  );
}
