import CraOnlyNotice from '../../components/CraOnlyNotice';

export const metadata = {
  title: 'Brand sign up | Newcollab',
  robots: { index: false, follow: false },
};

export default function BrandRegisterPage() {
  return <CraOnlyNotice title="Brand sign up" path="/register/brand" />;
}

