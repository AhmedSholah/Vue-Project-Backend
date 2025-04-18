const express = require("express");
const { protect } = require("../controllers/authController");
const deleteOrder = require("../controllers/orderController");
const router = express.Router();

router.delete("/:id", protect, deleteOrder);

module.exports = router;
