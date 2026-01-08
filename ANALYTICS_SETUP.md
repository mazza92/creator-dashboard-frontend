# Google Analytics Setup & Usage Guide

## 🎯 Overview
Google Analytics has been integrated into the Newcollab app to track user behavior, engagement, and conversions. This guide covers the setup and usage of analytics tracking.

## 📊 What's Being Tracked

### 1. **Automatic Tracking**
- ✅ **Page Views**: Every route change is automatically tracked
- ✅ **User Sessions**: Session duration and engagement
- ✅ **Traffic Sources**: Where users come from
- ✅ **Device & Browser**: User device information

### 2. **Custom Events**
- ✅ **Button Clicks**: Track user interactions with buttons
- ✅ **Form Submissions**: Track form completion rates
- ✅ **Navigation**: Track user journey through the app
- ✅ **Feature Usage**: Track which features users engage with
- ✅ **Error Tracking**: Track app errors and issues
- ✅ **Conversions**: Track business goals (signups, purchases, etc.)

## 🔧 Setup Complete

### Google Analytics Tag Added
The Google Analytics tag has been added to `public/index.html`:
```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-5RET5C6MZ8"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-5RET5C6MZ8');
</script>
```

### Analytics Context Provider
Created `src/contexts/AnalyticsContext.js` with comprehensive tracking functions.

### App Integration
Added `AnalyticsProvider` to `App.js` to make analytics available throughout the app.

## 📈 Available Tracking Functions

### Basic Event Tracking
```javascript
const analytics = useAnalytics();

// Track any custom event
analytics.trackEvent('action_name', 'category', 'label', value);
```

### Button Click Tracking
```javascript
// Track button clicks with location context
analytics.trackButtonClick('signup_button', 'landing_page');
```

### Form Submission Tracking
```javascript
// Track form submissions with success/failure
analytics.trackFormSubmission('creator_signup', true); // success
analytics.trackFormSubmission('creator_signup', false); // failure
```

### Navigation Tracking
```javascript
// Track user navigation between pages
analytics.trackNavigation('landing_page', 'signup_page');
```

### Feature Usage Tracking
```javascript
// Track feature engagement
analytics.trackFeatureUsage('dashboard_analytics', 'viewed');
analytics.trackFeatureUsage('campaign_creation', 'started');
```

### Error Tracking
```javascript
// Track app errors
analytics.trackError('api_error', 'Failed to load user data');
analytics.trackError('validation_error', 'Invalid email format');
```

### Conversion Tracking
```javascript
// Track business goals
analytics.trackConversion('user_signup', 1);
analytics.trackConversion('profile_completion', 1);
analytics.trackConversion('campaign_created', 1);
```

### User Engagement Tracking
```javascript
// Track detailed user engagement
analytics.trackEngagement('video_watched', {
  label: 'onboarding_video',
  value: 1,
  custom_parameters: {
    video_duration: '2:30',
    video_title: 'Getting Started'
  }
});
```

## 🎯 Key Metrics to Monitor

### 1. **User Acquisition**
- Traffic sources (organic, paid, social, direct)
- Landing page performance
- Conversion rates by source

### 2. **User Engagement**
- Page views per session
- Time on site
- Bounce rate
- Feature usage rates

### 3. **Conversion Funnel**
- Landing page → Signup page
- Signup page → Onboarding
- Onboarding → Dashboard
- Dashboard → Feature usage

### 4. **User Journey**
- Navigation patterns
- Drop-off points
- Feature adoption rates

### 5. **Error Tracking**
- API errors
- Form validation errors
- User experience issues

## 📊 Google Analytics Dashboard Setup

### 1. **Real-Time Reports**
- Monitor live user activity
- Track current sessions
- View active users by page

### 2. **Audience Reports**
- User demographics
- Device and browser usage
- Geographic data

### 3. **Acquisition Reports**
- Traffic sources
- Campaign performance
- Referral tracking

### 4. **Behavior Reports**
- Page performance
- User flow
- Site search

### 5. **Conversion Reports**
- Goal completions
- E-commerce tracking
- Funnel analysis

## 🔍 Custom Reports to Create

