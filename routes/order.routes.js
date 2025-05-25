const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const orderController = require("../controllers/order.controller");
const checkPermission = require("../middlewares/checkPermission");

router
    .route("/")
    .get(isAuthenticated, orderController.getAllUserOrders)
    .post(isAuthenticated, orderController.createOrder);

router
    .route("/admin")
    .get(isAuthenticated, checkPermission("view_all_user_orders"), orderController.getAllOrders);

router.route("/:orderId").get(isAuthenticated, orderController.getOrder).patch(
    isAuthenticated,
    checkPermission("update_order"),
    // orderController.updateOrderStatus,
    orderController.generalOrderUpdate,
);
// .delete(
// isAuthenticated,
// deleteOrder);

module.exports = router;
