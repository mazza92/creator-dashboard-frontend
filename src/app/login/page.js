import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'Log in | Newcollab',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <CraOnlyNotice title="Log in" path="/login" />;
}

