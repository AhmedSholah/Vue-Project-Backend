const asyncWrapper = require("../middlewares/asyncWrapper");
const ProductModel = require("../models/product.model");
const CategoryModel = require("../models/category.model");
const UserModel = require("../models/user.model");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utils/s3.utils");
const FavoriteModel = require("../models/favorite.model");
const APIFeatures = require("../utils/apiFeatures");
const Product = require("../models/product.model");

//api/products?name=productName&category=categoryName&instock=true&tag=bestseller&colors=red,blue&price[gte]=500&price[lte]=1500&sort=-price&fields=name,price,colors,category

const getProducts = asyncWrapper(async (req, res, next) => {
    const queryObj = { ...req.query };

    const customFilter = {};

    if (queryObj.category) {
        const categoryDoc = await CategoryModel.findOne({ name: queryObj.category });
        if (categoryDoc) {
            customFilter.category = categoryDoc._id;
        } else {
            customFilter.category = null;
        }
        delete queryObj.category;
    }

    if (queryObj.name) {
        customFilter.name = { $regex: queryObj.name, $options: "i" };
        delete queryObj.name;
    }

    if (queryObj.instock !== undefined) {
        if (queryObj.instock === "true") {
            customFilter.quantity = { $gt: 0 };
        } else if (queryObj.instock === "false") {
            customFilter.quantity = { $eq: 0 };
        }
        delete queryObj.instock;
    }

    if (queryObj.tag) {
        customFilter.tags = queryObj.tag;
        delete queryObj.tag;
    }
    if (queryObj.color || queryObj.colors) {
        const colors = (queryObj.color || queryObj.colors).split(",").map((color) => color.trim());

        customFilter.colors = { $in: colors };
        delete queryObj.color;
        delete queryObj.colors;
    }

    const features = new APIFeatures(
        Product.find(customFilter)
            .populate({ path: "soldBy", select: "_id name" })
            .populate({ path: "category", select: "_id name" }),
        queryObj,
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const products = await features.query;

    const totalProducts = await Product.countDocuments(customFilter);
    const highestPricedProduct = await Product.findOne().sort({ price: -1 }).select("price");

    const total = await Product.countDocuments();
    // const randomSkip = Math.max(0, Math.floor(Math.random() * (total - 4)));
    const bestSellingProducts = await Product.find({})
    .sort({ salesCount: -1 }) 
    .limit(4)
    .populate("soldBy", "_id name");

    return res.status(200).json({
        status: "success",
        data: {
            totalProducts,
            products,
            bestSellingProducts,
            highestPricedProduct,
        },
    });
});
// const getProducts = asyncWrapper(async (req, res, next) => {
//     const query = req.query;
//     const limit = query.limit || 4;
//     const page = query.page || 1;
//     const skip = (page - 1) * limit;

//     const filter = {};

//     if (query.minPrice || query.maxPrice) {
//         filter.price = {
//             $gte: query.minPrice || 0,
//             $lte: query.maxPrice || 1e9,
//         };
//     }

//     if (query.category) {
//         filter.category = { $in: query.category };
//     }

//     if (query.instock !== undefined) {
//         if (query.instock) {
//             filter.quantity = { $gt: 0 };
//         } else {
//             filter.quantity = { $eq: 0 };
//         }
//     }

//     const products = await ProductModel.find(filter, { __v: false })
//         .populate({ path: "soldBy", select: "_id name" })
//         .sort({ [query.sortBy]: query.sortOrder })
//         .skip(skip)
//         .limit(limit);

//     // get total number of products for pagination
//     const productsCount = await ProductModel.countDocuments(filter);

//     // get highest priced product
//     const highestPricedProduct = await ProductModel.findOne().sort({ price: -1 }).select("price");

//     // Return 4 products Randomly until fix it soon with best products according to views
//     const total = await ProductModel.countDocuments();
//     const randomSkip = Math.max(0, Math.floor(Math.random() * (total - 4)));

//     const bestSellingProducts = await ProductModel.find({}, { __v: 0 })
//         .skip(randomSkip)
//         .limit(4)
//         .populate("soldBy", "_id name");

//     if (!products) {
//         return next(AppError.create("Product Not Found", 404, httpStatusText.FAIL));
//     }

//     return res.json({
//         status: httpStatusText.SUCCESS,
//         data: {
//             productsCount,
//             products,
//             bestSellingProducts,
//             highestPricedProduct,
//         },
//     });
// });
const getOneProduct = asyncWrapper(async (req, res, next) => {
    const product = await ProductModel.findById(req.params.productId, {
        __v: false,
    }).populate({ path: "soldBy", select: "_id name" });

    if (!product) {
        return next(AppError.create("Product Not Found", 404, httpStatusText.FAIL));
    }

    return res.json({ status: httpStatusText.SUCCESS, data: { product } });
});

// // Add One Product (Seller - Admin)
// const addOneProduct = asyncWrapper(async (req, res, next) => {
//     const product = req.body;
//     product.soldBy = req.tokenPayload.userId;

//     // check if category exists or not
//     const categoryExists = await CategoryModel.findById(product.category);

//     if (!categoryExists) {
//         return next(AppError.create("Category Not Found", 404, httpStatusText.FAIL));
//     }

//     const proudct = await ProductModel.create(product);

//     return res.json({
//         status: httpStatusText.SUCCESS,
//         data: { message: "Product created successfully.", id: proudct._id },
//     });
// });
const addOneProduct = asyncWrapper(async (req, res, next) => {
    const product = { ...req.body };
    product.soldBy = req.tokenPayload.userId;

    // Validate category
    const categoryExists = await CategoryModel.findById(product.category);
    if (!categoryExists) {
        return next(AppError.create("Category Not Found", 404, httpStatusText.FAIL));
    }

    // Ensure colors are unique and lowercase (if provided)
    if (product.colors && Array.isArray(product.colors)) {
        product.colors = [...new Set(product.colors.map((color) => color.toLowerCase()))];
    }

    const createdProduct = await ProductModel.create(product);

    return res.json({
        status: httpStatusText.SUCCESS,
        data: {
            message: "Product created successfully.",
            id: createdProduct._id,
        },
    });
});

// // Update One Product (Seller that add the product - Admin)
// const updateOneProduct = asyncWrapper(async (req, res, next) => {
//     const productId = req.params.productId;
//     const oldProduct = await ProductModel.findById(productId);

//     if (!oldProduct) {
//         return next(AppError.create("Product Not Found", 404, httpStatusText.FAIL));
//     }

//     if (!(oldProduct.soldBy == req.tokenPayload.userId)) {
//         return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
//     }

//     const product = req.body;

//     await ProductModel.updateOne({ _id: productId }, { $set: product });

//     const updatedProduct = await ProductModel.findById(productId);

//     return res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         data: updatedProduct,
//     });
// });
const updateOneProduct = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    const oldProduct = await ProductModel.findById(productId);

    if (!oldProduct) {
        return next(AppError.create("Product Not Found", 404, httpStatusText.FAIL));
    }

    // if (oldProduct.soldBy.toString() !== req.tokenPayload.userId) {
    //     return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    // }

    const product = { ...req.body };

    if (product.colors && Array.isArray(product.colors)) {
        product.colors = [...new Set(product.colors.map((color) => color.toLowerCase()))];
    }

    await ProductModel.updateOne({ _id: productId }, { $set: product });

    const updatedProduct = await ProductModel.findById(productId);

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: updatedProduct,
    });
});

