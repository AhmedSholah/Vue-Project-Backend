const User = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

const checkPermission = (requiredPermission) => async (req, res, next) => {
    const permissions = req.tokenPayload?.permissions;

    // console.log(permissions);
    // const user = await User.findById(userId)
    //     .populate({
    //         path: "role",
    //         populate: { path: "permissions", model: "Permission" },
    //     })
    //     .populate("permissions");

    // console.log(user);

    // if (!user) {
    //     return next(AppError.create("User not found", 404, httpStatusText.FAIL));
    // }

    // const rolePermissions = user.role?.permissions?.map((p) => p.code) || [];
    // const userPermissions = user.permissions.map((p) => p.code);
    // const allPermissions = [...rolePermissions, ...userPermissions];

    // if (allPermissions.includes(requiredPermission)) {
    if (permissions?.includes(requiredPermission)) {
        next();
    } else {
        return next(
            AppError.create(
                `Insufficient permissions. Required permission: ${requiredPermission}`,
                401,
                httpStatusText.FAIL,
            ),
        );
    }
};

module.exports = checkPermission;
