import ContactClient from './ContactClient';

export const metadata = {
  title: 'Contact Us | Newcollab',
  description: 'Have questions about Newcollab? Get in touch with our team. We help creators and brands connect for PR packages and paid partnerships.',
  alternates: {
    canonical: 'https://newcollab.co/contact',
  },
  openGraph: {
    title: 'Contact Us | Newcollab',
    description: 'Have questions about Newcollab? Get in touch with our team.',
    type: 'website',
    url: 'https://newcollab.co/contact',
    siteName: 'Newcollab',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
