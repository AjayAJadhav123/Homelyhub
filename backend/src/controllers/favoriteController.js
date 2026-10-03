import Favorite from "../Models/favoriteModel.js";
import { Property } from "../Models/propertyModel.js";

// Toggle Favorite status
export const toggleFavorite = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user._id;

    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        status: "fail",
        message: "Property not found",
      });
    }

    const existingFavorite = await Favorite.findOne({ user: userId, property: propertyId });

    if (existingFavorite) {
      // Unfavorite
      await Favorite.findByIdAndDelete(existingFavorite._id);
      return res.status(200).json({
        status: "success",
        message: "Removed from favorites",
        isFavorite: false,
      });
    } else {
      // Favorite
      await Favorite.create({ user: userId, property: propertyId });
      return res.status(201).json({
        status: "success",
        message: "Added to favorites",
        isFavorite: true,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Get current user's favorites
export const getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Find favorites and populate property details
    const favorites = await Favorite.find({ user: userId })
      .populate({
        path: "property",
        select: "propertyName address price images slug propertyType roomType amenities",
      })
      .sort("-createdAt")
      .lean();

    // Filter out any favorites where the property was deleted
    const validFavorites = favorites.filter(fav => fav.property != null);

    res.status(200).json({
      status: "success",
      results: validFavorites.length,
      data: validFavorites,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

// Check if a specific property is favorited
export const checkFavoriteStatus = async (req, res, next) => {
  try {
    const propertyId = req.params.propertyId;
    const userId = req.user._id;

    const existingFavorite = await Favorite.findOne({ user: userId, property: propertyId }).lean();

    res.status(200).json({
      status: "success",
      isFavorite: !!existingFavorite,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
