const Order = require("../models/orderModel");
const User = require("../models/userModel");
const AppError = require("../utilities/appError");
const catchAsync = require("../utilities/catchAsync");

const deleteOrder = catchAsync(async (req, res, next) => {
  const orderId = req.params.id;

  const order = await Order.findByIdAndDelete(orderId);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  const userUpdateResult = await User.updateMany(
    { "orders._id": orderId },
    { $pull: { orders: { _id: orderId } } }
  );

  console.log("User update result:", userUpdateResult);

  if (userUpdateResult.modifiedCount === 0) {
    return next(new AppError("Order not found in user's orders array", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Order deleted successfully",
  });
});

module.exports = deleteOrder;
