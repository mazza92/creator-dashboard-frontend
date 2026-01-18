import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'About | Newcollab',
  robots: { index: false, follow: false },
};

export default function AboutPage() {
  return <CraOnlyNotice title="About" path="/about" />;
}

