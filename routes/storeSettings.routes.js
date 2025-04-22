const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const validateSchema = require("../middlewares/validateSchema");
const {
  getStoreSettings,
  updateStoreSettings,
} = require("../controllers/storeSettings.controller");
const {
  partialStoreSettingsSchema,
} = require("../utils/validation/storeSettings");

router
  .route("/")
  .get(
    // isAuthenticated,
    // checkRole(['admin','super-admin']),
    getStoreSettings
  )
  .patch(
    // isAuthenticated,
    //  checkRole(["super-admin"]),
    validateSchema(partialStoreSettingsSchema),
    updateStoreSettings
  );
module.exports = router;
