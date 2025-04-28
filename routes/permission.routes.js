const router = require("express").Router();
const asyncWrapper = require("../middlewares/asyncWrapper");
const permissionController = require("../controllers/permission.controller");
const checkPermission = require("../middlewares/checkPermission");

router
    .route("/")
    .get(
        // checkPermission("view_permissions"),
        asyncWrapper(permissionController.getPermissions),
    )
    .post(
        asyncWrapper(
            // checkPermission("create_permission"),
            permissionController.createPermission,
        ),
    );

module.exports = router;
