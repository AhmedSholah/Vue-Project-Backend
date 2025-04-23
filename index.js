const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const PORT = process.env.PORT || 3000;
const connectToDB = require("./database/database");
const httpStatusText = require("./utils/httpStatusText");

// Routes
const authRoutes = require("./routes/auth.routes");
const categoriesRoutes = require("./routes/category.routes");
const productsRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const userRoutes = require("./routes/user.routes");
const orderRoutes = require("./routes/order.routes");
const storageRoutes = require("./routes/storage.routes");
const stripeWebhookRoutes = require("./routes/stripeWebhook.routes");
const KPIsRoutes = require("./routes/KPIs.routes");
const storeSettingsRoutes = require("./routes/storeSettings.routes");
const roleRoutes = require("./routes/role.routes");
const permissionRoutes = require("./routes/permission.routes");

// Middleware
app.use(cors());

app.use("/api/webhook/stripe", stripeWebhookRoutes);

app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorite", favoriteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/storage", storageRoutes);
app.use("/api/dashboard/kpis", KPIsRoutes);
app.use("/api/settings", storeSettingsRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);

// Not Found
app.use("*", (req, res, next) => {
    res.status(404).json({
        status: httpStatusText.ERROR,
        message: "Not Found.",
        data: null,
    });
});

// Error Handling
app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: err.statusText || httpStatusText.ERROR,
        message: err.message,
        data: null,
    });
});

connectToDB();
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});

module.exports = app;
