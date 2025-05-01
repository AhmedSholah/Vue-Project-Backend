const Role = require("../models/role.model");
const httpStatusText = require("../utils/httpStatusText");

async function createRole(req, res, next) {
    const { name, permissions } = req.body;
    const role = await Role.create({
        name,
        permissions,
    });

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            role,
        },
    });
}

async function getRoles(req, res, next) {
    const roles = await Role.find().populate("permissions").lean();

    res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            roles,
        },
    });
}

async function updateRole(req, res, next) {
    const { name, permissions } = req.body;
    const { roleId } = req.params;

    const role = await Role.findByIdAndUpdate(roleId, { name, permissions }, { new: true });

    res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: {
            role,
        },
    });
}

module.exports = {
    createRole,
    getRoles,
    updateRole,
};
