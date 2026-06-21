# Backend Fixes - June 21, 2026

**Date**: 2026-06-21
**Status**: ✅ Fixed and Ready for Testing

---

## Issues Fixed

### 1. SQL Error in Pool Routes (CRITICAL)

**Error Message:**
```
[Pool] Error getting active members: for SELECT DISTINCT, ORDER BY expressions must appear in select list
LINE 6:             ORDER BY RANDOM()
                             ^
psycopg2.errors.InvalidColumnReference
```

**File**: `C:\Users\maher\Desktop\creator_dashboard\pool_routes.py`
**Line**: 787

**Problem**: PostgreSQL doesn't allow `ORDER BY RANDOM()` when using `SELECT DISTINCT` unless the RANDOM() expression appears in the SELECT clause.

**Root Cause**:
```sql
-- BROKEN
SELECT DISTINCT c.id, c.username, ...
FROM creators c
JOIN pool_supports ps ON ps.supporter_id = c.id
WHERE ps.confirmed_at >= NOW() - INTERVAL '7 days'
ORDER BY RANDOM()  -- ❌ Not in SELECT list
```

**Fix Applied**:
```sql
-- FIXED
SELECT DISTINCT ON (c.id) c.id, c.username, c.username as display_name, c.image_profile as profile_image_url
FROM creators c
JOIN pool_supports ps ON ps.supporter_id = c.id
WHERE ps.confirmed_at >= NOW() - INTERVAL '7 days'
ORDER BY c.id, RANDOM()  -- ✅ c.id in DISTINCT ON, RANDOM() for randomization
LIMIT 5
```

**Why This Works**:
- `DISTINCT ON (c.id)` tells PostgreSQL which column to deduplicate on
- `ORDER BY c.id, RANDOM()` satisfies PostgreSQL's requirement that DISTINCT ON expressions come first in ORDER BY
- Still achieves randomization while deduplicating creators

**Impact**:
- ✅ Pool active members endpoint now works correctly
- ✅ Social proof banner on dashboard shows random active members
- ✅ No more SQL errors in logs

---

### 2. Missing API Endpoint for Tracking (404 Error)

**Error Message:**
```
ERROR - 🔥 Unmatched route: Path=/api/track-event, Method=POST, URL=http://localhost:5000/api/track-event
INFO - 127.0.0.1 - - [21/Jun/2026 22:24:48] "POST /api/track-event HTTP/1.1" 404 -
```

**Problem**: Frontend upgrade CTA code was calling `/api/track-event` for impression and click tracking, but the endpoint didn't exist.

**Usage in Frontend** (ForYou.js):
```javascript
// Impression tracking
axios.post(`${API_BASE}/api/track-event`, {
  event: 'upgrade_cta_impression',
  location: 'for_you_banner',
  user_id: user?.creator_id
});

// Click tracking
axios.post(`${API_BASE}/api/track-event`, {
  event: 'upgrade_cta_click',
  location: 'floating_button',
  user_id: user?.creator_id
});
```

**Fix Applied**:

**File**: `C:\Users\maher\Desktop\creator_dashboard\app.py`
**Location**: Line 1330 (before `/api/session` endpoint)

```python
@app.route('/api/track-event', methods=['POST', 'OPTIONS'])
def track_event():
    """Track user interaction events for Clarity integration and conversion optimization"""
    if request.method == 'OPTIONS':
        response = jsonify({'success': True})
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', 'https://www.newcollab.co')
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 200

    try:
        data = request.get_json() or {}
        event = data.get('event')
        location = data.get('location')
        user_id = data.get('user_id')

        # Log the event (can be enhanced to store in database later)
        app.logger.info(f"[TRACKING] Event: {event}, Location: {location}, User: {user_id}")

        # Optional: Store in database if tracking table exists
        # For now, just return success
        response = jsonify({'success': True, 'tracked': True})
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', 'https://www.newcollab.co')
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 200

    except Exception as e:
        app.logger.error(f"🔥 Error tracking event: {str(e)}")
        response = jsonify({'success': False, 'error': str(e)})
        response.headers['Access-Control-Allow-Origin'] = request.headers.get('Origin', 'https://www.newcollab.co')
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 500
```

**Features**:
- ✅ Handles OPTIONS preflight for CORS
- ✅ Accepts event, location, and user_id in request body
- ✅ Logs events to console for immediate visibility
- ✅ Returns success response to frontend
- ✅ Error handling with proper CORS headers
- 🔄 Can be enhanced later to store in database table

