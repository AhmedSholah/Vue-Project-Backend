const router = require("express").Router();
const asyncWrapper = require("../middlewares/asyncWrapper");
const permissionController = require("../controllers/permission.controller");

router
    .route("/")
    .get(asyncWrapper(permissionController.getPermissions))
    .post(asyncWrapper(permissionController.createPermission));

module.exports = router;
