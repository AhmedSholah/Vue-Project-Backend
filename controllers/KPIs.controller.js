const Order = require("../models/order.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

/**
 * @function getKPIs
 * @description
 * Fetches key performance indicators (KPIs) for the admin dashboard.
 * This includes:
 *  - Total revenue (optionally filtered by date range)
 *  - Total number of orders (optionally filtered by date range)
 *  - Average order value (optionally filtered by date range)
 *  - Total number of products (optionally filtered by date range)
 *  - Total number of customers (all-time, no date filter)
 *  - Number of new customers in the last week, month, and year
 *
 * @route GET /api/kpis
 *
 * @query
 * @param {string} [start] - (optional) Start date for filtering revenue, orders, and products (ISO format).
 * @param {string} [end] - (optional) End date for filtering revenue, orders, and products (ISO format).
 * @param {boolean} [useSimulated=false] - (optional) If true, use 'simulatedCreatedAt' instead of 'createdAt' for filtering.
 *
 * @returns {Object} JSON response containing:
 *  - {number} totalRevenue: Total revenue (in the given range, if provided).
 *  - {number} orderCount: Number of orders (in the given range, if provided).
 *  - {number} avgOrderValue: Average revenue per order (in the given range, if provided).
 *  - {number} productCount: Number of products created (in the given range, if provided).
 *  - {number} totalCustomerCount: Total number of customers (no date range).
 *  - {number} newCustomersThisWeek: Number of customers registered in the last 7 days.
 *  - {number} newCustomersThisMonth: Number of customers registered in the last 30 days.
 *  - {number} newCustomersThisYear: Number of customers registered in the last 365 days.
 *
 * @example
 * // Get KPIs for orders and revenue between April 1st and April 20th
 * GET /api/kpis?start=2024-04-01&end=2024-04-20
 *
 * @example
 * // Get KPIs based on simulated created dates
 * GET /api/kpis?useSimulated=true
 *
 * @note
 * - If no start and end dates are provided, KPIs are calculated on all available data.
 * - Customer statistics (total and new customers) are **always based on real dates**, not simulated dates.
 */

const getKPIs = asyncWrapper(async (req, res, next) => {
    const { start, end, useSimulated } = req.query;
    const dateField = useSimulated === "true" ? "simulatedCreatedAt" : "createdAt";

    const dateFilter = {};
    if (start && end) {
        dateFilter[dateField] = {
            $gte: new Date(start),
            $lte: new Date(end),
        };
    }

    const now = new Date();

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
        totalRevenueData,
        orderCount,
        avgOrderValueData,
        totalCustomers,
        productCount,
        weekNewCustomers,
        monthNewCustomers,
        yearNewCustomers,
    ] = await Promise.all([
        Order.aggregate([
            { $match: dateFilter },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),

        Order.countDocuments(dateFilter),

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

        User.countDocuments(),

        Product.countDocuments(dateFilter),

        User.countDocuments({ [dateField]: { $gte: startOfWeek } }),

        User.countDocuments({ [dateField]: { $gte: startOfMonth } }),

        User.countDocuments({ [dateField]: { $gte: startOfYear } }),
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
            totalCustomers,
            productCount,
            newCustomers: {
                thisWeek: weekNewCustomers,
                thisMonth: monthNewCustomers,
                thisYear: yearNewCustomers,
            },
        },
    });
});

module.exports = { getKPIs };
