// src/Payment.js
import React, { useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, message } from 'antd';

const stripePromise = loadStripe('pk_test_RZFMNQ4Cwhf40G249V2OFobV00YEEYTq1A'); // Your Stripe publishable key

const PaymentForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const urlParams = new URLSearchParams(window.location.search);
    const clientSecret = urlParams.get('client_secret');
    const subscriptionId = urlParams.get('subscription_id');

    useEffect(() => {
        if (!stripe || !clientSecret) return;

        stripe.retrievePaymentIntent(clientSecret).then((result) => {
            if (result.error) {
                console.error('Error retrieving PaymentIntent:', result.error.message);
                message.error(`Failed to retrieve payment status: ${result.error.message}`);
                return;
            }

            const { paymentIntent } = result;
            if (paymentIntent && paymentIntent.status === 'succeeded') {
                message.success('Payment already succeeded!');
                window.location.href = 'http://localhost:3000/payment-success';
            } else if (paymentIntent) {
                console.log('PaymentIntent retrieved:', paymentIntent);
            } else {
                console.error('No paymentIntent returned');
                message.error('Payment intent not found.');
            }
        }).catch((error) => {
            console.error('Unexpected error retrieving PaymentIntent:', error);
            message.error('An unexpected error occurred while retrieving payment status.');
        });
    }, [stripe, clientSecret]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        const cardElement = elements.getElement(CardElement);
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                    name: 'Customer Name', // Replace with dynamic data if available
                },
            },
        });

        if (error) {
            console.error('Payment error:', error);
            message.error(error.message);
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            console.log('Payment succeeded:', paymentIntent);
            message.success('Payment successful!');
            window.location.href = 'http://localhost:3000/payment-success';
        } else {
            console.error('PaymentIntent not succeeded:', paymentIntent);
            message.error('Payment failed or incomplete.');
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Complete Your Payment</h2>
            <p>Subscription ID: {subscriptionId}</p>
            <form onSubmit={handleSubmit}>
                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
                <Button
                    type="primary"
                    htmlType="submit"
                    disabled={!stripe || !clientSecret}
                    style={{ marginTop: '16px', width: '100%' }}
                >
                    Pay Now
                </Button>
            </form>
        </div>
    );
};

const Payment = () => (
    <Elements stripe={stripePromise}>
        <PaymentForm />
    </Elements>
);

export default Payment;