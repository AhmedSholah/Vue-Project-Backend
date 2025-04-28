require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const Category = require("../models/category.model");
const { seedProducts } = require("./products.seed");
const { seedOrders } = require("./orders.seed");
const { seedUsers } = require("./users.seed");

async function clearCollections(collections = []) {
    try {
        for (const collection of collections) {
            if (mongoose.connection.collections[collection]) {
                console.log(`Clearing ${collection} collection...`);
                await mongoose.connection.collections[collection].deleteMany({});
                console.log(`${collection} collection cleared.`);
            }
        }
    } catch (error) {
        console.error("Error clearing collections:", error);
        throw error;
    }
}

async function runMasterSeeder({
    usersCount = 10,
    productsCount = 1000,
    ordersCount = 480,
    clearExisting = false,
    seedUsers: shouldSeedUsers = true,
    seedProducts: shouldSeedProducts = true,
    seedOrders: shouldSeedOrders = true,
    roleId = "65f1c27e5e433100c5d7c803", // Default role ID for users
} = {}) {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("Database connected successfully.");

        // Get existing categories
        const categories = await Category.find().select("_id").lean();
        if (categories.length === 0) {
            throw new Error("No categories found in the database. Please seed categories first.");
        }
        const categoryIds = categories.map((category) => category._id);

        if (clearExisting) {
            const collectionsToDelete = [];
            if (shouldSeedUsers) collectionsToDelete.push("users");
            if (shouldSeedProducts) collectionsToDelete.push("products");
            if (shouldSeedOrders) collectionsToDelete.push("orders");
            await clearCollections(collectionsToDelete);
        }

        // Generate and insert users
        let userIds = [];
        let users = [];
        if (shouldSeedUsers) {
            console.log(`\nGenerating ${usersCount} users...`);
            const userData = await seedUsers(usersCount, roleId);
            users = await User.insertMany(userData);
            userIds = users.map((user) => user._id);
            console.log(`${users.length} users inserted successfully.`);
        } else {
            users = await User.find().lean();
            userIds = users.map((user) => user._id);
        }

        // Generate and insert products
        let products = [];
        if (shouldSeedProducts) {
            console.log(`\nGenerating ${productsCount} products...`);
            const productData = await seedProducts(productsCount, categoryIds, userIds);
            products = await Product.insertMany(productData);
            console.log(`${products.length} products inserted successfully.`);
        } else {
            products = await Product.find().lean();
        }

        // Generate and insert orders
        if (shouldSeedOrders && products.length > 0 && userIds.length > 0) {
            console.log(`\nGenerating ${ordersCount} orders...`);
            const productIds = products.map((product) => product._id);
            const orderData = await seedOrders(ordersCount, userIds, productIds, products);
            const orders = await Order.insertMany(orderData);
            console.log(`${orders.length} orders inserted successfully.`);
        }

        console.log("\nSeeding process completed successfully!");
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("Failed to run master seeder:", error);
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
}

runMasterSeeder({
    usersCount: 500,
    productsCount: 500,
    ordersCount: 50000,
    clearExisting: false,
    seedUsers: false,
    seedProducts: false,
    seedOrders: true,
    roleId: "680e5a54725423d9a29b5017", // Make sure to replace with a valid role ID from your database
});
