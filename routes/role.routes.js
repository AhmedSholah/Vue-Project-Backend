const router = require("express").Router();
const roleController = require("../controllers/role.controller");
const asyncWrapper = require("../middlewares/asyncWrapper");
const checkPermission = require("../middlewares/checkPermission");
const isAuthenticated = require("../middlewares/isAuthenticated");

router
    .route("/")
    .get(isAuthenticated, checkPermission("view_roles"), asyncWrapper(roleController.getRoles))
    .post(isAuthenticated, checkPermission("create_role"), asyncWrapper(roleController.createRole));

router
    .route("/:roleId")
    .patch(isAuthenticated, checkPermission("edit_roles"), roleController.updateRole)
    .delete(isAuthenticated, checkPermission("delete_roles"), roleController.deleteRole);

module.exports = router;
