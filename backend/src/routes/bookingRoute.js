import express from "express";
const bookingRouter = express.Router();
import {getBookingDetails,getUserBookings,createOrder,verifyPayement,cashfreeWebhook} from "../controllers/bookingController.js"

import {protect} from "../controllers/authController.js"
bookingRouter.get("/",protect,getUserBookings);
bookingRouter.get("/:bookingId",protect,getBookingDetails);

bookingRouter.post("/create-order",protect,createOrder)
bookingRouter.post("/verify-payment",protect,verifyPayement);
bookingRouter.post("/webhook", cashfreeWebhook); // webhook is unprotected, Cashfree verifies signature

export {bookingRouter}
