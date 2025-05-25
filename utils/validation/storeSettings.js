// validators/storeSettings.schema.js
const { z } = require("zod");

const shippingMethodSchema = z.object({
    name: z.string().min(1, "Shipping method name is required"),
    cost: z.number().nonnegative("Shipping cost must be positive"),
    estimatedDeliveryDays: z.number().int().positive("Delivery days must be a positive number"),
});

const storeSettingsSchema = z.object({
    storeName: z.string().min(1, "Store name is required"),
    currency: z.string().length(3, "Currency must be a 3-letter code like USD or EUR"),
    defaultLanguage: z.string().min(2).max(5), // ex: 'en', 'ar', 'en-US'
    shippingMethods: z.array(shippingMethodSchema).optional(),
});

const partialStoreSettingsSchema = storeSettingsSchema.partial();

module.exports = {
    storeSettingsSchema,
    partialStoreSettingsSchema,
};
