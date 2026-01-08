# GA4 Setup Guide for Newcollab Events

## Prerequisites
- **GA4 Measurement ID**: `G-5RET5C6MZ8` (already configured in `public/index.html`)
- Access to your GA4 property: https://analytics.google.com

## Step 1: Verify Events Are Being Received (Immediate)

### Option A: Real-Time Reports
1. Go to **Reports** → **Realtime** in GA4
2. Perform an action in your app (e.g., sign up, publish campaign)
3. Events should appear within **30-60 seconds**
4. Look for:
   - `sign_up`
   - `new_account`
   - `onboarding_complete`
   - `ad_slot_published`
   - `form_submit`

### Option B: DebugView (Recommended for Testing)
1. Install **Google Analytics Debugger** Chrome extension
2. Enable debug mode in your browser
3. Go to **Configure** → **DebugView** in GA4
4. Events appear in real-time with full parameter details

---

## Step 2: Register Custom Dimensions (Highly Recommended)

Custom dimensions allow you to filter and analyze events by specific parameters.

### Navigate to Custom Dimensions
**Admin** → **Data display** → **Custom dimensions** → **Create custom dimension**

### Create These Custom Dimensions:

#### 1. User Type Dimension
- **Dimension name**: `User Type`
- **Scope**: Event
- **Event parameter**: `user_type`
- **Description**: Identifies whether user is a creator or brand
- **Use cases**: Filter reports by user type, compare creator vs brand behavior

#### 2. Campaign Currency Dimension
- **Dimension name**: `Campaign Currency`
- **Scope**: Event
- **Event parameter**: `currency`
- **Description**: Currency used in campaigns/ad slots
- **Use cases**: Revenue analysis by currency

#### 3. Campaign Budget Dimension
- **Dimension name**: `Campaign Budget`
- **Scope**: Event
- **Event parameter**: `value` (for `ad_slot_published` events)
- **Description**: Budget value for published campaigns
- **Use cases**: Analyze average campaign budgets, revenue tracking

#### 4. Number of Creators Dimension
- **Dimension name**: `Number of Creators`
- **Scope**: Event
- **Event parameter**: `number_of_creators`
- **Description**: Number of creators needed for campaign
- **Use cases**: Analyze campaign sizes, creator demand

#### 5. Sign Up Method Dimension
- **Dimension name**: `Sign Up Method`
- **Scope**: Event
- **Event parameter**: `method`
- **Description**: Method used for sign up (email, google, etc.)
- **Use cases**: Compare sign-up methods effectiveness

#### 6. Onboarding Step Dimension
- **Dimension name**: `Onboarding Step`
- **Scope**: Event
- **Event parameter**: `step_name`
- **Description**: Name of onboarding step
- **Use cases**: Analyze onboarding funnel, identify drop-off points

---

## Step 3: Mark Key Events as Conversions

Mark important events as conversions to track business goals.

**Navigate to**: **Admin** → **Data display** → **Events** → **Mark as conversion**

### Recommended Conversions to Enable:

1. **`sign_up`**
   - Primary conversion: New user registration
   - Enable: ✅

2. **`onboarding_complete`**
   - Primary conversion: User completed onboarding
   - Enable: ✅

3. **`ad_slot_published`**
   - Primary conversion: Brand published a campaign
   - Enable: ✅

4. **`purchase`**
   - Primary conversion: Successful collaboration/booking
   - Enable: ✅ (when implemented)

5. **`submit_application`**
   - Secondary conversion: Creator applied to campaign
   - Enable: ✅ (if you want to track this)

---

## Step 4: Create Custom Reports

### Report 1: User Registration Funnel

**Navigate to**: **Explore** → **Free form** → **Create**

**Dimensions**:
- Event name
- User Type (custom dimension)
- Sign Up Method (custom dimension)

**Metrics**:
- Event count
- Active users
- Conversions (if marked)

**Filters**:
- Event name = `sign_up` OR `new_account`

**Visualization**: Table or Funnel chart

---

### Report 2: Onboarding Completion Analysis

**Create**: **Free form** report

**Dimensions**:
- Onboarding Step (custom dimension)
- User Type (custom dimension)

