import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import StyledComponentsRegistry from './registry';
import { AnalyticsProviderNext } from './components/AnalyticsProviderNext';

const inter = Inter({ subsets: ['latin'] });

// GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-5RET5C6MZ8';

export const metadata = {
  title: 'Newcollab - Creator & Brand Collaboration Platform',
  description: 'Connect creators with brands for authentic partnerships and PR packages.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics with cross-domain tracking */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              linker: {
                domains: ['newcollab.co', 'app.newcollab.co'],
                accept_incoming: true
              }
            });
          `}
        </Script>
      </head>
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
