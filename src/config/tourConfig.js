console.log('Loading tour configuration...');

export const tourSteps = {
  payments: [
    {
      target: '.stripe-connect-section',
      content: 'Connect your Stripe account to start receiving payments from brands. This is your first step to monetizing your content!',
      title: 'Welcome to NewCollab! 👋',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.payment-info-section',
      content: 'Here you can see how payments work. You\'ll receive 85% of each booking, with our platform fee automatically handled.',
      title: 'Understanding Payments 💰',
      placement: 'top',
    },
    {
      target: '.payment-methods-section',
      content: 'We support multiple payment methods. Currently, we use Stripe for direct bank transfers, with more options coming soon!',
      title: 'Payment Methods 💳',
      placement: 'left',
    },
    {
      target: '.support-section',
      content: 'Need help? Our support team is always here to assist you with any questions about payments or the platform.',
      title: 'We\'re Here to Help! 🎯',
      placement: 'top',
    }
  ],
  bookings: [
    {
      target: '.bookings-header',
      content: 'View and manage all your brand collaborations in one place. Track status, deliverables, and payments.',
      title: 'Your Bookings 📅',
      placement: 'bottom',
      disableBeacon: true,
      spotlightPadding: 5,
      disableOverlay: false,
      disableOverlayClose: false,
      spotlightClicks: true,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    },
    {
      target: '.booking-filters',
      content: 'Filter your bookings by status, date, or brand to find exactly what you\'re looking for.',
      title: 'Smart Filtering 🔍',
      placement: 'bottom',
      spotlightPadding: 5,
      disableOverlay: false,
      disableOverlayClose: false,
      spotlightClicks: true,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    },
    {
      target: '.booking-actions',
      content: 'Submit deliverables, communicate with brands, and track your progress all in one place.',
      title: 'Manage Collaborations 🎯',
      placement: 'left',
      spotlightPadding: 5,
      disableOverlay: false,
      disableOverlayClose: false,
      spotlightClicks: true,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    },
    {
      target: '.booking-stats',
      content: 'Keep track of your performance with real-time statistics and earnings overview.',
      title: 'Track Your Success 📊',
      placement: 'top',
      spotlightPadding: 5,
      disableOverlay: false,
      disableOverlayClose: false,
      spotlightClicks: true,
      styles: {
        options: {
          zIndex: 10000
        }
      }
    }
  ],
  contentBids: [
    {
      target: '.content-bids-header',
      content: 'Browse and bid on content creation opportunities from brands looking for creators like you.',
      title: 'Content Opportunities 💡',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.bids-filters',
      content: 'Filter opportunities by category, budget, or requirements to find the perfect match.',
      title: 'Find Your Match 🎯',
      placement: 'bottom',
    },
    {
      target: '.active-bids',
      content: 'Submit your proposal with your creative ideas, pricing, and timeline to win the project.',
      title: 'Make Your Pitch 📝',
      placement: 'left',
    },
    {
      target: '.bid-stats',
      content: 'Track your bid history and success rate to improve your proposals over time.',
      title: 'Track Your Success 📊',
      placement: 'top',
    }
  ],
  profile: [
    {
      target: '.profile-header',
      content: 'Your creator profile is your digital portfolio. Make it stand out to attract more brands!',
      title: 'Your Profile 👤',
      placement: 'bottom',
      disableBeacon: true,
    },
    {
      target: '.profile-info',
      content: 'Showcase your best work and highlight your unique style to attract the right brands.',
      title: 'Portfolio Showcase 🎨',
      placement: 'bottom',
    },
    {
      target: '.account-settings',
      content: 'Track your performance metrics and growth over time.',
      title: 'Your Stats 📈',
      placement: 'left',
    },
    {
      target: '.preferences',
      content: 'Set your preferences for content types, pricing, and availability.',
      title: 'Your Preferences ⚙️',
      placement: 'top',
    }
  ]
};

console.log('Tour steps loaded:', tourSteps);

export const tourStyles = {
  options: {
    primaryColor: '#26A69A',
    zIndex: 10000,
    arrowColor: '#fff',
    backgroundColor: '#fff',
    overlayColor: 'rgba(0, 0, 0, 0.5)',
    textColor: '#333',
    spotlightPadding: 5,
    disableOverlay: false,
    disableOverlayClose: false,
    spotlightClicks: true
  },
  tooltipContainer: {
    textAlign: 'left',
    padding: '20px',
  },
  buttonNext: {
    backgroundColor: '#26A69A',
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '4px',
  },
  buttonBack: {
    marginRight: 10,
    color: '#666',
  },
  buttonSkip: {
    color: '#666',
  },
  tooltip: {
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  spotlight: {
    borderRadius: '8px',
  }
};

console.log('Tour styles loaded:', tourStyles); 