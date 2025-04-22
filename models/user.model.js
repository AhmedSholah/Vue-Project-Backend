const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: [1, "Name must be at least 3 characters long"],
            maxlength: [16, "Name must be at most 16 characters long"],
        },
        // lastName: {
        //     type: String,
        //     required: true,
        //     minlength: [1, "last Name must be at least 3 characters long"],
        //     maxlength: [16, "last Name must be at most 16 characters long"],
        // },
        provider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },
        phoneNumber: {
            type: String,
            minlength: [11, "Phone number must be 11 characters long"],
            maxlength: [11, "Phone number must be 11 characters long"],
        },
        // country: {
        //     type: String,
        //     enum: ["Egypt"],
        // },
        // city: {
        //     type: String,
        //     enum: egyptianCities,
        // },
        adress: {
            type: String,
        },
        // bio: {
        //     type: String,
        //     minlength: [3, "bio must be at least 3 characters long"],
        // },
        tags: {
            type: String,
            enum: ["regular", "premium "],
            default: "regular",
        },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/,
        },
        password: {
            type: String,
            // required: true,
            minlength: [8, "Password must be at least 8 characters long"],
            maxlength: [256, "Password must be at most 256 characters long"],
            validate: {
                validator: function (value) {
                    return (
                        /[A-Z]/.test(value) &&
                        /[a-z]/.test(value) &&
                        /[0-9]/.test(value) &&
                        /[!@#$%^&*(),.?":{}|<>]/.test(value) &&
                        !/\s/.test(value)
                    );
                },
                message:
                    "Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and must not contain spaces.",
            },
        },
        avatar: {
            type: String,
        },
        gender: {
            type: String,
            enum: ["male", "female"],
        },
        role: {
            // type: mongoose.Schema.Types.ObjectId,
            // ref: "Role",
            // default: async function () {
            //     const Role = require("./role.model");
            //     const defaultRole = await Role.findOne({ name: "customer" });
            //     return defaultRole?._id;
            // },
            // required: true,
            // },
            // role: {
            //     type: String,
            //     enum: ["customer", "seller", "admin", "super-admin"],
            //     default: "customer",
            //     required: true,
        },
        // permissions: { type: [String], enum: [] },
        wallet: {
            type: Number,
            default: 0,
        },
        segments: [
            {
                type: String,
                enum: [
                    "new_customer",
                    "premium_user",
                    "high_spender",
                    "frequent_buyer",
                    "inactive",
                    "vip",
                ],
            },
        ],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    },
);

userSchema.virtual("avatarUrl").get(function () {
    if (this.avatar?.split("/")[0] === "users") {
        return process.env.AWS_S3_PUBLIC_BUCKET_URL + this.avatar;
    } else if (this.avatar?.split("/")[0] !== "users") {
        return this.avatar;
    } else {
        return null;
    }
});

userSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: "all",
});

const User = mongoose.model("User", userSchema);

module.exports = User;
