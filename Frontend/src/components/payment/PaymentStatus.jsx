import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../../utils/axios";
import toast from "react-hot-toast";
import "../../css/Payment.css";

/**
 * PaymentStatus
 * Cashfree redirects here after payment (redirect checkout mode).
 * URL: /payment-status?order_id=order_xxx
 * We call verify-payment and redirect appropriately.
 */
const PaymentStatus = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying | success | failed

  useEffect(() => {
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      setStatus("failed");
      toast.error("Order ID missing from return URL.");
      return;
    }

    const verify = async () => {
      try {
        const response = await axiosInstance.post(
          "/v1/rent/user/booking/verify-payment",
          { order_id: orderId }
        );

        if (response.data.success) {
          setStatus("success");
          toast.success("🎉 Payment Successful! Booking Confirmed!");
          setTimeout(() => navigate("/user/mybookings"), 2000);
        } else {
          setStatus("failed");
          toast.error(response.data.message || "Payment verification failed.");
        }
      } catch (err) {
        setStatus("failed");
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Payment verification failed.";
        toast.error(msg);
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="payment-container">
      <div className="payment-content" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        {status === "verifying" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏳</div>
            <h2 style={{ color: "#0e8b53" }}>Verifying your payment…</h2>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              Please wait while we confirm your booking.
            </p>
          </>
        )}
        {status === "success" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🎉</div>
            <h2 style={{ color: "#0e8b53" }}>Payment Successful!</h2>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              Your booking is confirmed. Redirecting to My Bookings…
            </p>
          </>
        )}
        {status === "failed" && (
          <>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>❌</div>
            <h2 style={{ color: "#e53e3e" }}>Payment Verification Failed</h2>
            <p style={{ color: "#666", marginTop: "0.5rem" }}>
              We could not confirm your payment. If money was deducted, please
              contact support with your order details.
            </p>
            <button
              className="book-now-btn"
              style={{ marginTop: "1.5rem" }}
              onClick={() => navigate("/user/mybookings")}
            >
              Go to My Bookings
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentStatus;
