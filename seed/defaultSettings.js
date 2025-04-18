const StoreSettings = require("../models/storeSettingsModel");

const seedSettings = async () => {
  const exists = await StoreSettings.findOne();
  if (exists) return console.log("Settings already exist");

  await StoreSettings.create({
    general: {
      storeName: "My Store",
      defaultLanguage: "en",
      supportedLanguages: ["en", "fr", "Ar"],
    },
    currency: {
      defaultCurrency: "USD",
      supportedCurrencies: [
        { code: "USD", symbol: "$", rate: 1 },
        { code: "EUR", symbol: "€", rate: 0.92 },
      ],
    },
    shipping: [
      { name: "Standard", cost: 5, estimatedDelivery: "3-5 days" },
      { name: "Express", cost: 10, estimatedDelivery: "1-2 days" },
    ],
    roles: [
      {
        name: "admin",
        description: "Standard Admin Access",
        permissions: ["view-orders", "manage-products"],
      },
      {
        name: "superadmin",
        description: "Full System Access",
        permissions: ["manage-users", "update-settings", "manage-products"],
      },
    ],
  });

  console.log("Default store settings seeded!");
};

module.exports = seedSettings;
