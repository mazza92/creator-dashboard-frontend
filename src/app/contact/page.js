import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'Contact | Newcollab',
  robots: { index: false, follow: false },
};

export default function ContactPage() {
  return <CraOnlyNotice title="Contact" path="/contact" />;
}

