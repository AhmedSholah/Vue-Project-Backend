const router = require("express").Router();
// Controllers
const cartController = require("../controllers/cart.controller");
// Middlewares
const isAuthenticated = require("../middlewares/isAuthenticated");
const validateSchema = require("../middlewares/validateSchema");
// Validation
const cartValidation = require("../utils/validation/cartValidation");

router
    .route("/")
    .get(isAuthenticated, cartController.getCart)
    .post(isAuthenticated, validateSchema(cartValidation.addToCartSchema), cartController.addToCart)
    .patch(
        isAuthenticated,
        validateSchema(cartValidation.addToCartSchema),
        cartController.updateCartItem,
    );

router.route("/clear").delete(isAuthenticated, cartController.clearCart);

router
    .route("/:productId")
    .delete(
        isAuthenticated,
        validateSchema(cartValidation.removeCartItemSchema, "params"),
        cartController.removeCartItem,
    );

module.exports = router;
