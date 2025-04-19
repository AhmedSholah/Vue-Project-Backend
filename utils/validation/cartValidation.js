const { z, number } = require("zod");
const objectIdSchema = require("./objectIdSchema");

const addToCartSchema = z
    .object({
        productId: objectIdSchema,
        quantity: number(),
    })
    .strict();

const removeCartItemSchema = z
    .object({
        productId: objectIdSchema,
    })
    .strict();

module.exports = { addToCartSchema, removeCartItemSchema };
