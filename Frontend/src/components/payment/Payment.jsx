import React, { useEffect, useState } from "react";
import "../../css/Payment.css";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { axiosInstance } from "../../utils/axios";
import { load } from "@cashfreepayments/cashfree-js";

const Payment = () => {
  const navigate = useNavigate();
  const { propertyId } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get booking details saved from PaymentForm
  const {bookingDetails} = useSelector(
    state => state.booking
  );

  const {
    checkinDate,
    checkoutDate,
    totalPrice,
    propertyName,
    guests,
    nights,
    name,
    phoneNumber,
  } = bookingDetails || {};
console.log(bookingDetails)
  // Cashfree integration

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!bookingDetails) {
        throw new Error("Booking details are missing");
      }

      if (!propertyId) {
        throw new Error("Property ID is missing");
      }

      if (!checkinDate || !checkoutDate) {
        throw new Error("Please select valid booking dates");
      }

      if (!guests || Number(guests) <= 0) {
        throw new Error("Please enter a valid number of guests");
      }

      const paymentData = {
        propertyId,
        fromDate: checkinDate,
        toDate: checkoutDate,
        guests: Number(guests),
        phoneNumber: phoneNumber,
      };

      console.log("Creating Cashfree order:", paymentData);

      const response = await axiosInstance.post(
        "/v1/rent/user/booking/create-order",
        paymentData
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(
          data.message || "Unable to create payment order"
        );
      }

      const { order, payment_session_id, bookingDetails: serverBookingDetails, environment } = data;

      if (!payment_session_id) {
        throw new Error("Invalid Cashfree order received");
      }

      const cashfreeMode = environment?.toLowerCase() === "production" ? "production" : "sandbox";

      const cashfree = await load({
        mode: cashfreeMode, 
      });

      const checkoutOptions = {
        paymentSessionId: payment_session_id,
        redirectTarget: "_modal",
      };

      cashfree.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          console.error("Cashfree payment failed:", result.error);
          const message = result.error.message || "Payment failed. Please try again.";
          setError(message);
          toast.error(message);
          setLoading(false);
        }
        
        if (result.redirect) {
          console.log("Redirection");
        }
        
        if (result.paymentDetails) {
          try {
            setLoading(true);
            setError(null);
            
            console.log("Cashfree payment response:", result.paymentDetails);
            
            const verifyData = {
              order_id: order.order_id,
              bookingDetails: {
                propertyId: serverBookingDetails?.propertyId || propertyId,
                fromDate: serverBookingDetails?.fromDate || checkinDate,
                toDate: serverBookingDetails?.toDate || checkoutDate,
                guests: serverBookingDetails?.guests || Number(guests),
                nights: serverBookingDetails?.nights || nights,
                price: serverBookingDetails?.price || totalPrice,
              },
            };
            
            console.log("Sending payment verification:", verifyData);
            
            const verifyResponse = await axiosInstance.post(
              "/v1/rent/user/booking/verify-payment",
              verifyData
            );
            
            if (!verifyResponse.data.success) {
              throw new Error(verifyResponse.data.message || "Payment verification failed");
            }
            
            toast.success("🎉 Payment Successful! Booking Confirmed!");
            navigate("/user/mybookings");
            
          } catch (error) {
            console.error("Payment verification error:", error);
            const message = error.response?.data?.message || error.message || "Payment verification failed";
            setError(message);
            toast.error(message);
          } finally {
            setLoading(false);
          }
        }
      });

    } catch (error) {
      console.error("Create order error:", error);
      console.log(error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to initiate payment";

      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  const handleCancelPayment = () => {
    toast.error("Payment Cancelled");

    navigate(`/propertylist/${propertyId}`);
  };

  /*
   * If booking details are missing, don't allow payment.
   */
  if (!bookingDetails || Object.keys(bookingDetails).length === 0) {
    return (
      <div className="payment-container">
        <div className="payment-content">
          <div className="error-message">
            Booking details are missing.
          </div>

          <button
            className="book-now-btn"
            onClick={() =>
              navigate(`/propertylist/${propertyId}`)
            }
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">

      <div className="payment-header">
        <h1>Complete Your Booking</h1>

        <p>
          {propertyName}
        </p>
      </div>

      <div className="payment-content">

        <div className="booking-summary-card">

          <h3>Booking Details</h3>

          <div className="detail-row">
            <span>Property:</span>

            <span>
              {propertyName}
            </span>
          </div>

          <div className="detail-row">
            <span>Check-in:</span>

            <span>
              {checkinDate}
            </span>
          </div>

          <div className="detail-row">
            <span>Check-out:</span>

            <span>
              {checkoutDate}
            </span>
          </div>

          <div className="detail-row">
            <span>Guests:</span>

            <span>
              {guests}
            </span>
          </div>

          <div className="detail-row">
            <span>Nights:</span>

            <span>
              {nights}
            </span>
          </div>

          <div className="detail-row total-row">

            <strong>
              Total Amount:
            </strong>

            <strong>
              ₹{Number(totalPrice || 0).toLocaleString("en-IN")}
            </strong>

          </div>

        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="payment-action">

          <button
            onClick={handleCancelPayment}
            disabled={loading}
            className="cancel-btn"
          >
            Cancel
          </button>

          <button
            onClick={handleBooking}
            disabled={loading}
            className="book-now-btn"
          >
            {loading
              ? "Processing..."
              : `Proceed to Payment ₹${Number(
                  totalPrice || 0
                ).toLocaleString("en-IN")}`}
          </button>

        </div>

        <div className="security-info">

          <p>
            🛡️ Your payment is processed securely through Cashfree.
          </p>

        </div>

      </div>

    </div>
  );
};

export default Payment;

// import React, { useEffect, useState } from "react";
// import "../../css/Payment.css";
// import {
//   initiateCheckoutSession,
//   verifyPayment,
// } from "../../store/Payment/payment-action";
// import {
//   selectPaymentDetails,
//   selectPaymentStatus,
//   paymentActions,
// } from "../../store/Payment/payment-slice";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";
// import toast from "react-hot-toast";

// const Payment = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { propertyId } = useParams();
//   const [showPaymentGateaway, setShowPaymentGateaway] = useState(false);

//   const {
//     checkinDate,
//     checkoutDate,
//     totalPrice,
//     propertyName,
//     guests,
//     nights,
//   } = useSelector(selectPaymentDetails);

//   const { loading, error, orderData } = useSelector(selectPaymentStatus);

//   const handleBooking = async () => {
//     const paymentData = {
//       amount: totalPrice,
//       propertyId,
//       fromDate: checkinDate,
//       toDate: checkoutDate,
//       guests,
//     };
//     try {
//       await dispatch(initiateCheckoutSession(paymentData));
//     } catch {
//       toast.error("Payment initiation failed");
//     }
//   };
//   const handleConfirmPayment = async () => {
//     try {
//       await dispatch(
//         verifyPayment({
//           orderId: orderData.orderId,
//           bookingDetails: {
//             propertyId,
//             fromDate: checkinDate,
//             toDate: checkoutDate,
//             guests,
//             price: totalPrice,
//           },
//           forceStatus: "success",
//         })
//       );

//       toast.success("🎉 Payment Successful! Booking Confirmed!");
//       setTimeout(() => navigate("/user/mybookings"), 1000);
//       dispatch(paymentActions.resetPayment());
//     } catch {
//       toast.error("Payment failed!");
//     }
//   };

//   const handleCancelPayment = () => {
//     toast.error("Payment Cancelled");
//     navigate(`/propertylist/${propertyId}`);
//   };
//   useEffect(() => {
//     if (orderData && !showPaymentGateaway) {
//       setShowPaymentGateaway(true);
//     }
//   }, [orderData]);
//   if (showPaymentGateaway && orderData) {
//     return (
//       <div className="payment-gateway-overlay">
//         <div className="payment-gateway-modal">

//           <div className="gateway-header">
//             <div className="gateway-logo">
//               <h2>🏠 HomelyHub</h2>
//               <span>Payment Gateway</span>
//             </div>
//             <div className="secure-badge">
//               <span>🔒 Secure Payment</span>
//             </div>
//           </div>

//           <div className="gateway-content">
//             <div className="merchant-info">
//               <h3>
//                 Payment to: <strong>HomelyHub</strong>
//               </h3>
//               <p>
//                 Order ID: <strong>{orderData.orderId}</strong>
//               </p>
//             </div>

//             <div className="payment-summary">
//               <div className="summary-item">
//                 <span>Property:</span>
//                 <span>{propertyName}</span>
//               </div>
//               <div className="summary-item">
//                 <span>Check-in:</span>
//                 <span>{checkinDate}</span>
//               </div>
//               <div className="summary-item">
//                 <span>Check-out:</span>
//                 <span>{checkoutDate}</span>
//               </div>
//               <div className="summary-item">
//                 <span>Guests:</span>
//                 <span>{guests}</span>
//               </div>
//               <div className="summary-item">
//                 <span>Nights:</span>
//                 <span>{nights}</span>
//               </div>
//               <div className="summary-item total-amount">
//                 <span>
//                   <strong>Total Amount:</strong>
//                 </span>
//                 <span>
//                   <strong>₹{totalPrice.toLocaleString("en-IN")}</strong>
//                 </span>
//               </div>
//             </div>

//             {error && <div className="error-message">{error}</div>}

//             <div className="gateway-actions">
//               <button
//                 onClick={handleCancelPayment}
//                 className="cancel-btn"
//                 disabled={loading}
//               >
//                 Cancel Payment
//               </button>
//               <button
//                 onClick={handleConfirmPayment}
//                 className="confirm-btn"
//                 disabled={loading}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner"></span>
//                     Processing...
//                   </>
//                 ) : (
//                   <>
//                     <span>🔒</span>
//                     Confirm Payment ₹{totalPrice.toLocaleString("en-IN")}
//                   </>
//                 )}
//               </button>
//             </div>

//             <div className="security-info">
//               <p>
//                 <span>🛡️</span>
//                 Your payment information is encrypted and secure
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="payment-container">
//       <div className="payment-header">
//         <h1>Complete Your Booking</h1>
//         <p>{propertyName}</p>
//       </div>

//       <div className="payment-content">

//         <div className="booking-summary-card">
//           <h3>Booking Details</h3>
//           <div className="detail-row">
//             <span>Check-in:</span>
//             <span>{checkinDate}</span>
//           </div>
//           <div className="detail-row">
//             <span>Check-out:</span>
//             <span>{checkoutDate}</span>
//           </div>
//           <div className="detail-row">
//             <span>Guests:</span>
//             <span>{guests}</span>
//           </div>
//           <div className="detail-row">
//             <span>Nights:</span>
//             <span>{nights}</span>
//           </div>
//           <div className="detail-row total-row">
//             <strong>Total Amount:</strong>
//             <strong>₹{totalPrice}</strong>
//           </div>
//         </div>

//         {error && <div className="error-message">{error}</div>}

//         <div className="payment-action">
//           <button
//             onClick={handleBooking}
//             disabled={loading}
//             className="book-now-btn"
//           >
//             {loading ? "Processing..." : `Proceed to Payment ₹${totalPrice}`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Payment;