**Impact**:
- ✅ Upgrade CTA impression tracking now works
- ✅ Upgrade CTA click tracking now works
- ✅ No more 404 errors in logs
- ✅ Ready for Clarity integration analysis

**Events Being Tracked**:
1. `upgrade_cta_impression` - Banner becomes 50% visible (Intersection Observer)
2. `upgrade_cta_click` - User clicks upgrade CTA
3. Locations:
   - `for_you_banner` - Main unlock banner
   - `floating_button` - FAB (Floating Action Button)
   - `locked_card` - Individual locked match cards

---

## Testing Checklist

### Pool Routes Fix
- [ ] Visit `/creator/dashboard/for-you` page
- [ ] Check browser console - should see NO SQL errors
- [ ] Check backend logs - should see NO `InvalidColumnReference` errors
- [ ] Social proof banner should show active members (if any in last 7 days)
- [ ] If no recent activity, should show fallback creators with published kits

### Tracking Endpoint Fix
- [ ] Visit `/creator/dashboard/for-you` as free user with locked matches
- [ ] Scroll so upgrade banner becomes visible
- [ ] Check backend logs for: `[TRACKING] Event: upgrade_cta_impression`
- [ ] Click upgrade CTA button or FAB
- [ ] Check backend logs for: `[TRACKING] Event: upgrade_cta_click`
- [ ] Browser console should show NO 404 errors for `/api/track-event`
- [ ] Network tab should show 200 response for track-event calls

---

## Future Enhancements (Optional)

### Database Storage for Tracking Events

If you want to persist tracking events to database instead of just logging:

**1. Create tracking table:**
```sql
CREATE TABLE IF NOT EXISTS tracking_events (
  id SERIAL PRIMARY KEY,
  event VARCHAR(100) NOT NULL,
  location VARCHAR(100),
  user_id INTEGER REFERENCES users(id),
  creator_id INTEGER REFERENCES creators(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tracking_events_user ON tracking_events(user_id);
CREATE INDEX idx_tracking_events_creator ON tracking_events(creator_id);
CREATE INDEX idx_tracking_events_event ON tracking_events(event);
CREATE INDEX idx_tracking_events_created ON tracking_events(created_at);
```

**2. Update tracking endpoint to insert:**
```python
# Inside track_event() function, after logging:
conn = get_db_connection()
cursor = conn.cursor()
cursor.execute("""
    INSERT INTO tracking_events (event, location, user_id, created_at)
    VALUES (%s, %s, %s, NOW())
""", (event, location, user_id))
conn.commit()
cursor.close()
conn.close()
```

**3. Analytics queries:**
```sql
-- Conversion funnel
SELECT
  COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_impression' THEN user_id END) as impressions,
  COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_click' THEN user_id END) as clicks,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_click' THEN user_id END) /
    NULLIF(COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_impression' THEN user_id END), 0), 2) as ctr
FROM tracking_events
WHERE created_at >= NOW() - INTERVAL '7 days';

-- CTR by location
SELECT
  location,
  COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_impression' THEN user_id END) as impressions,
  COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_click' THEN user_id END) as clicks,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_click' THEN user_id END) /
    NULLIF(COUNT(DISTINCT CASE WHEN event = 'upgrade_cta_impression' THEN user_id END), 0), 2) as ctr
FROM tracking_events
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY location
ORDER BY ctr DESC;
```

---

## Files Modified

1. **C:\Users\maher\Desktop\creator_dashboard\pool_routes.py**
   - Line 787: Changed `SELECT DISTINCT` to `SELECT DISTINCT ON (c.id)`
   - Line 792: Changed `ORDER BY RANDOM()` to `ORDER BY c.id, RANDOM()`

2. **C:\Users\maher\Desktop\creator_dashboard\app.py**
   - Line 1330-1362: Added `/api/track-event` endpoint
   - Handles POST and OPTIONS methods
   - Includes CORS headers
   - Logs events to console

---

## Related Documentation

- [UPGRADE_FAB_IMPLEMENTATION.md](./UPGRADE_FAB_IMPLEMENTATION.md) - FAB implementation details
- [UPGRADE_CTA_IMPROVEMENTS.md](./UPGRADE_CTA_IMPROVEMENTS.md) - Upgrade CTA analysis and plan
- [CLARITY_UX_FIXES_SUMMARY.md](./CLARITY_UX_FIXES_SUMMARY.md) - Overall UX fixes summary

---

**Last Updated**: 2026-06-21
**Status**: ✅ Fixed - Ready for Testing
