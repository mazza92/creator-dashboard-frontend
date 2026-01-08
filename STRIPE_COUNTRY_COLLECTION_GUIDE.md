# Stripe Country Collection Guide

## Current Status

✅ **Country IS being collected** in signup forms:
- `CreatorOnboardingForm.js` - Has CountryDropdown component
- `BrandOnboardingForm.js` - Has CountryDropdown component
- Country is marked as required field
- Country is sent to backend and saved to database

⚠️ **However**: Existing users may not have country in their profile if they signed up before country collection was added.

## Solution

The Stripe connection code has been updated to:
1. **Try to use country from database** if available
2. **Fall back gracefully** if country is missing (defaults to FR, user can change during onboarding)

## For New Users

New users will have country collected during signup and it will be used when creating their Stripe account.

## For Existing Users

Existing users without country will:
1. Have Stripe account default to platform country (FR)
2. Can change country during Stripe onboarding
3. Account will be created with correct country after onboarding

## Optional: Update Existing Users

If you want to collect country for existing users, you could:

### Option 1: Add Country Update in Profile Settings
Add a country field to the profile/settings page so existing users can update it.

### Option 2: Prompt During Stripe Connection
Show a country selector before connecting Stripe if user doesn't have country.

### Option 3: Collect During First Stripe Connection
Add a country selection step in the Stripe connection flow for users without country.

## Code Verification

### Frontend (Already Working)
- ✅ `CreatorOnboardingForm.js` line 574: `formDataToSubmit.append('country', formData.country)`
- ✅ `BrandOnboardingForm.js` line 351: `formDataToSubmit.append('country', formData.country)`
- ✅ Country field is required in both forms

### Backend (Already Working)
- ✅ `app.py` line 5198: `country = request.form.get('country')`
- ✅ `app.py` line 5263: Country is inserted into users table
- ✅ `app.py` line 11257-11289: Country is fetched and used for Stripe account creation

## Testing

1. **New user signup**: 
   - Fill out form with country
   - Verify country is saved to database
   - Connect Stripe → Account should be created with correct country

2. **Existing user without country**:
   - Connect Stripe → Account defaults to FR
   - User can change country during Stripe onboarding
   - Account created successfully

3. **User with country**:
   - Connect Stripe → Account created with their country code
   - Onboarding uses correct country from start

## Next Steps

1. ✅ Code is updated to handle missing country gracefully
2. ⚠️ **Optional**: Add country update option for existing users
3. ⚠️ **Optional**: Add country collection prompt before Stripe connection if missing
4. ✅ Test with new and existing users

