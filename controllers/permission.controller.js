const Permission = require("../models/permission.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

async function createPermission(req, res, next) {
    const { name, code } = req.body;

    const permission = await Permission.create({
        name,
        code,
    });

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            permission,
        },
    });
}

async function getPermissions(req, res, next) {
    const permissions = await Permission.find({});

    if (!permissions) return next(new AppError("No permissions found", 404));

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            permissions,
        },
    });
}

module.exports = {
    createPermission,
    getPermissions,
};
