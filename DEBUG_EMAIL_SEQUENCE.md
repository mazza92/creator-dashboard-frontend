# Debug Email Sequence - Troubleshooting Guide

## Quick Debug Steps

### Step 1: Check User Status

Call the debug endpoint to see why emails aren't being sent:

```bash
# Replace with your test email
curl "http://localhost:5000/api/debug-email-sequence?email=test@example.com"
```

Or in browser:
```
http://localhost:5000/api/debug-email-sequence?email=test@example.com
```

**What to check:**
- `is_verified`: Should be `true`
- `is_creator`: Should be `true`
- `no_creator_profile`: Should be `true`
- `time_elapsed_minutes`: Should be >= 5 for Email 1
- `should_receive_email`: Should show `1` if Email 1 should be sent
- `email_pattern_match`: In development, should be `true` if email matches test patterns

---

### Step 2: Manually Trigger Email Sequence

```bash
curl -X POST http://localhost:5000/api/send-onboarding-reminders
```

Or in browser (if GET works):
```
http://localhost:5000/api/send-onboarding-reminders
```

**Check the logs** for:
- How many users were found
- Which emails are being sent
- Any errors

---

### Step 3: Check Database Columns

Verify columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'onboarding_email%'
ORDER BY column_name;
```

**Expected:** 5 columns (email_1 through email_5)

**If missing:** Run the migration:
```bash
psql -d your_database -f migrations/supabase_add_onboarding_email_columns.sql
```

---

## Common Issues & Fixes

### Issue 1: Columns Don't Exist

**Symptom:** Query fails with "column does not exist"

**Fix:**
1. Run migration: `migrations/supabase_add_onboarding_email_columns.sql`
2. Or let the code auto-create (will happen on first run, but slower)

---

### Issue 2: User Not Verified

**Symptom:** `is_verified: false` in debug output

**Fix:**
- User must verify email first
- Check verification email was sent/received
- Manually verify in database if needed:
  ```sql
  UPDATE users SET is_verified = true WHERE email = 'test@example.com';
  ```

---

### Issue 3: User Has Creator Profile

**Symptom:** `no_creator_profile: false` in debug output

**Fix:**
- User already completed onboarding
- Use a different test account
- Or delete creator profile:
  ```sql
  DELETE FROM creators WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
  ```

---

### Issue 4: Not Enough Time Elapsed

**Symptom:** `time_elapsed_minutes: 2.5` (less than 5 minutes)

**Fix:**
- Wait 5+ minutes after account creation
- Or manually adjust `created_at` for testing:
  ```sql
  UPDATE users 
  SET created_at = NOW() - INTERVAL '10 minutes' 
  WHERE email = 'test@example.com';
  ```

---

### Issue 5: Development Email Filter

**Symptom:** `email_pattern_match: false` in debug output

**Fix:**
- Use test email pattern: `team+test@domain.com` or `test@domain.com`
- Or set `FLASK_ENV=production` (be careful!)
- Or remove the filter in development (not recommended)

---

### Issue 6: Cron Not Running

**Symptom:** No emails sent, but debug shows user should receive email

**Fix:**
1. Check if cron is configured:
   - External cron service (Vercel Cron, GitHub Actions, etc.)
   - Should call `/api/send-onboarding-reminders` hourly

2. Manually trigger:
   ```bash
   curl -X POST https://api.newcollab.co/api/send-onboarding-reminders
   ```

3. Check logs for errors

---

### Issue 7: Email Sending Failed

**Symptom:** Logs show "Failed to send email"

**Fix:**
- Check SMTP configuration
- Verify email credentials
- Check spam folder
- Test email sending manually:
  ```bash
  curl -X POST http://localhost:5000/api/test-onboarding-reminder \
    -H "Content-Type: application/json" \
    -d '{"email": "test@example.com"}'
  ```

---

## Testing Checklist

- [ ] User account created
- [ ] Email verified (`is_verified = true`)
- [ ] User role is `creator`
- [ ] No creator profile exists (`creator_id IS NULL`)
- [ ] 5+ minutes elapsed since account creation
- [ ] Database columns exist (email_1 through email_5)
- [ ] Email matches test pattern (if in development)
- [ ] Cron job is running (or manually triggered)
- [ ] SMTP credentials are correct
- [ ] No errors in logs

---

## Quick Test Script

```bash
#!/bin/bash

# Set your test email
TEST_EMAIL="team+test@newcollab.co"

echo "1. Checking user status..."
curl "http://localhost:5000/api/debug-email-sequence?email=$TEST_EMAIL"

echo -e "\n\n2. Triggering email sequence..."
curl -X POST http://localhost:5000/api/send-onboarding-reminders

echo -e "\n\n3. Checking again after trigger..."
curl "http://localhost:5000/api/debug-email-sequence?email=$TEST_EMAIL"
```

---

## Next Steps

1. **Run debug endpoint** with your test email
2. **Check the output** for any failed criteria
3. **Fix the issue** based on the diagnosis
4. **Manually trigger** the email sequence
5. **Verify** email was sent

---

**Last Updated**: November 2025

