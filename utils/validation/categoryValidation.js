const { z } = require("zod");
const objectIdSchema = require("./objectIdSchema");

const addCategorySchema = z
    .object({
        name: z.string().min(3).max(32),
        // image: z.string(),
    })
    .strict();

const deletCategorySchema = z.object({
    categoryId: objectIdSchema,
});

module.exports = { addCategorySchema, deletCategorySchema };
