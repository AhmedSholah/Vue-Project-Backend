const router = require("express").Router();
const roleController = require("../controllers/role.controller");
const asyncWrapper = require("../middlewares/asyncWrapper");

router
    .route("/")
    .get(asyncWrapper(roleController.getRoles))
    .post(asyncWrapper(roleController.createRole));

router.route("/:roleId").patch(roleController.updateRole);

module.exports = router;
