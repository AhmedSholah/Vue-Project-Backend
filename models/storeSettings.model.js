const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    default: "Store Name",
  },
  currency: {
    type: String,
    required: true,
    default: "USD", // "USD", "EUR", "EGP"
  },
  defaultLanguage: {
    type: String,
    required: true,
    default: "en", // "en" , "ar" , "fr"
  },
  shippingMethods: [
    {
      name: String, // "Standard", "Express"
      cost: Number,
      estimatedDeliveryDays: Number,
      isActive: { type: Boolean, default: true },
    },
  ],
});

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
