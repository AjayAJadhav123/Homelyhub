import Inquiry from "../Models/inquiryModel.js";
import { Property } from "../Models/propertyModel.js";
import { createNotification } from "./notificationController.js";

// Create a new inquiry
export const createInquiry = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    // Verify property exists
    const property = await Property.findById(propertyId).lean();
    if (!property) {
      return res.status(404).json({
        status: "fail",
        message: "Property not found",
      });
    }

    // Guard: every property must have an owner (userId field in schema)
    if (!property.userId) {
      return res.status(500).json({
        status: "error",
        message: "Property owner information is missing. Cannot process inquiry.",
      });
    }

    // Prevent users from inquiring about their own property
    if (property.userId.toString() === senderId.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "You cannot send an inquiry for your own property",
      });
    }

    // Prevent duplicate inquiries for the same property by the same user within 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingInquiry = await Inquiry.findOne({
      property: propertyId,
      sender: senderId,
      createdAt: { $gt: oneDayAgo },
    });

    if (existingInquiry) {
      return res.status(400).json({
        status: "fail",
        message: "You have already sent an inquiry for this property within the last 24 hours.",
      });
    }

    const inquiry = await Inquiry.create({
      property: propertyId,
      sender: senderId,
      owner: property.userId,
      message,
    });

    await createNotification(
      property.userId,
      "New Inquiry Received",
      `You received a new inquiry for ${property.propertyName}.`,
      "NEW_INQUIRY"
    );

    res.status(201).json({
      status: "success",
      message: "Inquiry sent successfully",
      data: inquiry,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get inquiries sent by the current user
export const getMySentInquiries = async (req, res, next) => {
  try {
    const senderId = req.user._id;

    const inquiries = await Inquiry.find({ sender: senderId })
      .populate({
        path: "property",
        select: "propertyName address price images slug",
      })
      .populate({
        path: "owner",
        select: "name avatar email",
      })
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      status: "success",
      results: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get inquiries received by the current user (for properties they own)
export const getMyReceivedInquiries = async (req, res, next) => {
  try {
    const ownerId = req.user._id;

    const inquiries = await Inquiry.find({ owner: ownerId })
      .populate({
        path: "property",
        select: "propertyName address price slug",
      })
      .populate({
        path: "sender",
        select: "name avatar email phoneNumber",
      })
      .sort("-createdAt")
      .lean();

    res.status(200).json({
      status: "success",
      results: inquiries.length,
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Accept or reject an inquiry (property owner only)
export const updateInquiryStatus = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { status } = req.body;
    const requesterId = req.user._id;

    // Validate the incoming status value
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Status must be either 'accepted' or 'rejected'.",
      });
    }

    // Find the inquiry — do NOT lean() so we can save()
    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json({
        status: "fail",
        message: "Inquiry not found.",
      });
    }

    // Server-side ownership check: only the property owner stored on the inquiry may act
    if (inquiry.owner.toString() !== requesterId.toString()) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this inquiry.",
      });
    }

    // Prevent re-acting on already-decided inquiries
    if (inquiry.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: `Inquiry is already ${inquiry.status}. No further action is allowed.`,
      });
    }

    inquiry.status = status;
    await inquiry.save();

    const prop = await Property.findById(inquiry.property);
    await createNotification(
      inquiry.sender,
      `Inquiry ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your inquiry for ${prop?.propertyName || 'a property'} was ${status}.`,
      "INQUIRY_UPDATE"
    );

    res.status(200).json({
      status: "success",
      message: `Inquiry ${status} successfully.`,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