### 1. **User Journey Report**
- Track users from landing to signup
- Monitor onboarding completion
- Analyze feature adoption

### 2. **Conversion Funnel Report**
- Landing page → Signup → Onboarding → Dashboard
- Identify drop-off points
- Optimize conversion rates

### 3. **Feature Usage Report**
- Track which features users engage with
- Monitor feature adoption rates
- Identify popular vs. unused features

### 4. **Error Tracking Report**
- Monitor app errors
- Track user experience issues
- Identify technical problems

## 🚀 Implementation Examples

### Example 1: Landing Page Tracking
```javascript
// In Founding50.js
const analytics = useAnalytics();

// Track claim button click
const handleClaim = () => {
  analytics.trackButtonClick('claim_username', 'founding50_landing');
  analytics.trackConversion('username_claim_attempt', 1);
  // ... rest of function
};
```

### Example 2: Form Tracking
```javascript
// In CreatorSignup.js
const analytics = useAnalytics();

const handleSubmit = async () => {
  try {
    // ... form submission logic
    analytics.trackFormSubmission('creator_signup', true);
    analytics.trackConversion('user_signup', 1);
  } catch (error) {
    analytics.trackFormSubmission('creator_signup', false);
    analytics.trackError('signup_error', error.message);
  }
};
```

### Example 3: Feature Usage Tracking
```javascript
// In dashboard components
const analytics = useAnalytics();

const handleFeatureUse = () => {
  analytics.trackFeatureUsage('dashboard_analytics', 'viewed');
  analytics.trackEngagement('feature_interaction', {
    label: 'analytics_dashboard',
    custom_parameters: {
      feature_name: 'analytics',
      action: 'viewed'
    }
  });
};
```

## 📈 Key Performance Indicators (KPIs)

### 1. **User Acquisition KPIs**
- Monthly Active Users (MAU)
- New user signups per month
- Traffic source conversion rates

### 2. **Engagement KPIs**
- Average session duration
- Pages per session
- Feature usage rates

### 3. **Conversion KPIs**
- Signup conversion rate
- Onboarding completion rate
- Feature adoption rate

### 4. **Retention KPIs**
- User retention rate (7-day, 30-day)
- Repeat usage patterns
- Feature stickiness

## 🔧 Advanced Configuration

### Custom Dimensions
Set up custom dimensions for:
- User type (creator/brand)
- User stage (new/active/power user)
- Feature usage patterns

### Custom Metrics
Track custom metrics like:
- Onboarding completion time
- Feature usage frequency
- Error rates by feature

### Enhanced E-commerce
Track business metrics:
- Subscription conversions
- Revenue per user
- Customer lifetime value

## 📱 Mobile Analytics

### Mobile-Specific Tracking
- Mobile vs. desktop usage
- App performance on mobile
- Mobile user journey optimization

### Touch Interaction Tracking
- Button tap tracking
- Swipe gesture tracking
- Mobile form completion rates

## 🔒 Privacy & Compliance

### GDPR Compliance
- User consent tracking
- Data retention policies
- Right to be forgotten

### Data Protection
- Anonymized user data
- Secure data transmission
- Regular data audits

## 📊 Reporting Schedule

### Daily Reports
- Real-time user activity
- Error monitoring
- Conversion tracking

### Weekly Reports
- User acquisition trends
- Feature usage analysis
- Conversion funnel optimization

### Monthly Reports
- Comprehensive user analytics
- Business metrics review
- Strategic insights

## 🎯 Next Steps

1. **Monitor Initial Data**: Check Google Analytics for the first 24-48 hours
2. **Set Up Custom Reports**: Create reports for key business metrics
3. **Implement Advanced Tracking**: Add more specific event tracking
4. **Optimize Based on Data**: Use insights to improve user experience
5. **Set Up Alerts**: Configure alerts for important metrics

## 📞 Support

For analytics questions or issues:
- Check Google Analytics documentation
- Review the analytics context implementation
- Monitor the browser console for tracking errors

---

**Note**: All analytics data is automatically collected and sent to Google Analytics. The implementation is privacy-compliant and follows best practices for user tracking. 