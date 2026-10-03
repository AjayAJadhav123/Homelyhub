import { Property } from "../Models/propertyModel.js";
import {Booking} from "../Models/bookingModel.js"
import cashfree from "../utils/cashfree.js";
import crypto from "crypto"
import dotenv from "dotenv" 
dotenv.config()

const createOrder = async (req, res) => {
    try {
        const { propertyId, fromDate, toDate, guests, phoneNumber } = req.body;

        if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
            return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits." });
        }

        const property = await Property.findById(propertyId);
        if (!property) return res.status(404).json({ success: false, message: "Property not found" });

        const checkIn = new Date(fromDate);
        const checkOut = new Date(toDate);
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        if (Number(guests) < 1 || Number(guests) > property.maximumGuest || nights <= 0) {
            return res.status(400).json({ success: false, message: "Invalid booking details" });
        }

        // Check availability
        const overlappingBooking = property.currentBookings.some(
            (booking) => checkIn < new Date(booking.toDate) && checkOut > new Date(booking.fromDate)
        );
        if (overlappingBooking) return res.status(400).json({ success: false, message: "Dates unavailable" });

        const amount = property.price * nights;
        const order_id = `order_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const backendUrl = process.env.ORIGIN_ACCESS_URL || "http://localhost:4000";
        
        // Pre-create the booking as PENDING
        const newBooking = await Booking.create({
            user: req.user._id,
            property: propertyId,
            price: amount,
            fromDate: checkIn,
            toDate: checkOut,
            guests: Number(guests),
            numberOfnights: nights,
            paid: false,
            orderId: order_id,
            paymentStatus: "PENDING"
        });

        let returnUrl = `${frontendUrl}/payment-status?order_id={order_id}`;
        let notifyUrl = `${backendUrl}/api/v1/rent/user/booking/webhook`;

        // Cashfree production strictly requires HTTPS URLs
        if (process.env.CASHFREE_ENV === "PRODUCTION" || process.env.CASHFREE_ENV === "production") {
            returnUrl = returnUrl.replace("http://", "https://");
            notifyUrl = notifyUrl.replace("http://", "https://");
        }

        const request = {
            order_amount: amount,
            order_currency: "INR",
            order_id: order_id,
            customer_details: {
                customer_id: req.user._id.toString(),
                customer_name: req.user.name || "Guest",
                customer_phone: phoneNumber 
            },
            order_meta: {
                return_url: returnUrl,
                notify_url: notifyUrl
            }
        };

        const cashfreeOrder = await cashfree.PGCreateOrder(request);

        res.status(200).json({
            success: true,
            order: cashfreeOrder.data,
            payment_session_id: cashfreeOrder.data.payment_session_id,
            environment: process.env.CASHFREE_ENV || "SANDBOX"
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const verifyPayement = async (req, res) => {
    try {
        const { order_id } = req.body;
        if (!order_id) return res.status(400).json({ success: false, message: "Missing order_id" });

        const existingBooking = await Booking.findOne({ orderId: order_id });
        if (!existingBooking) return res.status(404).json({ success: false, message: "Booking not found" });
        if (existingBooking.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: "Unauthorized" });

        // If already success, return immediately (Idempotency)
        if (existingBooking.paymentStatus === "SUCCESS") {
            return res.status(200).json({ success: true, message: "Booking already confirmed", booking: existingBooking });
        }

        const response = await cashfree.PGOrderFetchPayments(order_id);
        const isPaid = response.data.some(payment => payment.payment_status === "SUCCESS");

        if (isPaid) {
        // Atomic update to prevent race conditions with Webhook
        const updatedBooking = await Booking.findOneAndUpdate(
            { orderId: order_id, paymentStatus: "PENDING" },
            { $set: { paid: true, paymentStatus: "SUCCESS" } },
            { new: true }
        );

        if (!updatedBooking) {
            // Either not found or already processed
            return res.status(200).json({ success: true, message: "Payment already verified", booking: existingBooking });
        }

            // Add to property currentBookings
            await Property.findByIdAndUpdate(existingBooking.property, {
                $push: {
                    currentBookings: {
                        bookingId: existingBooking._id,
                        fromDate: existingBooking.fromDate,
                        toDate: existingBooking.toDate,
                        userId: req.user._id
                    }
                }
            });

            return res.status(200).json({ success: true, message: "Payment successful", booking: updatedBooking });
        }

        return res.status(400).json({ success: false, message: "Payment not successful" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const cashfreeWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        const rawBody = req.rawBody || JSON.stringify(req.body); 

        try {
            cashfree.PGVerifyWebhookSignature(signature, rawBody, timestamp);
        } catch (err) {
            return res.status(400).json({ message: "Invalid Webhook Signature" });
        }
        
        const event = req.body;
        const order_id = event.data?.order?.order_id;
        
        if (order_id) {
            const existingBooking = await Booking.findOne({ orderId: order_id });
            if (existingBooking && existingBooking.paymentStatus === "PENDING") {
                if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
                    const updatedBooking = await Booking.findOneAndUpdate(
                        { _id: existingBooking._id, paymentStatus: "PENDING" },
                        { $set: { paid: true, paymentStatus: "SUCCESS" } },
                        { new: true }
                    );

                    if (!updatedBooking) return res.status(200).json({ status: "Already Processed" });

                    // Add to property currentBookings
                    await Property.findByIdAndUpdate(existingBooking.property, {
                        $push: {
                            currentBookings: {
                                bookingId: existingBooking._id,
                                fromDate: existingBooking.fromDate,
                                toDate: existingBooking.toDate,
                                userId: existingBooking.user
                            }
                        }
                    });
                } else if (event.type === "PAYMENT_FAILED_WEBHOOK") {
                    existingBooking.paid = false;
                    existingBooking.paymentStatus = "FAILED";
                    await existingBooking.save();
                } else if (event.type === "ORDER_PAY_ACTION_WEBHOOK" && event.data?.payment?.payment_status === "USER_DROPPED") {
                    existingBooking.paid = false;
                    existingBooking.paymentStatus = "CANCELLED";
                    await existingBooking.save();
                }
            }
        }
        
        res.status(200).json({ status: "OK" });
    } catch (error) {
        res.status(500).json({ success: false });
    }
};

const getUserBookings = async (req,res)=>{
  try {
    const bookings = await Booking.find({user:req.user._id});
    res.status(200).json({
        status:"success",
        bookings
        
    });

  } catch(error){
    res.status(401).json({
        status:"fail",
        message:error.message
    });

  }
}

const getBookingDetails = async (req,res)=>{
    try{
        const bookings = await Booking.findById(req.params.bookingId);
        res.status(200).json({
        status:"success",
         bookings
        
    });

    } catch(error){
        res.status(401).json({
        status:"fail",
        message:error.message
    });
    }
}

export { getBookingDetails,getUserBookings,createOrder,verifyPayement,cashfreeWebhook}