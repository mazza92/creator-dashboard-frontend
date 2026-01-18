import CraOnlyNotice from '../components/CraOnlyNotice';

export const metadata = {
  title: 'Marketplace | Newcollab',
  robots: { index: false, follow: false },
};

export default function MarketplacePage() {
  return <CraOnlyNotice title="Marketplace" path="/marketplace" />;
}

