const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        unique: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        items: {
            type: [cartItemSchema],
            // default: [],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

cartSchema.virtual("totalPrice").get(function () {
    return this.items.reduce((total, item) => {
        return total + item.quantity * item.product.priceAfterDiscount;
    }, 0);
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
