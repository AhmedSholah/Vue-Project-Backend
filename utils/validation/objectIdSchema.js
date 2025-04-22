const { z } = require("zod");

const mongoose = require("mongoose");

const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val));

module.exports = objectIdSchema;
