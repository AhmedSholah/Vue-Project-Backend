const mongoose = require("mongoose");
const asyncWrapper = require("../middlewares/asyncWrapper");
const categoryModel = require("../models/category.model");
const ProductModel = require("../models/product.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utils/s3.utils");

const getCategories = asyncWrapper(async (req, res, next) => {
    const categories = await categoryModel.find({});
    if (!categories) {
        return next(AppError.create("No Categories Found", 404, httpStatusText.FAIL));
    }
    return res.json({ status: httpStatusText.SUCCESS, data: { categories } });
});

const addCategory = asyncWrapper(async (req, res, next) => {
    const { name } = req.body;
    const oldCategory = await categoryModel.findOne({ name });

    if (oldCategory) {
        return next(AppError.create("Categorie Already Exist", 409, httpStatusText.FAIL));
    }

    await categoryModel.create({ name });

    return res.json({
        status: httpStatusText.SUCCESS,
        data: { message: "Category created successfully." },
    });
});

const updateCategory = asyncWrapper(async (req, res, next) => {
    const { categoryId } = req.params;
    const { name } = req.body;

    const category = await categoryModel.findByIdAndUpdate(categoryId, { name }, { new: true });

    if (!category) {
        return next(AppError.create("Category Not Found", 404, httpStatusText.FAIL));
    }

    return res.json({
        status: httpStatusText.SUCCESS,
        data: { message: "Category updated successfully." },
    });
});

const deletCategory = asyncWrapper(async (req, res, next) => {
    const { categoryId } = req.params;
    const session = await mongoose.startSession();
    session.startTransaction();

    const category = await categoryModel.findById(categoryId).session(session);
    if (!category) {
        await session.abortTransaction();
        session.endSession();
        return next(AppError.create("Category Not Found", 404, httpStatusText.FAIL));
    }

    await ProductModel.delete({ category: categoryId }, { session });

    await category.delete({ session });

    await session.commitTransaction();
    session.endSession();

    // Send a response indicating success
    return res.json({
        status: httpStatusText.SUCCESS,
        data: null,
    });
});

const updateCategoryImage = asyncWrapper(async (req, res, next) => {
    const { categoryId } = req.params;

    const category = await categoryModel.findById(categoryId);

    if (!category) {
        return next(AppError.create("Category Not Found", 404, httpStatusText.FAIL));
    }

    const deleteCommand = new DeleteObjectCommand({
        Bucket: "main",
        Key: category.image,
    });

    if (category.image) {
        try {
            await s3Client.send(deleteCommand);
        } catch (error) {}
    }

    const newImagePath = `categories/${categoryId}/image-${Date.now()}.${
        req.file.mimetype.split("/")[1]
    }`;

    const params = {
        Bucket: "main",
        Key: newImagePath,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    try {
        await s3Client.send(command);
        category.image = newImagePath;
        await category.save();
    } catch (error) {
        return next(AppError.create("Error uploading new image", 500, httpStatusText.FAIL));
    }

    await res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            image: `${process.env.AWS_S3_PUBLIC_BUCKET_URL}${newImagePath}`,
        },
    });
});

module.exports = {
    getCategories,
    addCategory,
    updateCategory,
    deletCategory,
    updateCategoryImage,
};
