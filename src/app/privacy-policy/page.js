import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'Privacy Policy | Newcollab',
  robots: { index: false, follow: false },
};

export default function PrivacyPolicyPage() {
  return <CraOnlyNotice title="Privacy Policy" path="/privacy-policy" />;
}

