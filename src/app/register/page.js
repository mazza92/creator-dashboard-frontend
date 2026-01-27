import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'Sign up | Newcollab',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return <CraOnlyNotice title="Sign up" path="/register" />;
}

