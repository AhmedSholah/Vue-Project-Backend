const asyncWrapper = require("../middlewares/asyncWrapper");
const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");
const UserModel = require("../models/user.model");
const CartModel = require("../models/cart.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const Order = require("../models/order.model");
const Product = require("../models/product.model");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const getAllUserOrders = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;

    //   const orders = await OrderModel.find({ user: userId }).populate(
    //     "orderItems.product"
    //   );
    const features = new APIFeatures(OrderModel.find({ user: userId }), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const orders = await features.query.populate("orderItems.product");

    if (!orders || orders.length === 0) {
        return next(AppError.create("No Orders Found!", 404, httpStatusText.FAIL));
    }

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: orders });
});

// =========================================================================
const createOrder = asyncWrapper(async (req, res, next) => {
    const {
        user,
        shippingAddress,
        paymentMethod,
        totalPrice,
        orderItems,
        orderStatus = "pending",
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
        return next(AppError.create("Order must contain at least one item", 400));
    }

    const existingUser = await UserModel.findById(user).select("email");
    if (!existingUser) return next(AppError.create("User not found", 404));

    for (let item of orderItems) {
        const product = await Product.findById(item.product);
        if (!product) {
            return next(AppError.create(`Product not found: ${item.product}`, 404));
        }

        if (product.quantity < item.quantity) {
            return next(AppError.create(`${product.name} is out of stock`, 400));
        }

        product.quantity -= item.quantity;
        await product.save();

        validatedItems.push({
            product: product._id,
            quantity: item.quantity,
            price: item.price ?? product.priceAfterDiscount,
        });
    }

    const latestOrder = await OrderModel.findOne().sort({ createdAt: -1 }).limit(1);
    const nextOrderNumber = latestOrder?.orderNumber ? latestOrder.orderNumber + 1 : 1;

    const newOrder = await OrderModel.create({
        user,
        orderItems: validatedItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
        orderStatus,
        orderNumber: nextOrderNumber,
    });

    return res.status(201).json({
        message: "Order created successfully",
        order: newOrder,
    });
});

const updateOrderStatus = asyncWrapper(async (req, res, next) => {
    const orderId = req.params.orderId;
    const { orderStatus } = req.body;

    const order = await OrderModel.findById(orderId);

    if (!order) {
        return next(AppError.create("No Orders Found!", 404, httpStatusText.FAIL));
    }

    order.orderStatus = orderStatus;

    await order.save();

    const updatedOrder = await OrderModel.findById(orderId, { __V: false });

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: updatedOrder });
});
const generalOrderUpdate = asyncWrapper(async (req, res, next) => {
    const orderId = req.params.orderId;
    const updates = req.body;
    const order = await OrderModel.findById(orderId);
    if (!order) {
        return next(AppError.create("Order not found!", 404, httpStatusText.FAIL));
    }

    Object.assign(order, updates);

    await order.save();

    const updatedOrder = await OrderModel.findById(orderId)
        .populate("user", "-password")
        .populate("orderItems.product")
        .select("-__v");

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: updatedOrder,
    });
});

const getOrder = asyncWrapper(async (req, res, next) => {
    const orderId = req.params.orderId;
    const { userId } = req.tokenPayload;

    const order = await OrderModel.findOne({
        _id: orderId,
        // user: userId,
    }).populate("orderItems.product");

    if (!order) {
        return next(AppError.create("Order Not Found!", 404, httpStatusText.FAIL));
    }

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: order,
    });
});

const getAllOrders = asyncWrapper(async (req, res, next) => {
    //   const orders = await OrderModel.find({}).populate("orderItems.product");

    //   if (!orders) {
    //     return next(AppError.create("No Orders Found!", 404, httpStatusText.FAIL));
    //   }

    const features = new APIFeatures(OrderModel.find().populate("user"), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const orders = await features.query.populate("orderItems.product");
    const totalOrders = await OrderModel.countDocuments();

    // if (!orders || orders.length === 0) {
    //     return next(AppError.create("No Orders Found!", 404, httpStatusText.FAIL));
    // }

    return res.status(200).json({ status: httpStatusText.SUCCESS, totalOrders, data: orders });
});

module.exports = {
    getAllUserOrders,
    createOrder,
    updateOrderStatus,
    getOrder,
    getAllOrders,
    generalOrderUpdate,
};
