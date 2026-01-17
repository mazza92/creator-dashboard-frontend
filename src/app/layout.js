import { Inter } from 'next/font/google';
import './globals.css';
import StyledComponentsRegistry from './registry';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Newcollab - Creator & Brand Collaboration Platform',
  description: 'Connect creators with brands for authentic partnerships and PR packages.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
