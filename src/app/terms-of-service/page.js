import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'Terms of Service | Newcollab',
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return <CraOnlyNotice title="Terms of Service" path="/terms-of-service" />;
}

