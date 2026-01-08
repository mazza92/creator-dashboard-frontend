# Stripe Multi-Account Implementation Guide

This guide shows how to implement multi-country Stripe Connect support using multiple platform accounts.

## Step 1: Update Environment Variables

Add Stripe keys for each country you want to support:

```bash
# .env file
STRIPE_SECRET_KEY_FR=sk_live_... # France (your current account)
STRIPE_SECRET_KEY_US=sk_live_... # United States
STRIPE_SECRET_KEY_GB=sk_live_... # United Kingdom
STRIPE_SECRET_KEY_CA=sk_live_... # Canada
STRIPE_PUBLISHABLE_KEY_FR=pk_live_...
STRIPE_PUBLISHABLE_KEY_US=pk_live_...
STRIPE_PUBLISHABLE_KEY_GB=pk_live_...
STRIPE_PUBLISHABLE_KEY_CA=pk_live_...
```

## Step 2: Country-to-Account Mapping

Create a mapping function to determine which Stripe account to use:

```python
# In app.py

def get_stripe_account_for_country(country_code):
    """
    Map country code to Stripe account key.
    Returns the Stripe secret key for the appropriate platform account.
    """
    # Map countries to Stripe accounts
    country_to_account = {
        # French account (FR, BE, CH, LU, Monaco)
        'FR': 'FR', 'BE': 'FR', 'CH': 'FR', 'LU': 'FR', 'MC': 'FR',
        
        # US account (US, CA, MX)
        'US': 'US', 'CA': 'US', 'MX': 'US',
        
        # UK account (GB, IE)
        'GB': 'GB', 'IE': 'GB',
        
        # Add more mappings as you add accounts
    }
    
    # Default to French account if country not mapped
    account_key = country_to_account.get(country_code, 'FR')
    
    # Get the appropriate Stripe secret key
    env_key = f'STRIPE_SECRET_KEY_{account_key}'
    stripe_key = os.getenv(env_key)
    
    if not stripe_key:
        app.logger.warning(f"No Stripe key found for {account_key}, defaulting to FR")
        stripe_key = os.getenv('STRIPE_SECRET_KEY_FR')
    
    return stripe_key, account_key

def get_stripe_instance(country_code=None):
    """
    Get the appropriate Stripe instance based on country.
    If country_code is None, uses user's country from database.
    """
    if country_code:
        stripe_key, account_key = get_stripe_account_for_country(country_code)
    else:
        # Default to French account
        stripe_key = os.getenv('STRIPE_SECRET_KEY_FR', stripe.api_key)
        account_key = 'FR'
    
    # Create Stripe instance with the correct key
    stripe.api_key = stripe_key
    return stripe, account_key
```

## Step 3: Update Account Creation Route

Modify `/connect-stripe-account` to use country-based routing:

```python
@app.route('/connect-stripe-account', methods=['POST'])
def connect_stripe_account():
    try:
        creator_id = session.get('creator_id')
        if not creator_id:
            return jsonify({"error": "Unauthorized"}), 403

        data = request.json
        email = data.get('email')
        if not email:
            return jsonify({"error": "Email is required"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Check if creator already has a Stripe account
        cursor.execute('SELECT stripe_account_id FROM creators WHERE id = %s', (creator_id,))
        creator = cursor.fetchone()
        if creator['stripe_account_id']:
            conn.close()
            return jsonify({"message": "Stripe account already connected"}), 200

        # Get user's country to determine which Stripe account to use
        cursor.execute('''
            SELECT u.country 
            FROM creators c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = %s
        ''', (creator_id,))
        user_data = cursor.fetchone()
        user_country = user_data.get('country') if user_data else None
        
        # Map country name to country code if needed
        country_code = None
        if user_country:
            country_code = map_country_to_stripe_code(user_country)
        
        # Get the appropriate Stripe instance
        stripe_instance, account_key = get_stripe_instance(country_code)
        
        app.logger.info(f"🔍 Creating Stripe account for creator {creator_id} using {account_key} account (country: {country_code or 'unknown'})")
        
        # Create account parameters
        # For multi-account setup, we MUST set the country to match the platform account
        account_params = {
            'type': 'express',
            'email': email,
            'capabilities': {'card_payments': {'requested': True}, 'transfers': {'requested': True}},
            'metadata': {'creator_id': creator_id, 'platform_account': account_key}
        }
        
        # Set country based on which Stripe account we're using
        # This ensures compliance with Stripe's requirement
        country_mapping = {
            'FR': 'FR',  # French account → French accounts
            'US': 'US',  # US account → US accounts
            'GB': 'GB',  # UK account → UK accounts
        }
        account_params['country'] = country_mapping.get(account_key, 'FR')
        
        # Create Stripe Express account
        account = stripe_instance.Account.create(**account_params)
        
        # Store Stripe account ID and which platform account was used
        cursor.execute(
            'UPDATE creators SET stripe_account_id = %s, stripe_platform_country = %s WHERE id = %s',
            (account.id, account_key, creator_id)
        )
        conn.commit()
        cursor.close()
        conn.close()

        # Create account link for onboarding
        account_link = stripe_instance.AccountLink.create(
            account=account.id,
            refresh_url='https://newcollab.co/stripe/reauth',
            return_url='https://newcollab.co/stripe/success',
            type='account_onboarding'
        )

        app.logger.info(f"✅ Stripe account created for creator {creator_id}: {account.id} using {account_key} platform")
        return jsonify({
            "url": account_link.url,
            "platform_account": account_key  # Frontend may need this
        }), 200

    except stripe.error.StripeError as e:
        app.logger.error(f"Stripe error creating account: {str(e)}")
        return jsonify({"error": f"Stripe error: {str(e)}"}), 400
    except Exception as e:
        app.logger.error(f"Error connecting Stripe account: {str(e)}")
        return jsonify({"error": str(e)}), 500
```

