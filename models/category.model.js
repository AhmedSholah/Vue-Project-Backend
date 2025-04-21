const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique: true,
            minlength: [3, "String must be at least 3 characters long"],
            maxLength: [32, "String must be at least 32 characters long"],
        },
        image: {
            type: String,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

categorySchema.virtual("imageUrl").get(function () {
    if (this.image) {
        return process.env.AWS_S3_PUBLIC_BUCKET_URL + this.image;
    } else {
        return null;
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
