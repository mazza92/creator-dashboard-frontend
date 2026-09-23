import TermsClient from './TermsClient';

export const metadata = {
  title: 'Terms of Service | Newcollab',
  description: "Newcollab terms: gifted PR, Creator Pro, brand roster seats, UGC usage, subscriptions, and acceptable use. Contact team@newcollab.co.",
  alternates: {
    canonical: 'https://newcollab.co/terms-of-service',
  },
};

export default function TermsPage() {
  return <TermsClient />;
}
