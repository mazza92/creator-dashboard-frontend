import CraOnlyNotice from '../../components/CraOnlyNotice';

export const metadata = {
  title: 'Creator sign up | Newcollab',
  robots: { index: false, follow: false },
};

export default function CreatorRegisterPage() {
  return <CraOnlyNotice title="Creator sign up" path="/register/creator" />;
}

