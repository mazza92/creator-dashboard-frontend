import TermsClient from './TermsClient';

export const metadata = {
  title: 'Terms of Service | Newcollab',
  description: "Newcollab's terms of service - Learn about the rules and guidelines for using our creator-brand collaboration platform.",
  alternates: {
    canonical: 'https://newcollab.co/terms-of-service',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
