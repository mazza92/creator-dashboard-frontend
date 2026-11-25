import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { isDirectoryCreator } from '../utils/creatorApproval';

// True for a creator who is not approved (pending or rejected) and so only has Directory access:
// paywalls and the unlock modal then sell directory unlocks, never Polly or Autopilot.
export default function useIsDirectoryCreator() {
  const ctx = useContext(UserContext);
  return isDirectoryCreator(ctx?.user);
}
