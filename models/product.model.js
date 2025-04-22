const mongoose = require("mongoose");
const FavoriteModel = require("./favorite.model");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: [3, "name must be at least 3 characters long"],
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
        imageNames: [
            {
                type: String,
                // required: true,
            },
        ],
        discountAmount: {
            type: Number,
            default: 0,
            min: 0,
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        description: {
            type: String,
            required: true,
            minlength: [
                100,
                "Description must be at least 100 characters long.",
            ],
            maxLength: [5000, "Description cannot exceed 5000 characters."],
        },
        views: {
            type: Number,
            default: 0,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        // weight: {
        //     type: Number,
        //     required: true,
        //     min: 0,
        // },
        // dimensions: {
        //     type: {
        //         length: { type: Number, min: 0, required: true },
        //         width: { type: Number, min: 0, required: true },
        //         height: { type: Number, min: 0, required: true },
        //     },
        // },
        shippingInfo: {
            type: {
                shippingCost: { type: Number, min: 0, required: true },
                estimatedDelivery: { type: Number, min: 0, required: true },
            },
        },
        tags: [
            {
                type: String,
                enum: [
                    "new_arrival",
                    "sale",
                    "eco_friendly",
                    "limited_edition",
                    "handmade",
                    "bestseller",
                ],
            },
        ],
        soldBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

productSchema.virtual("priceAfterDiscount").get(function () {
    const calculatedPrice =
        this.price -
        this.discountAmount -
        this.price * (this.discountPercentage / 100);

    return Math.max(calculatedPrice, 0);
});

productSchema.virtual("images").get(function () {
    if (!this.imageNames || this.imageNames.length === 0) {
        return [];
    }
    return this.imageNames.map(
        (imageName) => `${process.env.AWS_S3_PUBLIC_BUCKET_URL}${imageName}`
    );
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
