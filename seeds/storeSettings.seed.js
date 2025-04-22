const StoreSettings = require("../models/storeSettings.model");
require("dotenv").config();

const connectToDB = require("../database/database");

const seedStoreSettings = async () => {
    connectToDB();

    const existing = await StoreSettings.findOne();
    if (existing) {
        console.log("Store settings already exist.");
        return process.exit(0);
    }

    await StoreSettings.create({
        storeName: "My Store",
        currency: "USD",
        defaultLanguage: "en",
        shippingMethods: [
            {
                name: "Standard",
                cost: 5.99,
                estimatedDeliveryDays: 5,
            },
            {
                name: "Express",
                cost: 12.99,
                estimatedDeliveryDays: 2,
            },
        ],
    });

    console.log("Store settings seeded ✅");
    process.exit(0);
};

seedStoreSettings();
