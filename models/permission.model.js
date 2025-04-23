const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        code: { type: String, required: true, unique: true },
        createdAt: { type: Date, required: true, default: Date.now() },
    },
    // {
    //     timestamps: true,
    // },
);

const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
