const { z } = require("zod");

const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(256, "Password must be at most 256 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter (a-z)")
    .regex(/[0-9]/, "Password must contain at least one number (0-9)")
    .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least one special character (!, @, #, etc.)",
    )
    .refine((password) => !/\s/.test(password), {
        message: "Password must not contain spaces",
    });

const loginSchema = z
    .object({
        email: z.string().email(),
        password: passwordSchema,
    })
    .strict();

const registerSchema = z
    .object({
        name: z.string().min(3),
        // firstName: z.string().min(3),
        // lastName: z.string().min(3),
        email: z.string().email(),
        password: passwordSchema,
        // gender: z.enum(["male", "female"]),
        // role: z.enum(["client", "seller"]),
    })
    .strict();

module.exports = { loginSchema, registerSchema };
