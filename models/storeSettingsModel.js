const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    general: {
      storeName: { type: String, required: true },
      storeDescription: { type: String, default: "" },
      logoUrl: { type: String, default: "" },
      defaultLanguage: { type: String, default: "en" },
      supportedLanguages: { type: [String], default: ["en"] },
    },

    currency: {
      defaultCurrency: { type: String, default: "USD" },
      supportedCurrencies: [
        {
          code: { type: String },
          symbol: { type: String },
          rate: { type: Number, default: 1 },
        },
      ],
    },

    shipping: [
      {
        name: { type: String },
        cost: { type: Number },
        estimatedDelivery: { type: String },
        active: { type: Boolean, default: true },
      },
    ],

    roles: [
      {
        name: { type: String, required: true },
        description: { type: String },
        permissions: [String],
      },
    ],

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const StoreSettings = mongoose.model("StoreSettings", storeSettingsSchema);
module.exports = StoreSettings;
