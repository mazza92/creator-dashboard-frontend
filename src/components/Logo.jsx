import styled from 'styled-components';

// Dashboard header lockup: the green "N" app icon + lowercase "newcollab" wordmark in Inter,
// the same lockup as newcollab.co and the Waitlist header (Nov 2026 revamp).
const LogoWrap = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 9px;
  text-decoration: none;
  color: #12141a;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.02em;
  line-height: 1;
  white-space: nowrap;

  &:hover { color: #12141a; }

  img {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: block;
    flex: none;
  }

  @media (max-width: 840px) {
    gap: 8px;
    font-size: 16px;
    img { width: 26px; height: 26px; border-radius: 7px; }
  }
`;

export default function Logo() {
  return (
    <LogoWrap href="/creator/dashboard/for-you" aria-label="newcollab home">
      <img src="/apple-touch-icon.png" alt="" aria-hidden="true" width={30} height={30} />
      newcollab
    </LogoWrap>
  );
}
