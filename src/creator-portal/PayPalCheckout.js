import React from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const PayPalCheckout = ({ amount, onSuccess }) => (
  <PayPalButtons
    createOrder={(data, actions) => {
      return actions.order.create({
        purchase_units: [{ amount: { value: amount.toString() } }],
      });
    }}
    onApprove={(data, actions) => {
      return actions.order.capture().then(() => {
        onSuccess();
      });
    }}
  />
);

export default PayPalCheckout;