// Delete One Product (Seller - Admin)
const deleteOneProduct = asyncWrapper(async (req, res, next) => {
    const { productId } = req.params;
    const { userId, role } = req.tokenPayload;

    const product = await ProductModel.findById(productId);

    if (!product) {
        return next(AppError.create("Product not found", 404, httpStatusText.FAIL));
    }

    const isAdmin = role === "admin";
    const isOwner = product.soldBy.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    await product.delete();

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null,
    });
});

const addProductImage = asyncWrapper(async (req, res, next) => {
    const { productId } = req.params;
    const { userId, role } = req.tokenPayload;

    const product = await ProductModel.findById(productId);

    if (!product) {
        return next(AppError.create("Product not found", 404, httpStatusText.FAIL));
    }

    const isAdmin = role === "admin";
    const isOwner = product.soldBy.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    // const deleteCommand = new DeleteObjectCommand({
    //     Bucket: "main",
    //     Key: product.image,
    // });

    // if (product.image) {
    //     try {
    //         await s3Client.send(deleteCommand);
    //     } catch (error) {}
    // }

    const newImagePath = `products/${productId}/image-${Date.now()}.${
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
        product.imageNames.push(newImagePath);
        await product.save();
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

const deleteProductImage = asyncWrapper(async (req, res, next) => {
    const { productId, imageIndex } = req.params;
    const { userId, role } = req.tokenPayload;

    const product = await ProductModel.findById(productId);

    if (!product) {
        return next(AppError.create("Product not found", 404, httpStatusText.FAIL));
    }

    const isAdmin = role === "admin";
    const isOwner = product.soldBy.toString() === userId.toString();

    if (!isAdmin && !isOwner) {
        return next(AppError.create("Unauthorized", 401, httpStatusText.FAIL));
    }

    const imageToDelete = product.imageNames[imageIndex];

    if (!imageToDelete) {
        return next(AppError.create("Image not found", 404, httpStatusText.FAIL));
    }
    const deleteCommand = new DeleteObjectCommand({
        Bucket: "main",
        Key: imageToDelete,
    });
    try {
        await s3Client.send(deleteCommand);
        product.imageNames.splice(imageIndex, 1);
        await product.save();
    } catch (error) {
        return next(AppError.create("Error deleting image", 500, httpStatusText.FAIL));
    }

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: null,
    });
});

module.exports = {
    getProducts,
    getOneProduct,
    addOneProduct,
    updateOneProduct,
    deleteOneProduct,
    addProductImage,
    deleteProductImage,
};
