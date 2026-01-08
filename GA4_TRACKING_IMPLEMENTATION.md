# GA4 Event Tracking Implementation

## Overview
This document outlines the comprehensive Google Analytics 4 (GA4) event tracking implementation for Newcollab. All tracking uses GA4 recommended events and custom parameters to provide detailed insights into user behavior.

## GA4 Measurement ID
- **Measurement ID**: `G-5RET5C6MZ8`
- **Setup Location**: `public/index.html`

## Tracked Events

### 1. User Registration & Account Creation

#### `sign_up` (GA4 Recommended Event)
- **When**: New account created
- **Parameters**:
  - `method`: Sign up method (e.g., 'email', 'google', 'facebook')
  - `user_type`: 'creator' or 'brand'
  - `email`: User email (if available)
  - `username`: Creator username (for creators)
  - `brand_name`: Brand name (for brands)
  - `brand_id`: Brand ID (for brands)

**Also tracked as**: `new_account` (custom event for backward compatibility)

**Integration Points**:
- `src/components/forms/CreatorSignup.js` - Creator account creation
- `src/components/forms/BrandOnboardingForm.js` - Brand account creation

---

### 2. User Onboarding

#### `onboarding_complete` (Custom Event)
- **When**: User completes onboarding process
- **Parameters**:
  - `user_type`: 'creator' or 'brand'
  - `completion_time`: Time taken to complete (optional)

**Also tracked as**: `conversion` event

**Integration Points**:
- `src/components/forms/CreatorOnboarding.js` - Creator onboarding completion
- `src/components/forms/BrandOnboardingForm.js` - Brand onboarding completion

#### `signup_step` (Custom Event)
- **When**: User progresses through onboarding steps
- **Parameters**:
  - `step_number`: Current step number
  - `step_name`: Name of the step

**Integration Points**:
- `src/components/forms/CreatorOnboarding.js` - Step progression tracking

---

### 3. Ad Slot/Campaign Publishing

#### `ad_slot_published` (Custom Event)
- **When**: Brand publishes a new campaign/ad slot
- **Parameters**:
  - `item_id`: Campaign ID
  - `item_name`: Campaign name
  - `item_category`: 'ad_slot'
  - `currency`: Currency code (e.g., 'USD', 'EUR')
  - `value`: Budget amount
  - `user_type`: 'brand'
  - `number_of_creators`: Number of creators needed
  - `target_locations`: Array of target locations
  - `deliverables`: Array of deliverables

**Also tracked as**:
- `generate_lead` (GA4 recommended event for brands)
- `view_item` (GA4 recommended event)

**Integration Points**:
- `src/components/CreateCampaign.js` - Campaign publishing

---

### 4. User Interactions

#### `login` (GA4 Recommended Event)
- **When**: User logs in
- **Parameters**:
  - `method`: Login method (e.g., 'email', 'google')
  - `user_type`: 'creator' or 'brand' (if available)

**Integration Points**: To be added to login components

#### `view_item` (GA4 Recommended Event)
- **When**: User views a specific item (campaign, creator profile, etc.)
- **Parameters**:
  - `currency`: Currency code
  - `value`: Item value/price
  - `items`: Array of item objects with:
    - `item_id`: Item identifier
    - `item_name`: Item name
    - `item_category`: Item category
    - `brand`: Brand name (if applicable)
    - `creator`: Creator username (if applicable)

**Available via**: `trackViewItem()` function

#### `view_item_list` (GA4 Recommended Event)
- **When**: User views a list of items (marketplace, campaigns list, etc.)
- **Parameters**:
  - `item_list_id`: ID of the list
  - `item_list_name`: Name of the list (e.g., 'Marketplace', 'My Campaigns')
  - `items`: Array of items in the list

**Available via**: `trackViewItemList()` function

---

### 5. Booking & Applications

#### `begin_checkout` (GA4 Recommended Event)
- **When**: User starts booking/applying for a campaign
- **Parameters**:
  - `currency`: Currency code
  - `value`: Booking value
  - `items`: Array with campaign/item details

**Available via**: `trackBeginCheckout()` function

