import { Inter } from 'next/font/google';
import './globals.css';
import StyledComponentsRegistry from './registry';
import { AnalyticsProviderNext } from './components/AnalyticsProviderNext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Newcollab - Creator & Brand Collaboration Platform',
  description: 'Connect creators with brands for authentic partnerships and PR packages.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          {/* AnalyticsProviderNext handles its own internal Suspense for
              useSearchParams — children are NOT inside a Suspense boundary,
              so Next.js fully SSRs every page. */}
          <AnalyticsProviderNext>{children}</AnalyticsProviderNext>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
