const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderItems: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
        shippingAddress: {
            type: String,
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ["wallet", "visa"],
            default: "wallet",
        },
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed", "refunded"],
            default: "pending",
        },
        orderStatus: {
            type: String,
            enum: ["processing", "shipped", "delivered", "cancelled"],
            default: "processing",
        },
        orderNumber: {
            type: Number,
            default: 0,
        },
        simulatedCreatedAt: {
            type: Date,
            default: Date.now(),
        },
        deliveredAt: Date,
    },
    { timestamps: true },
);

orderSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
