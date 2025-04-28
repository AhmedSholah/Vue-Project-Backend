const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const validateSchema = require("../middlewares/validateSchema");
const {
    getStoreSettings,
    updateStoreSettings,
} = require("../controllers/storeSettings.controller");
const { partialStoreSettingsSchema } = require("../utils/validation/storeSettings");
const checkPermission = require("../middlewares/checkPermission");

router
    .route("/")
    .get(isAuthenticated, checkPermission("view_store_settings"), getStoreSettings)
    .patch(
        isAuthenticated,
        checkPermission("update_store_settings"),
        validateSchema(partialStoreSettingsSchema),
        updateStoreSettings,
    );
module.exports = router;
