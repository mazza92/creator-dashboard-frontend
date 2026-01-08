# Quick Test: Email Sequence Not Working

## For Your Test Account (Verified at 2025-11-04 14:06:57)

### Step 1: Debug Your Test Account

Replace `YOUR_TEST_EMAIL` with your actual test email:

```bash
# Local development
curl "http://localhost:5000/api/debug-email-sequence?email=YOUR_TEST_EMAIL"

# Production
curl "https://api.newcollab.co/api/debug-email-sequence?email=YOUR_TEST_EMAIL"
```

**What to look for:**
- `should_receive_email`: Should be `1` if Email 1 should be sent
- `criteria_met`: All should be `true`
- `time_elapsed_minutes`: Should be >= 5

---

### Step 2: Manually Trigger Email Sequence

```bash
# Local development
curl -X POST http://localhost:5000/api/send-onboarding-reminders

# Production
curl -X POST https://api.newcollab.co/api/send-onboarding-reminders
```

**Check server logs** for:
- How many users were found
- Which emails were sent
- Any errors

---

### Step 3: Check Database Columns

Run this in your Supabase SQL Editor:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name LIKE 'onboarding_email%'
ORDER BY column_name;

-- Check your test user
SELECT 
    id, email, role, is_verified, created_at,
    onboarding_email_1_sent_at,
    onboarding_email_2_sent_at,
    onboarding_email_3_sent_at
FROM users 
WHERE email = 'YOUR_TEST_EMAIL';
```

---

### Step 4: If Columns Don't Exist

Run the migration in Supabase SQL Editor:

```sql
-- Copy and paste from: migrations/supabase_add_onboarding_email_columns.sql
```

Or let the code auto-create (it will on first run).

---

### Step 5: Force Send Email (For Testing)

If debug shows user should receive email but it's not sending:

```bash
# Test sending email directly
curl -X POST http://localhost:5000/api/test-onboarding-reminder \
  -H "Content-Type: application/json" \
  -d '{"email": "YOUR_TEST_EMAIL"}'
```

---

## Most Likely Issues

### 1. Database Columns Missing
**Fix:** Run the migration SQL script

### 2. Cron Not Running
**Fix:** Manually trigger with Step 2 command

### 3. User Not Verified
**Fix:** Check `is_verified = true` in database

### 4. Less Than 5 Minutes Elapsed
**Fix:** Wait 5+ minutes, or adjust `created_at` for testing:
```sql
UPDATE users 
SET created_at = NOW() - INTERVAL '10 minutes' 
WHERE email = 'YOUR_TEST_EMAIL';
```

### 5. Development Email Filter
**Fix:** Use test email pattern: `team+test@newcollab.co`

---

## Quick Fix Script

```bash
#!/bin/bash

# Set your test email
TEST_EMAIL="YOUR_TEST_EMAIL"

echo "=== Debugging Email Sequence ==="
echo ""
echo "1. Checking user status..."
curl "http://localhost:5000/api/debug-email-sequence?email=$TEST_EMAIL" | jq

echo ""
echo "2. Triggering email sequence..."
curl -X POST http://localhost:5000/api/send-onboarding-reminders

echo ""
echo "3. Checking again..."
curl "http://localhost:5000/api/debug-email-sequence?email=$TEST_EMAIL" | jq
```

---

**Next Steps:**
1. Run Step 1 (debug endpoint) to see what's wrong
2. Share the output if you need help
3. Fix the issue based on the debug output
4. Trigger the email sequence manually

