import { Property } from "../Models/propertyModel.js";
import { Booking } from "../Models/bookingModel.js";
import Inquiry from "../Models/inquiryModel.js";
import Favorite from "../Models/favoriteModel.js";
import { User } from "../Models/userModel.js";
import mongoose from "mongoose";

export const getOwnerAnalytics = async (req, res) => {
  try {
    const ownerId = req.user._id;

    // 1. Get owner's properties
    const properties = await Property.find({ userId: ownerId }).select("_id propertyName views");
    const propertyIds = properties.map(p => p._id);

    if (propertyIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          overview: { views: 0, favorites: 0, inquiries: 0, bookings: 0, revenue: 0, conversionRate: 0 },
          inquiries: { total: 0, accepted: 0, rejected: 0, pending: 0 },
          topProperties: [],
          monthlyTrends: []
        }
      });
    }

    // 2. Overview Metrics
    const totalViews = properties.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalFavorites = await Favorite.countDocuments({ property: { $in: propertyIds } });

    // 3. Inquiries
    const allInquiries = await Inquiry.find({ owner: ownerId });
    const inquiriesStats = {
      total: allInquiries.length,
      accepted: allInquiries.filter(i => i.status === "accepted").length,
      rejected: allInquiries.filter(i => i.status === "rejected").length,
      pending: allInquiries.filter(i => i.status === "pending").length,
    };

    // 4. Bookings & Revenue
    // Using aggregation to efficiently calculate revenue and top properties
    const bookingStats = await Booking.aggregate([
      { 
        $match: { 
          property: { $in: propertyIds },
          paymentStatus: "SUCCESS"
        } 
      },
      {
        $group: {
          _id: "$property",
          totalBookings: { $sum: 1 },
          revenue: { $sum: "$price" }
        }
      }
    ]);

    let totalBookings = 0;
    let totalRevenue = 0;
    
    // Map booking stats to properties to find top performers
    const propertyPerformance = properties.map(p => {
      const stats = bookingStats.find(s => s._id.toString() === p._id.toString()) || { totalBookings: 0, revenue: 0 };
      totalBookings += stats.totalBookings;
      totalRevenue += stats.revenue;
      
      return {
        _id: p._id,
        propertyName: p.propertyName,
        views: p.views || 0,
        bookings: stats.totalBookings,
        revenue: stats.revenue,
        conversionRate: p.views > 0 ? ((stats.totalBookings / p.views) * 100).toFixed(2) : 0
      };
    });

    // Sort by revenue descending for top properties
    const topProperties = propertyPerformance.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    
    const conversionRate = totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(2) : 0;

    // 5. Monthly Trends (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrends = await Booking.aggregate([
      {
        $match: {
          property: { $in: propertyIds },
          paymentStatus: "SUCCESS",
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$price" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Format monthly trends for easier frontend consumption
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedTrends = monthlyTrends.map(t => ({
      month: `${monthNames[t._id.month - 1]} ${t._id.year}`,
      bookings: t.bookings,
      revenue: t.revenue
    }));

    res.status(200).json({
      success: true,
      data: {
        overview: {
          views: totalViews,
          favorites: totalFavorites,
          inquiries: inquiriesStats.total,
          bookings: totalBookings,
          revenue: totalRevenue,
          conversionRate
        },
        inquiries: inquiriesStats,
        topProperties,
        monthlyTrends: formattedTrends
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    // 1. Overview Metrics
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    
    // Booking overview
    const bookingStats = await Booking.aggregate([
      { $match: { paymentStatus: "SUCCESS" } },
      { $group: { _id: null, totalBookings: { $sum: 1 }, totalRevenue: { $sum: "$price" } } }
    ]);
    const totalBookings = bookingStats.length > 0 ? bookingStats[0].totalBookings : 0;
    const totalRevenue = bookingStats.length > 0 ? bookingStats[0].totalRevenue : 0;

    // Pending inquiries
    const pendingInquiries = await Inquiry.countDocuments({ status: "pending" });

    // 2. Six Months Trends
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Bookings/Revenue Trend
    const monthlyBookingTrends = await Booking.aggregate([
      { $match: { paymentStatus: "SUCCESS", createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, bookings: { $sum: 1 }, revenue: { $sum: "$price" } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Inquiry Trend
    const monthlyInquiryTrends = await Inquiry.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, inquiries: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // User Growth Trend
    const monthlyUserTrends = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, users: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const combinedTrends = [];
    let current = new Date(sixMonthsAgo);
    const now = new Date();
    
    while (current <= now) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1; // 1-12
      const monthLabel = `${monthNames[month - 1]} ${year}`;

      const bTrend = monthlyBookingTrends.find(t => t._id.year === year && t._id.month === month);
      const iTrend = monthlyInquiryTrends.find(t => t._id.year === year && t._id.month === month);
      const uTrend = monthlyUserTrends.find(t => t._id.year === year && t._id.month === month);

      combinedTrends.push({
        month: monthLabel,
        bookings: bTrend ? bTrend.bookings : 0,
        revenue: bTrend ? bTrend.revenue : 0,
        inquiries: iTrend ? iTrend.inquiries : 0,
        newUsers: uTrend ? uTrend.users : 0
      });
      
      current.setMonth(current.getMonth() + 1);
    }

    // 3. Most Popular Properties
    const topPropertiesStats = await Booking.aggregate([
      { $match: { paymentStatus: "SUCCESS" } },
      { $group: { _id: "$property", totalBookings: { $sum: 1 } } },
      { $sort: { totalBookings: -1 } },
      { $limit: 5 }
    ]);
    
    const topPropertyIds = topPropertiesStats.map(p => p._id);
    const topPropertiesRaw = await Property.find({ _id: { $in: topPropertyIds } }).select("propertyName address");
    
    const popularProperties = topPropertiesStats.map(stat => {
      const prop = topPropertiesRaw.find(p => p._id.toString() === stat._id.toString());
      return {
        _id: stat._id,
        propertyName: prop ? prop.propertyName : "Unknown",
        location: prop && prop.address ? prop.address.city : "Unknown",
        bookings: stat.totalBookings
      };
    });

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalProperties,
          totalBookings,
          totalRevenue,
          pendingInquiries
        },
        trends: combinedTrends,
        popularProperties
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
