import PrivacyPolicyClient from './PrivacyPolicyClient';

export const metadata = {
  title: 'Privacy Policy | Newcollab',
  description: "How Newcollab collects and uses account, kit, Google Sign-In, TikTok, Instagram, analytics, and payment data. Contact team@newcollab.co.",
  alternates: {
    canonical: 'https://newcollab.co/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
