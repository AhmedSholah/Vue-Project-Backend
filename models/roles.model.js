// // const mongoose = require("mongoose");

// // const rolesSchema = new mongoose.Schema({
// //     name: {
// //         type: String,
// //         required: true,
// //     },
// //     permissions: {
// //         type: [String],
// //         emun: ["view_order"],
// //     },
// // });

// // const Role = mongoose.model("Role", rolesSchema);

// // module.exports = Role;
// const mongoose = require("mongoose");

// const DEFAULT_PERMISSIONS = {
//     customer: ["view_products", "place_order"],
//     admin: ["manage_products", "view_orders", "update_order_status"],
//     "super-admin": [
//         "manage_products",
//         "view_orders",
//         "update_order_status",
//         "manage_users",
//         "manage_roles",
//     ],
// };

// const rolesSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         enum: ["customer", "seller", "admin", "super-admin"],
//     },
//     permissions: {
//         type: [String],
//         default: [],
//     },
// });

// // Set default permissions before saving, only if permissions not manually set
// rolesSchema.pre("save", function (next) {
//     if (!this.permissions || this.permissions.length === 0) {
//         this.permissions = DEFAULT_PERMISSIONS[this.name] || [];
//     }
//     next();
// });

// const Role = mongoose.model("Role", rolesSchema);

// module.exports = Role;
