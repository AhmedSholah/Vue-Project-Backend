/**
 * @function getKPIs
 * @description
 * Fetches key performance indicators (KPIs) for the admin dashboard.
 *
 * This includes:
 *  - Total revenue (optionally filtered by date range)
 *  - Total number of orders (optionally filtered by date range)
 *  - Average order value (optionally filtered by date range)
 *  - Total number of products (optionally filtered by date range)
 *  - Total number of customers (all-time, no date filter)
 *  - Total number of users (including admin, all-time)
 *  - Number of new customers in the last week, month, and year
 *  - Distribution of orders by status (e.g., pending, delivered)
 *  - Revenue over time (daily, weekly, or monthly, grouped by `createdAt` or `simulatedCreatedAt`)
 *
 * @route GET /api/kpis
 *
 * @query
 * @param {string} [start] - (optional) Start date for filtering revenue, orders, and products (ISO format).
 * @param {string} [end] - (optional) End date for filtering revenue, orders, and products (ISO format).
 * @param {boolean} [useSimulated=false] - (optional) If true, use 'simulatedCreatedAt' instead of 'createdAt' for filtering.
 * @param {string} [groupBy=day] - (optional) Granularity for revenueOverTime data. Accepts 'day', 'week', or 'month'.
 *
 * @returns {Object} JSON response containing:
 *  - {number} totalRevenue: Total revenue (in the given range, if provided).
 *  - {number} orderCount: Number of orders (in the given range, if provided).
 *  - {number} avgOrderValue: Average revenue per order (in the given range, if provided).
 *  - {number} productCount: Number of products created (in the given range, if provided).
 *  - {number} totalCustomers: Total number of customers (role: customer only, all time).
 *  - {number} totalUsers: Total number of users (all roles, all time).
 *  - {Object} newCustomers:
 *      - {number} thisWeek: Customers registered in the last 7 days.
 *      - {number} thisMonth: Customers registered in the last 30 days.
 *      - {number} thisYear: Customers registered in the last 365 days.
 *  - {Array<Object>} orderStatusDistribution: Array of objects with `status` and `count` of orders grouped by status.
 *  - {Array<Object>} revenueOverTime: Array of objects with `_id` as the grouped date (by day, week, or month) and `total` as revenue.
 *
 * @example
 * // Get KPIs for orders and revenue between April 1st and April 20th
 * GET /api/kpis?start=2024-04-01&end=2024-04-20
 *
 * @example
 * // Get KPIs based on simulated created dates
 * GET /api/kpis?useSimulated=true
 *
 * @example
 * // Get KPIs grouped by month
 * GET /api/kpis?start=2024-01-01&end=2024-12-31&groupBy=month
 *
 * @note
 * - If no `start` and `end` dates are provided, KPIs are calculated on all available data.
 * - `groupBy` affects only the `revenueOverTime` field and can be 'day', 'week', or 'month'.
 * - Customer statistics (total and new customers) are **always based on real dates**, not simulated dates.
 */

const Order = require("../models/order.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");
const asyncWrapper = require("../middlewares/asyncWrapper");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");
const Role = require("../models/role.model");

const getKPIs = asyncWrapper(async (req, res, next) => {
    const { start, end, useSimulated, groupBy = "day" } = req.query;
    const dateField = useSimulated === "true" ? "simulatedCreatedAt" : "createdAt";

    const dateFilter = {};
    if (start && end) {
        dateFilter[dateField] = {
            $gte: new Date(start),
            $lte: new Date(end),
        };
    }

    const groupOptions = {
        day: "%Y-%m-%d",
        week: "%G-%V",
        month: "%Y-%m",
    };
    const dateFormat = groupOptions[groupBy] || groupOptions.day;

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const countNewCustomersSince = (date) => User.countDocuments({ [dateField]: { $gte: date } });

    const customerRole = await Role.findOne({ name: "customer" });
    if (!customerRole) {
        return next(AppError.create("Customer role not found", 500));
    }
    const [
        totalRevenueData,
        orderCount,
        avgOrderValueData,
        totalCustomers,
        totalUsers,
        productCount,
        weekNewCustomers,
        monthNewCustomers,
        yearNewCustomers,
        orderStatusCounts,
        revenueOverTime,
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

        User.countDocuments({ role: customerRole }),
        User.countDocuments(),

        Product.countDocuments(dateFilter),

        countNewCustomersSince(startOfWeek),
        countNewCustomersSince(startOfMonth),
        countNewCustomersSince(startOfYear),

        Order.aggregate([
            { $match: dateFilter },
            { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
        ]),

        Order.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: dateFormat,
                            date: `$${dateField}`,
                            timezone: "Africa/Cairo",
                        },
                    },
                    total: { $sum: "$totalPrice" },
                },
            },
            { $sort: { _id: 1 } },
        ]),
    ]);

    const totalRevenue = totalRevenueData[0]?.total || 0;
    const avgOrderValue =
        avgOrderValueData[0]?.count > 0
            ? avgOrderValueData[0].total / avgOrderValueData[0].count
            : 0;

    const orderStatusDistribution = orderStatusCounts.map((item) => ({
        status: item._id,
        count: item.count,
    }));

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            totalRevenue,
            orderCount,
            avgOrderValue,
            totalCustomers,
            totalUsers,
            productCount,
            newCustomers: {
                thisWeek: weekNewCustomers,
                thisMonth: monthNewCustomers,
                thisYear: yearNewCustomers,
            },
            orderStatusDistribution,
            revenueOverTime,
        },
    });
});

module.exports = { getKPIs };
