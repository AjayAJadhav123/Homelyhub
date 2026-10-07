import React, { useEffect, useState } from "react";
import "../../css/MyBookings.css";
import ProgressSteps from "../ProgressSteps";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";

import {useDispatch,useSelector} from "react-redux"
import {fetchBookingDetails,fetchUserBookings} from "../../store/Booking/booking-action"
const MyBookings = () => {
  const navigate = useNavigate();
  const dispatch= useDispatch()
  
  const {bookings,loading} = useSelector(state=>state.booking)
  const {user} = useSelector(state=>state.user)
  useEffect(() => {
    dispatch(fetchUserBookings())
  }, [dispatch]);


  const handleBookingClick = (bookingId) => {
    dispatch(fetchBookingDetails(bookingId))
    navigate(`/user/myBookings/${bookingId}`);
  };

  const handleDownloadReceipt = (e, booking) => {
    e.stopPropagation();
    const receiptHtml = `
      <html>
        <head>
          <title>HomelyHub Receipt</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: auto; }
            h1 { color: #ff385c; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #f5f5f5; padding-bottom: 10px; }
            .label { font-weight: bold; color: #555; }
            .value { color: #000; text-align: right; }
            .footer { margin-top: 50px; text-align: center; color: #888; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HomelyHub</h1>
            <h2>Booking Receipt</h2>
          </div>
          <div class="row"><span class="label">User Name:</span> <span class="value">${user?.name || "Guest"}</span></div>
          <div class="row"><span class="label">Booking ID:</span> <span class="value">${booking._id}</span></div>
          <div class="row"><span class="label">Order ID:</span> <span class="value">${booking.orderId || 'N/A'}</span></div>
          <div class="row"><span class="label">Property Name:</span> <span class="value">${booking.property.propertyName}</span></div>
          <div class="row"><span class="label">Property Address:</span> <span class="value">${booking.property.address?.area}, ${booking.property.address?.city}</span></div>
          <div class="row"><span class="label">Check-in Date:</span> <span class="value">${new Date(booking.fromDate).toLocaleDateString()}</span></div>
          <div class="row"><span class="label">Check-out Date:</span> <span class="value">${new Date(booking.toDate).toLocaleDateString()}</span></div>
          <div class="row"><span class="label">Amount Paid:</span> <span class="value">&#8377; ${booking.price}</span></div>
          <div class="row"><span class="label">Payment Status:</span> <span class="value" style="color: green; font-weight: bold;">${booking.paymentStatus}</span></div>
          <div class="row"><span class="label">Payment Date:</span> <span class="value">${new Date(booking.updatedAt || booking.createdAt).toLocaleString()}</span></div>
          <div class="footer">
            Thank you for booking with HomelyHub!
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'height=800,width=800');
    if (printWindow) {
      printWindow.document.write(receiptHtml);
      printWindow.document.close();
    }
  };

  if (!loading && bookings?.length === 0 ) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <h3>Nothing booked yet</h3>
      </div>
    );
  }
  return (
    <>
      <ProgressSteps />
      <div className="wow">
        {loading && <LoadingSpinner />}
        {!loading &&
          bookings.length > 0 &&
          bookings.map((booking) => (
            <div
              className="main-container"
              onClick={() => handleBookingClick(booking?._id)}
              key={booking._id}
            >
              <div className="mybookings-container row">
                <div className="image-container col-lg-3 col-md-3">
                  <img
                    className="booking-img"
                    src={
                      booking?.property?.images &&
                      booking?.property?.images.length > 0
                        ? booking?.property?.images[0].url
                        : undefined
                    }
                    alt="bookings"
                  />
                </div>
                <div className="booking-information col-lg-9 col-md-9">
                  <h6 className="hotel-name">
                    {booking?.property?.propertyName || "Property Unavailable"}
                  </h6>
                  <div className="stay-information">
                    <span className="info">
                      <span className="material-symbols-outlined icon">
                        bedtime
                      </span>
                      {booking?.numberOfnights} nights
                    </span>
                    <span className="info">
                      <span className="material-symbols-outlined icon">
                        calendar_month
                      </span>
                      {new Date(booking?.fromDate).toLocaleDateString()}
                    </span>
                    <span class="material-symbols-outlined icon">
                      arrow_forward
                    </span>
                    <span className="info">
                      <span className="material-symbols-outlined icon">
                        calendar_month
                      </span>
                      {new Date(booking?.toDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h5 className="booking-price">
                    <span class="material-symbols-outlined">payments</span>{" "}
                    Total Price :&#8377; {booking?.price}
                  </h5>
                  <button 
                    onClick={(e) => handleDownloadReceipt(e, booking)} 
                    style={{
                      marginTop: "10px",
                      padding: "8px 16px",
                      backgroundColor: "#ff385c",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "600"
                    }}
                  >
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
};

export default MyBookings;
