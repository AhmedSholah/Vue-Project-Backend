const router = require("express").Router();
const favoriteController = require("../controllers/favorite.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const validateSchema = require("../middlewares/validateSchema");
const favoriteValidation = require("../utils/validation/favoriteValidation");

router
    .route("/")
    .get(isAuthenticated, favoriteController.getFavorite)
    .post(
        isAuthenticated,
        validateSchema(favoriteValidation.favoriteSchema),
        favoriteController.addToFavoriteItem
    );

router
    .route("/:productId")
    .delete(
        isAuthenticated,
        validateSchema(favoriteValidation.favoriteSchema, "params"),
        favoriteController.deleteFavoriteItem
    );

module.exports = router;