#### `submit_application` (Custom Event)
- **When**: Creator submits an application for a campaign
- **Parameters**:
  - `campaign_id`: Campaign identifier
  - `campaign_name`: Campaign name
  - `user_type`: 'creator'
  - `bid_amount`: Bid amount
  - `currency`: Currency code

**Available via**: `trackApplicationSubmitted()` function

#### `purchase` (GA4 Recommended Event)
- **When**: Successful booking/collaboration confirmed
- **Parameters**:
  - `transaction_id`: Booking/transaction ID
  - `value`: Transaction value
  - `currency`: Currency code
  - `items`: Array with collaboration details

**Available via**: `trackPurchase()` function

---

### 6. Profile Views

#### `view_item` (Custom Profile View)
- **When**: User views a creator or brand profile
- **Parameters**:
  - `profile_type`: 'creator' or 'brand'
  - `items`: Array with profile details

**Available via**: `trackProfileView()` function

---

### 7. Form Interactions

#### `form_submit` (Custom Event)
- **When**: Form is submitted
- **Parameters**:
  - `form_name`: Name of the form
  - `success`: Boolean indicating success/failure

**Integration Points**:
- Registration forms
- Onboarding forms
- Application forms

#### `button_click` (Custom Event)
- **When**: User clicks a button
- **Parameters**:
  - `button_name`: Name/label of button
  - `button_location`: Page/section where button is located

**Available via**: `trackButtonClick()` function

---

### 8. Error Tracking

#### `exception` (GA4 Recommended Event)
- **When**: Error occurs in the application
- **Parameters**:
  - `description`: Error message
  - `fatal`: Boolean (false for non-critical errors)
  - `error_type`: Type of error

**Available via**: `trackError()` function

---

## Analytics Context API

All tracking functions are available through the `useAnalytics()` hook:

```javascript
import { useAnalytics } from '../contexts/AnalyticsContext';

function MyComponent() {
  const { 
    trackSignUp,
    trackLogin,
    trackAdSlotPublished,
    trackViewItem,
    trackViewItemList,
    trackBeginCheckout,
    trackPurchase,
    trackProfileView,
    trackApplicationSubmitted,
    trackOnboardingComplete,
    trackSignupStep,
    trackFormSubmission,
    trackButtonClick,
    trackError
  } = useAnalytics();
  
  // Use tracking functions
  trackSignUp('email', 'creator', { email: 'user@example.com' });
}
```

## Recommended GA4 Reports to Create

1. **User Registration Funnel**
   - Report: `sign_up` events by `user_type`
   - Dimensions: `method`, `user_type`
   - Metrics: Event count, Unique users

2. **Onboarding Completion Rate**
   - Report: `onboarding_complete` events
   - Dimensions: `user_type`, `completion_time`
   - Metrics: Event count, Conversion rate

3. **Ad Slot Publishing Activity**
   - Report: `ad_slot_published` events
   - Dimensions: `user_type`, `currency`, `number_of_creators`
   - Metrics: Event count, Total revenue (`value`)

4. **Campaign Views & Interactions**
   - Report: `view_item` events
   - Dimensions: `item_category`, `brand`, `creator`
   - Metrics: Event count, Unique users

5. **Application Funnel**
   - Report: `begin_checkout` → `submit_application` → `purchase`
   - Dimensions: `user_type`, `campaign_id`
   - Metrics: Funnel conversion rate

## Next Steps for Additional Tracking

Consider adding tracking for:
1. **Search Events**: When users search for creators/brands
2. **Share Events**: When users share profiles/campaigns
3. **Video Views**: For video content engagement
4. **File Downloads**: Media kit downloads
5. **Email Interactions**: Email opens/clicks (via server-side tracking)
6. **Payment Events**: `add_payment_info`, `purchase` with actual transaction data

## Notes

- All events include proper error handling (graceful degradation if `gtag` is unavailable)
- Events use GA4 recommended event names where applicable
- Custom parameters are included for detailed analysis
- Page views are automatically tracked via `AnalyticsProvider` component

## Testing

To verify tracking is working:
1. Open browser DevTools → Network tab
2. Filter by "collect" or "google-analytics"
3. Perform actions in the app (sign up, publish campaign, etc.)
4. Check that events are being sent to GA4
5. Verify events appear in GA4 Real-Time reports within a few seconds

