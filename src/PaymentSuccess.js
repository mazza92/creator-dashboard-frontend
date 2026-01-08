import React, { useEffect, useState, useRef } from "react";
import { Button, Result, Spin } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import api from "./config/api";
import { message } from "antd";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handlePaymentRedirect = async () => {
      const subscriptionId = localStorage.getItem("pendingSubscriptionId");
      const bookingId = localStorage.getItem("pendingBookingId");

      console.log(`📌 PaymentSuccess - Stripe redirect: subscriptionId=${subscriptionId}, bookingId=${bookingId}`);

      const id = subscriptionId || bookingId;
      const type = subscriptionId ? "subscription" : "booking";
      if (!id) {
        console.error("📌 PaymentSuccess - Missing booking or subscription ID");
        setPaymentStatus("error");
        setErrorMessage("Missing booking or subscription ID");
        message.error("Missing booking or subscription ID");
        setProcessing(false);
        setTimeout(() => navigate("/brand/dashboard/bookings"), 3000);
        return;
      }

      try {
        console.log(`📌 PaymentSuccess - Completing ${type} payment for ID ${id}`);
        const response = await api.post(
          `/${type}s/${id}/complete-payment`,
          { payment_intent_id: localStorage.getItem("pendingPaymentIntentId") || "unknown" },
          { withCredentials: true }
        );
        console.log(`📌 PaymentSuccess - ${type} payment response for ID ${id}:`, response.data);
        message.success(`${type === "subscription" ? "Subscription" : "Booking"} payment completed!`);
        localStorage.removeItem(type === "subscription" ? "pendingSubscriptionId" : "pendingBookingId");
        localStorage.removeItem("brandId");
        localStorage.removeItem("pendingPaymentIntentId");
        setPaymentStatus("success");
        setTimeout(() => navigate("/brand/dashboard/bookings"), 3000);
      } catch (error) {
        console.error(`🔥 PaymentSuccess - Error completing ${type} payment for ID ${id}:`, {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          fullResponse: error.response
        });
        let errorMessage = "Failed to complete payment. Please try again.";
        if (error.response?.status === 400) {
          errorMessage = error.response.data.error || "Invalid payment details.";
        } else if (error.response?.status === 403) {
          errorMessage = "Unauthorized: Please log in and try again.";
        } else if (error.response?.status === 404) {
          errorMessage = `Booking or subscription not found (ID: ${id}). Please check the booking details.`;
        }
        setPaymentStatus("error");
        setErrorMessage(errorMessage);
        message.error(errorMessage);
        setProcessing(false);
      }
    };

    handlePaymentRedirect();
  }, [location, navigate]);

  const retryPayment = () => {
    setProcessing(true);
    setPaymentStatus(null);
    setErrorMessage(null);
    hasRun.current = false; // Allow useEffect to run again
  };

  return (
    <Result
      status={processing ? "info" : paymentStatus === "success" ? "success" : "error"}
      title={
        processing
          ? "Processing Payment..."
          : paymentStatus === "success"
          ? "Payment Successful!"
          : "Payment Error"
      }
      subTitle={
        processing
          ? "Completing your payment. Please wait."
          : paymentStatus === "success"
          ? "Your payment has been processed. Redirecting to your dashboard..."
          : errorMessage || "There was an issue processing your payment."
      }
      extra={[
        !processing && (
          <>
            {paymentStatus === "error" && (
              <Button
                type="primary"
                key="retry"
                onClick={retryPayment}
                style={{ marginRight: 8 }}
              >
                Retry Payment
              </Button>
            )}
            <Button
              type={paymentStatus === "success" ? "primary" : "default"}
              key="dashboard"
              onClick={() => navigate("/brand/dashboard/bookings")}
            >
              Go to Dashboard
            </Button>
          </>
        ),
      ]}
    >
      {processing && <Spin />}
    </Result>
  );
};

export default PaymentSuccess;