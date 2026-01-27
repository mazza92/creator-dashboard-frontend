import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'Log in | Newcollab',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <CraOnlyNotice title="Log in" path="/login" />;
}

