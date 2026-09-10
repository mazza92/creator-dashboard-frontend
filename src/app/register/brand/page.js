import CraOnlyNotice from '../../components/CraOnlyNotice';

export const metadata = {
  title: 'Brand sign up | Newcollab',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function BrandRegisterPage({ searchParams }) {
  const params = await searchParams;
  const qs = new URLSearchParams(params).toString();
  return <CraOnlyNotice title="Brand sign up" path={`/register/brand${qs ? `?${qs}` : ''}`} />;
}
