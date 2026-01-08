# Stripe Connect Country Selection Fix

## Problem
Stripe Connect onboarding was forcing France as the home address country for all users, regardless of their actual location. 

## Solution (UPDATED)
Stripe Express accounts **support cross-border accounts**! A French platform can create accounts for users in US, UK, Canada, etc. by setting the `country` parameter.

Updated the Stripe account creation to:
1. **Fetch user's country** from the database (stored during signup)
2. **Map country name to Stripe code** using `map_country_to_stripe_code()` function
3. **Set country parameter** when creating the Stripe Express account
4. **Account is created with correct country** from the start (US, UK, CA, etc.)
5. **User completes onboarding** with their local country details

**Note**: This is the correct approach per Stripe's documentation. Express accounts support cross-border accounts when you specify the country.

## Changes Made

### 1. Added Country Mapping Function (`map_country_to_stripe_code`)
- Maps common country names to Stripe's 2-letter ISO codes
- Supports multiple name variations (e.g., "USA", "United States", "United States of America" → "US")
- Handles partial matches and direct code validation
- Returns `None` if country is not recognized (allows Stripe to handle it)

### 2. Updated Stripe Account Creation
- Fetches user's country from database via creator_id → user_id join
- Maps country name to Stripe code
- Only sets `country` parameter if valid code is found
- If no country available, Stripe's onboarding flow will allow user to select country

## Code Location
- **File**: `creator_dashboard/app.py`
- **Function**: `map_country_to_stripe_code()` (line ~11134)
- **Route**: `/connect-stripe-account` (line ~11232)

## How It Works

### How It Works
1. User clicks "Connect Stripe Account"
2. System creates Stripe Express account **without setting country parameter**
3. Stripe generates onboarding link
4. User opens Stripe onboarding form:
   - Country field shows platform default (FR) initially
   - **Country dropdown is fully editable and clickable**
   - User clicks dropdown and selects their actual country (e.g., "United States")
   - User completes rest of onboarding with correct country
5. Stripe account is created with user-selected country

**Important**: Once a Stripe account is created with a country, it cannot be changed. That's why we let users select it during onboarding rather than guessing.

## Supported Countries
The mapping function supports 50+ countries including:
- **North America**: US, Canada, Mexico
- **Europe**: UK, France, Germany, Spain, Italy, Netherlands, etc.
- **Asia Pacific**: Australia, Japan, South Korea, Singapore, India, etc.
- **South America**: Brazil, Argentina, Chile, etc.
- **Middle East & Africa**: UAE, Saudi Arabia, Israel, South Africa, etc.

## Benefits
1. ✅ **User Control**: Users select their own country - most accurate approach
2. ✅ **No VPN Issues**: Doesn't rely on browser/IP detection (which can be wrong)
3. ✅ **No Database Dependency**: Works without storing country in database
4. ✅ **Stripe Recommended**: This is Stripe's recommended approach for Express accounts
5. ✅ **Global Support**: Works for all Stripe-supported countries
6. ✅ **Simple**: Clean code - just don't set country parameter

## Testing Recommendations
1. **Test with US user**: Should see "US" as country in Stripe onboarding
2. **Test with country not in mapping**: Should allow manual selection
3. **Test with NULL country**: Should allow manual selection
4. **Test with various country name formats**: Should map correctly

## Future Enhancements
1. **Collect country during signup**: Ensure all users provide country during onboarding
2. **Expand country mapping**: Add more countries as needed
3. **Use Stripe's country detection**: Could use IP geolocation as fallback
4. **Store Stripe country code**: Save the final country code used in Stripe account

## Notes
- Stripe supports 40+ countries for Express accounts
- **By not setting country parameter**: Stripe's onboarding flow automatically includes country selection
- **Country dropdown is editable**: Users can click and select their country from the full list
- **Stripe defaults to platform country (FR) initially**: This is expected - users just need to change it
- Using Stripe-hosted onboarding (AccountLink) automatically supports all Stripe-supported countries
- Country requirements vary by country - Stripe handles compliance automatically
- **Once country is set during onboarding, it cannot be changed** - that's why user selection is important
- The country field in Stripe onboarding is a standard dropdown - users can easily change it from FR to their country

