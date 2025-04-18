const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
    },
    brand: {
      type: String,
      required: [true, "A product must have a brand"],
    },
    categories: {
      // type: mongoose.Schema.Types.ObjectId,
      // ref: "Category",
      // required: [true, "A product must belong to a category"],
      type: [String],
      required: [true, "A product must belong to a category"],
    },
    tags: {
      type: [String],
      required: [true, "A product must have tags"],
    },
    imageUrl: {
      type: [String],
      required: [true, "A product must have an image"],
    },
    description: {
      type: String,
      required: [true, "A product must have a description"],
      trim: true,
    },
    color: {
      type: [String],
    },

    stock: {
      type: Number,
      default: 50,
    },
    rating: {
      type: Number,
      default: 4.5,
    },
    release_date: {
      type: Date,
      default: Date.now(),
    },
    size: {
      type: [String],
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// productSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "category",
//     select: "name description",
//   });
//   next();
// });

// productSchema.virtual("reviews", {
//   ref: "Review",
//   foreignField: "product",
//   localField: "_id",
// });
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
