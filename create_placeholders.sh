#!/bin/bash

# Function to create a basic React component
create_component() {
    local filepath="$1"
    local componentName=$(basename "$filepath" .js)
    
    cat > "$filepath" << COMPONENT
import React from 'react';

function ${componentName}() {
  return <div>${componentName} - Placeholder</div>;
}

export default ${componentName};
COMPONENT
}

# Create all missing components
components=(
  "src/contexts/NotificationContext.js"
  "src/contexts/AnalyticsContext.js"
  "src/contexts/AuthContext.js"
  "src/components/LoadingSpinner.js"
  "src/Layouts/DashboardLayout.js"
  "src/Layouts/CreatorDashboardLayout.js"
  "src/Layouts/ProfileLayoutWrapper.js"
  "src/Layouts/LandingPageLayout.js"
  "src/pages/Marketplace.js"
  "src/pages/AboutPage.js"
  "src/pages/BlogPage.js"
  "src/pages/BlogPost.js"
  "src/pages/ContactPage.js"
  "src/pages/PrivacyPolicy.js"
  "src/pages/TermsOfService.js"
  "src/pages/BrandPRPackagesPage.js"
  "src/pages/LandingPage.js"
  "src/components/Login.js"
  "src/components/forms/Signup.js"
  "src/components/forms/BrandOnboardingForm.js"
  "src/components/forms/CreatorSignup.js"
  "src/components/forms/CreatorOnboarding.js"
  "src/components/forms/SuccessPage.js"
  "src/components/BrandOverview.js"
  "src/components/BrandBookings.js"
  "src/components/CreatorBookings.js"
  "src/components/Profile.js"
  "src/components/BrandProfilePage.js"
  "src/components/ForgotPassword.js"
  "src/components/ResetPassword.js"
  "src/components/VerifyEmailPending.js"
  "src/components/VerifyEmail.js"
  "src/components/ResendVerification.js"
  "src/components/StripeSuccess.js"
  "src/components/PublicCreatorProfile.js"
  "src/components/SponsorOpportunities.js"
  "src/components/IndexNowInitializer.js"
  "src/components/IndexNowTest.js"
  "src/creator-portal/CreatorOverview.js"
  "src/creator-portal/ManagePackages.js"
  "src/creator-portal/Listing.js"
  "src/creator-portal/ProfilePage.js"
  "src/creator-portal/PaymentsPage.js"
  "src/creator-portal/CampaignInvites.js"
  "src/creator-portal/FirstAdSlot.js"
  "src/creator-portal/PROffers.js"
  "src/creator-portal/FirstAdSlotSuccess.js"
  "src/creator-portal/SponsorOffers.js"
  "src/brand-portal/BrandPROffers.js"
  "src/brand-portal/BrandMarketplace.js"
)

for comp in "${components[@]}"; do
  create_component "$comp"
  echo "Created $comp"
done

echo "All placeholder components created!"
