const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const orderController = require("../controllers/order.controller");

router
    .route("/")
    .get(isAuthenticated, orderController.getAllUserOrders)
    .post(isAuthenticated, orderController.createOrder);

router
    .route("/admin")
    .get(isAuthenticated, checkRole(["admin"]), orderController.getAllOrders);

router.route("/:orderId").get(isAuthenticated, orderController.getOrder).patch(
    isAuthenticated,
    // checkRole(["", "seller", "admin"]),
    orderController.updateOrderStatus
);
// .delete(isAuthenticated, deleteOrder);

module.exports = router;
