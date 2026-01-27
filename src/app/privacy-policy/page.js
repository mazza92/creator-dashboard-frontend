import PrivacyPolicyClient from './PrivacyPolicyClient';

export const metadata = {
  title: 'Privacy Policy | Newcollab',
  description: "Newcollab's privacy policy - Learn how we protect your data and ensure secure creator-brand collaborations.",
  alternates: {
    canonical: 'https://newcollab.co/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
