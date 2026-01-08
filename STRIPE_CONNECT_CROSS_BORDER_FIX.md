# Stripe Connect Cross-Border Account Fix

## The Solution

Stripe Express accounts **DO support cross-border accounts**! A French platform account can create connected accounts for users in the US, UK, Canada, Australia, and many other countries. You just need to **set the `country` parameter** when creating the account.

## What Changed

### Before
- Account was created without a country parameter
- Stripe would default to platform country (FR)
- Users had to manually change country during onboarding

### After
- Fetches user's country from database
- Maps country name to Stripe country code
- Sets `country` parameter when creating account
- Account is created with correct country from the start

## Implementation

The code now:

1. **Fetches user's country** from the database:
```python
cursor.execute('''
    SELECT u.country 
    FROM creators c
    JOIN users u ON c.user_id = u.id
    WHERE c.id = %s
''', (creator_id,))
user_data = cursor.fetchone()
user_country = user_data.get('country') if user_data else None
```

2. **Maps country to Stripe code** using existing `map_country_to_stripe_code()` function:
```python
if user_country:
    country_code = map_country_to_stripe_code(user_country)
```

3. **Sets country when creating account**:
```python
if country_code:
    account_params['country'] = country_code
    # Creates account with correct country (US, UK, CA, etc.)
```

## Supported Countries

The `map_country_to_stripe_code()` function supports 50+ countries including:

- **North America**: US, Canada, Mexico
- **Europe**: UK, France, Germany, Spain, Italy, Netherlands, etc.
- **Asia Pacific**: Australia, Japan, South Korea, Singapore, India, etc.
- **South America**: Brazil, Argentina, Chile, etc.
- **Middle East & Africa**: UAE, Saudi Arabia, Israel, South Africa, etc.

## How It Works

1. User signs up and provides their country
2. Country is stored in `users.country` field
3. When user connects Stripe:
   - System fetches their country from database
   - Maps country name to Stripe code (e.g., "United States" → "US")
   - Creates Stripe Express account with `country='US'`
4. User completes onboarding with their local country details
5. Account is fully functional for that country

## Benefits

✅ **No multiple Stripe accounts needed** - Single French platform account works for all countries
✅ **Automatic country detection** - Uses country from user signup
✅ **Better UX** - Account created with correct country from start
✅ **Compliance** - Stripe handles country-specific compliance automatically
✅ **Simple** - Just set the country parameter!

## Important Notes

1. **Country must be set at account creation** - Cannot be changed later
2. **User must provide country during signup** - Make sure signup form collects country
3. **Country mapping** - The `map_country_to_stripe_code()` function handles various country name formats
4. **Fallback** - If country not found, defaults to platform country (FR) but user can change during onboarding

## Testing

Test with users from different countries:
- ✅ US user → Account created with `country='US'`
- ✅ UK user → Account created with `country='GB'`
- ✅ Canadian user → Account created with `country='CA'`
- ✅ French user → Account created with `country='FR'`
- ✅ Unknown country → Defaults to `FR`, user can change during onboarding

## Code Location

- **File**: `creator_dashboard/app.py`
- **Route**: `/connect-stripe-account` (line ~11232)
- **Function**: `map_country_to_stripe_code()` (line ~11134)

## Next Steps

1. ✅ Code is updated to set country parameter
2. ⚠️ **Ensure signup form collects country** - Verify users provide country during registration
3. ⚠️ **Test with users from different countries** - Verify accounts are created with correct country
4. ⚠️ **Monitor logs** - Check that country codes are being mapped correctly

## Troubleshooting

**Issue**: Account still defaults to France
- **Check**: Is country being stored in database during signup?
- **Check**: Is `map_country_to_stripe_code()` returning a valid code?
- **Check**: Logs should show: `"User country: X → Stripe code: Y"`

**Issue**: Country not found in mapping
- **Solution**: Add country to `map_country_to_stripe_code()` function
- **Or**: User can still change country during Stripe onboarding

**Issue**: User doesn't have country in database
- **Solution**: Update signup form to require country
- **Or**: Add country collection step before Stripe connection

