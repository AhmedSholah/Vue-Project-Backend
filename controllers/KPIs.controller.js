const Order = require("../models/order.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

// GET /api/dashboard/kpis?start=2025-04-01&end=2025-04-22

const getKPIs = asyncWrapper(async (req, res, next) => {
  const { start, end } = req.query;

  // Construct date filter if both dates are provided
  const dateFilter = {};
  if (start && end) {
    dateFilter.createdAt = {
      $gte: new Date(start),
      $lte: new Date(end),
    };
  }

  const [
    totalRevenueData,
    orderCount,
    avgOrderValueData,
    userCount,
    productCount,
  ] = await Promise.all([
    // Total Revenue
    Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),

    // Number of Orders
    Order.countDocuments(dateFilter),

    // Average Order Value (same total / count logic)
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
    ]),

    // New Customers
    User.countDocuments({ ...dateFilter }),

    // New Products
    Product.countDocuments(dateFilter),
  ]);

  const totalRevenue = totalRevenueData[0]?.total || 0;
  const avgOrderValue =
    avgOrderValueData[0]?.count > 0
      ? avgOrderValueData[0].total / avgOrderValueData[0].count
      : 0;

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      totalRevenue,
      orderCount,
      avgOrderValue,
      customerCount: userCount,
      productCount,
    },
  });
});

module.exports = { getKPIs };
