import {Property} from "../Models/propertyModel.js"
import {APIFeatures} from "../utils/APIFeatures.js"
import mongoose from "mongoose";
import imagekit from "../utils/ImagekitIO.js";
import Favorite from "../Models/favoriteModel.js";
import { createNotification } from "./notificationController.js";

const getProperties = async (req, res) => {
  try {
    const features = new APIFeatures(Property.find(), req.query)
      .filter()
      .search()
      .sort();
     
    // Clone query to get total count before pagination
    const totalCount = await features.query.clone().countDocuments();

    // Apply pagination
    features.paginate();
    
    // Add .lean() for performance
    const doc = await features.query.lean();
    
    res.status(200).json({
      status: "success",
      all_properties: totalCount,
      data: doc,
      pagination: {
        total: totalCount,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 8,
        pages: Math.ceil(totalCount / (Number(req.query.limit) || 8))
      }
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Internal server error",
    });
  }
};


const getProperty = async (req,res)=>{  
    try {
       const property = await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
       if (!property) {
           return res.status(404).json({ status: "fail", message: "Property not found" });
       }
        res.status(200).json({
            status:"success",
            data:property
        });
    } catch(error){
        res.status(404).json({
            status:"fail",
            message:error.message});
    }
}


const imagekitAuth = (req, res) => {
  try {
    if (!imagekit) {
      return res.status(503).json({ status: "fail", message: "ImageKit is not configured" });
    }


    const publicKey = process.env.IMAGEKIT_PUBLICKEY;
    const urlEndpoint = process.env.IMAGEKIT_URLENDPOINT;

    const authenticationParameters = imagekit.getAuthenticationParameters();

    res.status(200).json({
      ...authenticationParameters,
      publicKey: publicKey,
      urlEndpoint: urlEndpoint,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

const createProperty = async (req, res) => {
  try {
    const {
      propertyName,
      description,
      propertyType,
      roomType,
      extraInfo,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images,
    } = req.body;

    if (!images || !Array.isArray(images) || images.length < 6) {
      return res.status(400).json({ status: "fail", message: "At least 6 valid ImageKit images are required" });
    }

    for (const img of images) {
      if (!img.url || !img.public_id) {
        return res.status(400).json({ status: "fail", message: "Every image must contain url and public_id from ImageKit" });
      }
    }

    const property = await Property.create({
      propertyName,
      description,
      propertyType,
      roomType,
      extraInfo,
      address,
      amenities,
      checkInTime,
      checkOutTime,
      maximumGuest,
      price,
      images, // images are already uploaded by frontend directly to ImageKit
      userId: req.user.id,
    });

    res.status(200).json({ status: "success", data: { data: property } });
  } catch (error) {
    console.error("Error creating property", error);
    res.status(404).json({ status: "fail", message: error.message });
  }
};

const getUsersProperties = async (req, res) => {
  try {
    const userId = req.user._id;
    const property = await Property.find({ userId });
    res.status(200).json({
      status: "success",
      data: property,
    });
  } catch (error) {
    res.status(404).json({ status: "fail", message: error.message });
  }
};




const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ status: "fail", message: "Property not found" });
    }

    if (property.userId.toString() !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "You can only edit your own properties" });
    }

    const {
      propertyName, description, propertyType, roomType, extraInfo,
      address, amenities, checkInTime, checkOutTime, maximumGuest, price, images
    } = req.body;

    const updateData = {
        propertyName, description, propertyType, roomType, extraInfo,
        address, amenities, checkInTime, checkOutTime, maximumGuest, price
    };
    if (images && Array.isArray(images) && images.length >= 6) {
        updateData.images = images;
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // PRICE DROP DETECTION
    if (price && Number(price) < property.price) {
      // Find all users who wishlisted (favorited) this property
      const favorites = await Favorite.find({ property: property._id });
      for (const fav of favorites) {
        await createNotification(
          fav.user,
          "Price Drop Alert! 📉",
          `Good news! The price for "${property.propertyName}" dropped from ₹${property.price} to ₹${price}.`,
          "PRICE_CHANGE"
        );
      }
    }

    // AVAILABILITY DETECTION (if currentBookings was manually reduced by owner)
    if (req.body.currentBookings && Array.isArray(req.body.currentBookings)) {
      if (req.body.currentBookings.length < property.currentBookings.length) {
        const favorites = await Favorite.find({ property: property._id });
        for (const fav of favorites) {
          await createNotification(
            fav.user,
            "Property Available! 🏠",
            `A booking was cancelled! "${property.propertyName}" is now available for new dates.`,
            "SYSTEM"
          );
        }
      }
    }

    res.status(200).json({ status: "success", data: updatedProperty });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ status: "fail", message: "Property not found" });
    }

    if (property.userId.toString() !== req.user.id) {
      return res.status(403).json({ status: "fail", message: "You can only delete your own properties" });
    }

    // Attempt to delete images from ImageKit
    if (property.images && property.images.length > 0) {
      for (const image of property.images) {
        if (image.public_id && image.public_id !== "url") { // Handle our mock url logic
          try {
            await imagekit.deleteFile(image.public_id);
          } catch (imgError) {
            console.error(`Failed to delete image ${image.public_id}:`, imgError.message);
          }
        }
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({ status: "success", message: "Property deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error.message });
  }
};

export {getProperties,getProperty,createProperty,getUsersProperties, updateProperty, deleteProperty, imagekitAuth};