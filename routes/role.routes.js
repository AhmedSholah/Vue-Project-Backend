const router = require("express").Router();
const roleController = require("../controllers/role.controller");
const asyncWrapper = require("../middlewares/asyncWrapper");
const checkPermission = require("../middlewares/checkPermission");

router
    .route("/")
    .get(checkPermission("view_roles"), asyncWrapper(roleController.getRoles))
    .post(checkPermission("create_role"), asyncWrapper(roleController.createRole));

router.route("/:roleId").patch(roleController.updateRole);

module.exports = router;
