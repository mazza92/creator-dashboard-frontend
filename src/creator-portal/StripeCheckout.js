import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm"; // Create this form next

const stripePromise = loadStripe("your-publishable-key-here");

const StripeCheckout = ({ amount, onSuccess }) => (
  <Elements stripe={stripePromise}>
    <CheckoutForm amount={amount} onSuccess={onSuccess} />
  </Elements>
);

export default StripeCheckout;