**Metrics**:
- Event count
- Unique users

**Filters**:
- Event name = `signup_step` OR `onboarding_complete`

**Visualization**: Funnel chart to see drop-off at each step

---

### Report 3: Campaign Publishing Dashboard

**Create**: **Free form** report

**Dimensions**:
- Event name (filter: `ad_slot_published`)
- User Type (custom dimension)
- Campaign Currency (custom dimension)
- Number of Creators (custom dimension)

**Metrics**:
- Event count
- Total revenue (sum of `value` parameter)
- Average revenue per event

**Visualization**: Table with currency breakdown

**Pro Tip**: Create a calculated metric:
- **Average Campaign Budget** = `value` / `event_count`

---

### Report 4: User Journey Report

**Create**: **Path exploration** report

**Configuration**:
- **Starting point**: `sign_up`
- **Ending point**: `onboarding_complete`
- **Steps in between**: 
  1. `signup_step` (step 1)
  2. `signup_step` (step 2)
  3. `signup_step` (step 3)
  4. `onboarding_complete`

This shows how many users complete each step and where they drop off.

---

### Report 5: Revenue by User Type

**Create**: **Free form** report

**Dimensions**:
- User Type (custom dimension)
- Event name (filter: events with `value` parameter)

**Metrics**:
- Total revenue (sum of `value`)
- Event count
- Average event value

**Visualization**: Bar chart

---

## Step 5: Set Up Custom Metrics (Optional but Useful)

**Navigate to**: **Admin** → **Data display** → **Custom metrics** → **Create custom metric**

### Recommended Custom Metrics:

1. **Average Campaign Budget**
   - **Scope**: Event
   - **Event parameter**: `value` (from `ad_slot_published`)
   - **Aggregation type**: Average
   - **Unit**: Currency

2. **Total Campaign Budget**
   - **Scope**: Event
   - **Event parameter**: `value` (from `ad_slot_published`)
   - **Aggregation type**: Sum
   - **Unit**: Currency

---

## Step 6: Create Audiences (Optional)

Useful for remarketing and user segmentation.

**Navigate to**: **Admin** → **Audiences** → **New audience**

### Recommended Audiences:

1. **Active Creators**
   - Condition: `user_type` = "creator" AND has event `sign_up` in last 30 days

2. **Active Brands**
   - Condition: `user_type` = "brand" AND has event `sign_up` in last 30 days

3. **Campaign Publishers**
   - Condition: Has event `ad_slot_published` in last 30 days

4. **Onboarding Completers**
   - Condition: Has event `onboarding_complete` in last 30 days

5. **Onboarding Drop-offs**
   - Condition: Has event `sign_up` BUT no event `onboarding_complete` in last 7 days

---

## Step 7: Set Up Data Filters (Optional)

**Navigate to**: **Admin** → **Data settings** → **Data filters**

### Recommended Filters:

1. **Exclude Development Environment** (if applicable)
   - Filter type: Internal traffic
   - Traffic type: Development
   - Use your development domain or IP ranges

---

## Step 8: Enable Enhanced Measurement (If Not Already Enabled)

**Navigate to**: **Admin** → **Data streams** → **Web stream** → **Enhanced measurement**

Enable:
- ✅ Scrolls
- ✅ Outbound clicks
- ✅ Site search (if you have search)
- ✅ Video engagement (if you have videos)
- ✅ File downloads (if you have downloadable files)

---

## Step 9: Create Dashboards (Quick Access)

**Navigate to**: **Reports** → **Library** → **Create dashboard**

### Dashboard 1: Registration & Onboarding Overview

**Cards to Add**:
1. Total Sign-ups (last 7 days)
   - Metric: `sign_up` event count
2. Sign-ups by User Type
   - Breakdown: User Type dimension
3. Onboarding Completion Rate
   - Formula: `onboarding_complete` / `sign_up` * 100
4. Onboarding Funnel
   - Chart: Funnel showing steps

---

### Dashboard 2: Campaign Activity

**Cards to Add**:
1. Campaigns Published (last 7 days)
   - Metric: `ad_slot_published` event count
2. Total Campaign Budget
   - Metric: Sum of `value` from `ad_slot_published`