## Step 4: Update Payment Processing

When processing payments, use the correct Stripe account:

```python
@app.route('/create-payment-intent', methods=['POST'])
def create_payment_intent():
    try:
        creator_id = request.json.get('creator_id')
        amount = request.json.get('amount')
        
        # Get creator's Stripe account info
        cursor.execute('''
            SELECT stripe_account_id, stripe_platform_country 
            FROM creators 
            WHERE id = %s
        ''', (creator_id,))
        creator = cursor.fetchone()
        
        if not creator or not creator['stripe_account_id']:
            return jsonify({"error": "Creator has no Stripe account"}), 400
        
        # Get the correct Stripe instance
        _, account_key = get_stripe_instance(creator['stripe_platform_country'])
        stripe_instance, _ = get_stripe_instance(creator['stripe_platform_country'])
        
        # Create payment intent using the correct Stripe account
        payment_intent = stripe_instance.PaymentIntent.create(
            amount=amount,
            currency='usd',
            transfer_data={
                'destination': creator['stripe_account_id']
            },
            metadata={'creator_id': creator_id}
        )
        
        return jsonify({"client_secret": payment_intent.client_secret}), 200
        
    except Exception as e:
        app.logger.error(f"Error creating payment intent: {str(e)}")
        return jsonify({"error": str(e)}), 500
```

## Step 5: Update Frontend (if needed)

If you need to show different Stripe publishable keys:

```javascript
// In your frontend
const getStripePublishableKey = async () => {
  const response = await fetch('/api/get-stripe-key');
  const data = await response.json();
  return data.publishable_key; // Returns key for user's country
};

// Use the appropriate key when initializing Stripe
const stripeKey = await getStripePublishableKey();
const stripe = loadStripe(stripeKey);
```

## Step 6: Database Migration

Add column to track which Stripe account was used:

```sql
ALTER TABLE creators 
ADD COLUMN stripe_platform_country VARCHAR(2) DEFAULT 'FR';

-- Index for faster lookups
CREATE INDEX idx_creators_stripe_platform ON creators(stripe_platform_country);
```

## Step 7: Testing Checklist

- [ ] Test account creation with French user → uses FR account
- [ ] Test account creation with US user → uses US account  
- [ ] Test account creation with unmapped country → defaults to FR
- [ ] Test payment processing uses correct Stripe account
- [ ] Test account status checks work with all accounts
- [ ] Verify webhooks are set up for each Stripe account
- [ ] Test error handling when account key is missing

## Important Notes

1. **Webhooks**: You'll need to set up webhooks for each Stripe account
2. **Dashboard Access**: You'll have separate dashboards for each account
3. **Reporting**: You may want to aggregate data across accounts
4. **Compliance**: Each account must comply with its country's regulations
5. **Currency**: Each account can handle different currencies

## Alternative: Start Simple

If multi-account seems too complex initially:

1. **Phase 1**: Accept only French users (current setup)
2. **Phase 2**: Add US account when you have 10+ US users
3. **Phase 3**: Add more accounts based on actual demand

This lets you validate the business model before investing in complex infrastructure.

