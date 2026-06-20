"""
TikTok Server-Side Tracking for Stripe Webhook
==============================================

Add this code to your Flask Stripe webhook handler to track Pro subscription conversions.

Instructions:
1. Set environment variables:
   - TIKTOK_ACCESS_TOKEN: Get from TikTok Events Manager → your pixel → Settings → Conversions API
   - TIKTOK_PIXEL_ID: Your TikTok pixel ID (D8RC64JC77U5NRSHKOK0)

2. Add this function to your Flask app (e.g., in your Stripe routes file)

3. Call send_tiktok_subscribe_event() in your webhook handler when:
   - event.type == 'checkout.session.completed' OR
   - event.type == 'customer.subscription.created'
"""

import os
import uuid
import hashlib
import requests
from flask import current_app

# Configuration
TIKTOK_ACCESS_TOKEN = os.getenv('TIKTOK_ACCESS_TOKEN')
TIKTOK_PIXEL_ID = os.getenv('TIKTOK_PIXEL_ID', 'D8RC64JC77U5NRSHKOK0')
TIKTOK_EVENTS_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/'


def send_tiktok_subscribe_event(email, value, currency='USD'):
    """
    Send a Subscribe event to TikTok's Conversions API.

    Args:
        email (str): Customer email address
        value (float): Subscription value/amount
        currency (str): Currency code (default: USD)

    Returns:
        dict: Response from TikTok API or error dict
    """
    if not TIKTOK_ACCESS_TOKEN:
        current_app.logger.warning('TikTok Access Token not configured. Skipping conversion tracking.')
        return {'error': 'TIKTOK_ACCESS_TOKEN not set'}

    try:
        # Hash the email using SHA-256 (required by TikTok for privacy)
        email_hash = hashlib.sha256(email.lower().strip().encode()).hexdigest()

        # Prepare the event payload
        payload = {
            'pixel_code': TIKTOK_PIXEL_ID,
            'event': 'Subscribe',
            'event_id': str(uuid.uuid4()),  # Unique event ID for deduplication
            'timestamp': None,  # TikTok will use server time if not provided
            'context': {
                'user': {
                    'email': email_hash
                },
                'ad': {},
                'page': {}
            },
            'properties': {
                'value': float(value),
                'currency': currency
            }
        }

        # Send the event to TikTok
        headers = {
            'Access-Token': TIKTOK_ACCESS_TOKEN,
            'Content-Type': 'application/json'
        }

        response = requests.post(
            TIKTOK_EVENTS_API_URL,
            headers=headers,
            json=payload,
            timeout=10
        )

        # Log the response
        if response.status_code == 200:
            current_app.logger.info(f'TikTok Subscribe event sent successfully for {email}')
            return response.json()
        else:
            current_app.logger.error(
                f'TikTok API error: {response.status_code} - {response.text}'
            )
            return {'error': response.text, 'status_code': response.status_code}

    except Exception as e:
        current_app.logger.error(f'Failed to send TikTok event: {str(e)}')
        return {'error': str(e)}


# ===========================
# EXAMPLE WEBHOOK INTEGRATION
# ===========================

"""
Example: Add to your existing Stripe webhook handler

@app.route('/webhook/stripe', methods=['POST'])
def stripe_webhook():
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle subscription created or checkout completed
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']

        # Get customer email and amount
        customer_email = session.get('customer_email') or session.get('customer_details', {}).get('email')
        amount_total = session.get('amount_total', 0) / 100  # Convert from cents
        currency = session.get('currency', 'usd').upper()

        # Send to TikTok
        if customer_email:
            send_tiktok_subscribe_event(
                email=customer_email,
                value=amount_total,
                currency=currency
            )

    elif event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']

        # Get customer info
        customer_id = subscription.get('customer')

        # Fetch customer to get email
        try:
            customer = stripe.Customer.retrieve(customer_id)
            customer_email = customer.email

            # Get subscription amount
            plan_amount = subscription['items']['data'][0]['plan']['amount'] / 100
            currency = subscription['items']['data'][0]['plan']['currency'].upper()

            # Send to TikTok
            if customer_email:
                send_tiktok_subscribe_event(
                    email=customer_email,
                    value=plan_amount,
                    currency=currency
                )
        except Exception as e:
            current_app.logger.error(f'Error fetching customer: {str(e)}')

    return jsonify({'status': 'success'}), 200
"""
