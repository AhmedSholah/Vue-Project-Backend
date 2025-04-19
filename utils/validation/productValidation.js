const { z } = require("zod");
const objectIdSchema = require("./objectIdSchema");

const queryParamsNumberSchema = z
    .string()
    .refine((val) => !isNaN(val))
    .transform((val) => Number(val));

const addProductSchema = z
    .object({
        name: z.string().min(3),
        images: z.array().optional(),
        price: z.number().min(0),
        discountAmount: z.number().min(0).optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        category: objectIdSchema,
        // description: z.string().min(100).max(500),
        description: z.string().min(100).max(500),
        quantity: z.number().min(0),
        weight: z.number().min(0),
        dimensions: z.object({
            length: z.number().min(0),
            width: z.number().min(0),
            height: z.number().min(0),
        }),
        shippingInfo: z.object({
            shippingCost: z.number().min(0),
            estimatedDelivery: z.number().min(0),
        }),
    })
    .strict();

const updateProductSchema = z
    .object({
        name: z.string().min(3).optional(),
        price: z.number().min(0).optional(),
        discountAmount: z.number().min(0).optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        category: objectIdSchema.optional(),
        description: z.string().min(100).max(5000).optional(),
        quantity: z.number().min(0).optional(),
        weight: z.number().min(0).optional(),
        dimensions: z
            .object({
                length: z.number().min(0).optional(),
                width: z.number().min(0).optional(),
                height: z.number().min(0).optional(),
            })
            .optional(),
        shippingInfo: z
            .object({
                shippingCost: z.number().min(0).optional(),
                estimatedDelivery: z.number().min(0).optional(),
            })
            .optional(),
    })
    .strict();

const getProductsSchema = z.object({
    page: queryParamsNumberSchema,
    limit: queryParamsNumberSchema,
    minPrice: queryParamsNumberSchema.optional(),
    maxPrice: queryParamsNumberSchema.optional(),
    category: z
        .union([objectIdSchema, z.array(objectIdSchema)])
        .transform((val) => (typeof val === "string" ? [val] : val))
        .optional(),
    instock: z
        .enum(["true", "false"])
        .transform((val) => val === "true")
        .optional(),
    sortBy: z.enum(["name", "price", "createdAt"]).default("name"),
    sortOrder: z
        .enum(["asc", "desc"])
        .default("asc")
        .transform((val) => (val === "asc" ? 1 : -1)),
});

const deleteProductSchema = z
    .object({
        productId: objectIdSchema,
    })
    .strict();

module.exports = {
    addProductSchema,
    updateProductSchema,
    getProductsSchema,
    deleteProductSchema,
};
