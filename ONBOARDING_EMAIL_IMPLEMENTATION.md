# Onboarding Email Sequence Implementation Guide

## Overview

A comprehensive 5-email sequence has been implemented to reduce creator onboarding drop-off rates. The system sends targeted emails at strategic intervals based on modern app best practices.

## Email Sequence Timeline

1. **Email 1: Welcome** - 5 minutes after signup (if onboarding not started)
2. **Email 2: Value Focus** - 30-60 minutes after signup (if Email 1 sent)
3. **Email 3: Social Proof** - 24 hours after signup (if Email 2 sent)
4. **Email 4: Support** - 3 days after signup (if Email 3 sent)
5. **Email 5: Last Chance** - 7 days after signup (if Email 4 sent)

## Database Migration

### Required Columns

The system requires these columns in the `users` table:

```sql
onboarding_email_1_sent_at TIMESTAMP
onboarding_email_2_sent_at TIMESTAMP
onboarding_email_3_sent_at TIMESTAMP
onboarding_email_4_sent_at TIMESTAMP
onboarding_email_5_sent_at TIMESTAMP
```

### Migration Steps

1. **Option A: Run SQL Migration** (Recommended)
   ```bash
   psql -d your_database -f migrations/add_onboarding_email_sequence_columns.sql
   ```

2. **Option B: Automatic Creation**
   - The application will automatically create columns on first use
   - However, running the migration upfront ensures indexes are created for performance

## How It Works

### Backend Logic

1. **`get_incomplete_profiles_for_email_sequence()`**
   - Queries all creators with incomplete profiles
   - Groups them by which email they should receive based on:
     - Time since signup
     - Which emails have already been sent

2. **`send_onboarding_email(user_data, email_number)`**
   - Sends a specific email (1-5) to a creator
   - Updates the corresponding timestamp column
   - Handles errors gracefully

3. **`send_onboarding_reminders()`**
   - Main function called by cron job
   - Processes all email groups and sends appropriate emails
   - Logs success/failure for each email

### Email Templates

All templates are defined in `NOTIFICATION_TEMPLATES`:

- `ONBOARDING_EMAIL_1_WELCOME`: Welcome message with quick start
- `ONBOARDING_EMAIL_2_VALUE_FOCUS`: Value proposition and benefits
- `ONBOARDING_EMAIL_3_SOCIAL_PROOF`: Success stories and social proof
- `ONBOARDING_EMAIL_4_SUPPORT`: Help and support resources
- `ONBOARDING_EMAIL_5_LAST_CHANCE`: Final push with benefit recap

## Cron Job Setup

The existing cron endpoint `/api/send-onboarding-reminders` now handles the full sequence:

```bash
# External cron should call this endpoint hourly
curl -X POST https://api.newcollab.co/api/send-onboarding-reminders
```

### Recommended Cron Frequency

- **Hourly**: Recommended for timely delivery
- **Every 2 hours**: Acceptable if hourly is not possible
- **Daily**: Too infrequent - emails will be delayed

## Testing

### Test Email Sequence

1. **Create a test creator account** (use test email like `team+test@domain.com`)
2. **Wait for timing**:
   - Email 1: Wait 5 minutes
   - Email 2: Wait 30 minutes after Email 1
   - Email 3: Wait 24 hours after Email 2
   - Email 4: Wait 3 days after Email 3
   - Email 5: Wait 7 days after Email 4

3. **Manual Trigger** (for testing):
   ```bash
   curl -X POST http://localhost:5000/api/send-onboarding-reminders
   ```

### Reset Email Sequence (for testing)

To test the sequence again, you can reset the timestamps:

```sql
UPDATE users 
SET onboarding_email_1_sent_at = NULL,
    onboarding_email_2_sent_at = NULL,
    onboarding_email_3_sent_at = NULL,
    onboarding_email_4_sent_at = NULL,
    onboarding_email_5_sent_at = NULL
WHERE email = 'team+test@domain.com';
```

## Monitoring

### Logs to Watch

The system logs detailed information:

```
🔄 Starting scheduled onboarding email sequence check...
📧 Found 5 users needing onboarding emails:
   Email #1: 2 users
   Email #2: 1 users
   Email #3: 2 users
📧 Sending email #1 to 2 users...
✅ Email #1 completed: 2/2 successful
✅ Onboarding email sequence completed: 5/5 successful
```

### Key Metrics to Track

1. **Email Send Success Rate**: % of emails successfully sent
2. **Onboarding Completion Rate**: % of users who complete after receiving emails
3. **Email-to-Completion Rate**: % of users who complete after clicking email
4. **Sequence Effectiveness**: Which email number converts best

## Customization

### Adjusting Email Timing

Edit `get_incomplete_profiles_for_email_sequence()` to change timing:

```python
# Email 1: Change from 5 minutes to 10 minutes
if time_since_signup >= timedelta(minutes=10) and user['email_1_sent'].year == 1970:
    email_groups[1].append(user)
```

### Updating Email Content

Edit the templates in `NOTIFICATION_TEMPLATES`:

```python
'ONBOARDING_EMAIL_1_WELCOME': {
    'creator': {
        'subject': lambda data: f"Your custom subject",
        'message': lambda data: f"Your custom message",
        # ...
    }
}
```

## Troubleshooting

### Issue: Emails not being sent

**Check:**
1. Are users verified? (`is_verified = true`)
2. Do they have a creator profile? (should be `NULL` for incomplete profiles)
3. Are timestamps being updated? (check database)
4. Check logs for error messages

### Issue: Wrong email being sent

**Check:**
1. Verify email timestamps in database
2. Check time calculations in `get_incomplete_profiles_for_email_sequence()`
3. Ensure previous email was sent before next one triggers

### Issue: Database column errors

**Solution:**
1. Run the migration script: `migrations/add_onboarding_email_sequence_columns.sql`
2. Or let the application create columns automatically (slower on first use)

## Best Practices

1. **Monitor Email Deliverability**: Check bounce rates and spam complaints
2. **A/B Test Subject Lines**: Test different subject lines for each email
3. **Track Engagement**: Monitor open rates and click rates
4. **Iterate Based on Data**: Adjust timing/content based on conversion data
5. **Respect User Preferences**: Allow users to opt-out if requested

## Future Enhancements

Potential improvements:
- [ ] Add email preferences (daily digest, weekly summary)
- [ ] Segment emails by creator niche/type
- [ ] Add more personalization based on user behavior
- [ ] Create email templates with better HTML design
- [ ] Add unsubscribe functionality
- [ ] Track email engagement (opens, clicks) in database

---

**Last Updated**: November 2025
**Status**: ✅ Implemented and Ready for Testing

