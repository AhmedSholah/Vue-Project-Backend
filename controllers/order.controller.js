const asyncWrapper = require("../middlewares/asyncWrapper");
const OrderModel = require("../models/order.model");
const ProductModel = require("../models/product.model");
const UserModel = require("../models/user.model");
const CartModel = require("../models/cart.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const APIFeatures = require("../utils/apiFeatures");
const Order = require("../models/order.model");

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
    const { userId } = req.tokenPayload;
    const { shippingAddress, paymentMethod } = req.body;

    const user = await UserModel.findById(userId).select("email");

    const cart = await CartModel.findOne({ user: userId }).populate("items.product");

    if (!cart.items || cart.items.length == 0) {
        return next(AppError.create("Cart Is Empty"));
    }

    let orderItems = [];

    for (let item of cart.items) {
        const product = item.product;

        // if (product.quantity < item.quantity) {
        //     return next(AppError.create(`${product.name} is out of stock`));
        // }

        // product.quantity -= item.quantity;
        await product.save();
        orderItems.push({
            product: product,
            quantity: item.quantity,
            price: product.priceAfterDiscount,
        });
    }

    const latestOrder = await OrderModel.findOne().sort({ createdAt: -1 }).limit(1);

    const order = new OrderModel({
        user: userId,
        orderItems: orderItems,
        shippingAddress,
        paymentMethod,
        totalPrice: cart.totalPrice,
        status: "Pending",
        orderNumber: latestOrder.orderNumber + 1,
    });

    await order.save();
    cart.items = [];
    await cart.save();

    const sessionItems = [];

    orderItems.map((item) => {
        sessionItems.push({
            price_data: {
                currency: "egp",
                product_data: {
                    name: item.product.name,
                },
                unit_amount: item.product.priceAfterDiscount * 100,
            },
            quantity: item.quantity,
        });
    });

    const session = await stripe.checkout.sessions.create({
        line_items: sessionItems,
        mode: "payment",
        // shipping_address_collection: {
        //     allowed_countries: ["EG", "SA"],
        // },
        customer_email: user.email,
        // payment_method_types: ["card"],
        // shipping_options: [
        //     {
        //         shipping_rate_data: {
        //             type: "fixed_amount",
        //             fixed_amount: { amount: 2500, currency: "egp" },
        //             display_name: "Standard Shipping",
        //             delivery_estimate: {
        //                 minimum: { unit: "business_day", value: 5 },
        //                 maximum: { unit: "business_day", value: 7 },
        //             },
        //         },
        //     },
        // ],

        billing_address_collection: "auto",
        success_url: `https://craftopia-angular.vercel.app/checkout-confirmation`,
        cancel_url: `https://craftopia-angular.vercel.app`,

        metadata: {
            orderId: order._id.toString(),
            userId: userId.toString(),
        },
    });

    return res.status(201).json(session.url);
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

const getOrder = asyncWrapper(async (req, res, next) => {
    const orderId = req.params.orderId;
    const { userId } = req.tokenPayload;

    const order = await OrderModel.findOne({
        _id: orderId,
        user: userId,
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
};
