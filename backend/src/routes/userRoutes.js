import express from "express";

import {
  check,
  forgotPassword,
  login,
  logout,
  protect,
  resetPassword,
  signup,
  updateMe,
  updatePassword,
} from "../controllers/authController.js";
import { createProperty, getUsersProperties, updateProperty, deleteProperty, imagekitAuth, forceUpdateImages } from "../controllers/propertyController.js";

import { writeDescription } from "../controllers/tripController.js";

import { toggleFavorite, getMyFavorites, checkFavoriteStatus } from "../controllers/favoriteController.js";
import { createInquiry, getMySentInquiries, getMyReceivedInquiries, updateInquiryStatus } from "../controllers/inquiryController.js";

const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/updateMe").patch(protect, updateMe);
router.route("/updateMyPassword").patch(protect, updatePassword);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:token").patch(resetPassword);
router.route("/me").get(protect, check);
router.route("/generateDescription").post(protect, writeDescription)

router.route("/imagekit-auth").get(protect, imagekitAuth);

router.route("/newAccommodation").post(protect, createProperty);
router.route("/myAccommodation").get(protect, getUsersProperties);
router.route("/accommodation/:id").patch(protect, updateProperty).delete(protect, deleteProperty);
router.route("/accommodation/:id/force-images").patch(protect, forceUpdateImages);


// Favorites Routes
router.route("/favorites").get(protect, getMyFavorites);
router.route("/favorites/:propertyId").post(protect, toggleFavorite);
router.route("/favorites/check/:propertyId").get(protect, checkFavoriteStatus);

router.route("/inquiries/sent").get(protect, getMySentInquiries);
router.route("/inquiries/received").get(protect, getMyReceivedInquiries);
router.route("/inquiries/:inquiryId/status").patch(protect, updateInquiryStatus);
router.route("/inquiries/:propertyId").post(protect, createInquiry);

export { router };