3. Average Campaign Budget
   - Metric: Average of `value` from `ad_slot_published`
4. Campaigns by Currency
   - Breakdown: Currency dimension

---

## Step 10: Set Up Alerts (Optional)

**Navigate to**: **Admin** → **Custom insights** → **Create custom insight**

### Recommended Alerts:

1. **Sign-up Drop Alert**
   - Alert when: `sign_up` events drop by >20% compared to previous day
   - Frequency: Daily

2. **Campaign Publishing Alert**
   - Alert when: `ad_slot_published` events drop by >30% compared to previous week
   - Frequency: Weekly

3. **Onboarding Drop-off Alert**
   - Alert when: Onboarding completion rate drops below 60%
   - Frequency: Weekly

---

## Step 11: Link Google Ads (If Applicable)

If you run Google Ads campaigns:

**Navigate to**: **Admin** → **Google Ads linking**

Link your Google Ads account to import campaign data and create audiences for remarketing.

---

## Step 12: Set Up Data Import (Advanced - Optional)

If you want to import additional data (e.g., customer lifetime value, user segments from your database):

**Navigate to**: **Admin** → **Data import**

Import dimensions like:
- User segments
- Subscription tiers
- Account creation dates

---

## Verification Checklist

Before considering setup complete, verify:

- [ ] Events appear in Real-Time reports
- [ ] Custom dimensions are created and receiving data
- [ ] Key events are marked as conversions
- [ ] At least one custom report is created
- [ ] Dashboard is set up for quick insights
- [ ] Events show correct parameters in DebugView

---

## Testing Your Setup

### Test Checklist:

1. **Sign Up Test**
   - [ ] Register as creator → Check Real-Time for `sign_up` event with `user_type: creator`
   - [ ] Register as brand → Check Real-Time for `sign_up` event with `user_type: brand`

2. **Onboarding Test**
   - [ ] Complete onboarding → Check for `onboarding_complete` event
   - [ ] Check step progression → Verify `signup_step` events fire

3. **Campaign Publishing Test**
   - [ ] Publish a campaign → Check for `ad_slot_published` event
   - [ ] Verify parameters: `currency`, `value`, `number_of_creators` are present

4. **Form Submission Test**
   - [ ] Submit a form → Check for `form_submit` event
   - [ ] Try a failed submission → Verify success/failure tracking

---

## Common Issues & Solutions

### Issue: Events not appearing in Real-Time
**Solution**: 
- Check browser console for errors
- Verify GA4 Measurement ID is correct (`G-5RET5C6MZ8`)
- Check if ad blocker is blocking GA4
- Verify events are actually being triggered (check code with console.log)

### Issue: Custom dimensions showing "not set"
**Solution**:
- Ensure dimension is created before events are sent (or wait 24-48 hours)
- Verify event parameter name matches dimension parameter exactly
- Check that events include the parameter

### Issue: Conversions not counting
**Solution**:
- Verify event is marked as conversion in GA4
- Wait 24-48 hours for conversion data to appear
- Check that events are firing (not just page views)

---

## Quick Start (Minimal Setup)

If you want to start tracking immediately with minimal setup:

1. ✅ **Check Real-Time reports** - Events should appear automatically
2. ✅ **Mark 3 key events as conversions**:
   - `sign_up`
   - `onboarding_complete`
   - `ad_slot_published`
3. ✅ **Create 1 custom dimension**: `User Type` (`user_type` parameter)

That's it! You can add more custom dimensions and reports later as needed.

---

## Need Help?

- **GA4 Help Center**: https://support.google.com/analytics
- **GA4 Events Reference**: https://support.google.com/analytics/answer/9322688
- **Custom Dimensions**: https://support.google.com/analytics/answer/10075209

---

## Important Notes

- **Data Delay**: Standard reports show data 24-48 hours after events occur. Real-Time reports show data within 30-60 seconds.
- **Custom Dimensions**: Must be created before events are sent (or events sent before creation won't have dimensions attached).
- **Conversions**: Only count events after they're marked as conversions.
- **Testing**: Always use DebugView or Real-Time reports for immediate verification.

---

**Last Updated**: Based on current GA4 tracking implementation (November 2025)


