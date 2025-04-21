const { z } = require("zod");
const objectIdSchema = require("./objectIdSchema");

const favoriteSchema = z.object({
    productId: objectIdSchema,
});

module.exports = { favoriteSchema };
