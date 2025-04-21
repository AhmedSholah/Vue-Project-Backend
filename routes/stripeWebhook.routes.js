const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../models/order.model");

router.post(
    "/",
    express.raw({ type: "application/json" }),
    async (req, res) => {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                endpointSecret
            );
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;

            try {
                const orderId = session.metadata.orderId;

                await Order.findByIdAndUpdate(orderId, {
                    paymentStatus: "paid",
                });

                console.log("Order updated successfully:", orderId);
                return res.json({ received: true });
            } catch (err) {
                console.error("Error updating order:", err);
                return res
                    .status(500)
                    .json({ error: "Failed to process order" });
            }
        }

        res.json({ received: true });
    }
);

module.exports = router;
