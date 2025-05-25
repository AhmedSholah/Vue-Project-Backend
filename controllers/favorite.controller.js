const asyncWrapper = require("../middlewares/asyncWrapper");
const FavoriteModel = require("../models/favorite.model");
const UserModel = require("../models/user.model");
const ProductModel = require("../models/product.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

const getFavorite = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const updatedFavorite = await FavoriteModel.findOne({ userId }, { __v: false }).populate(
        "items.product",
    );
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: updatedFavorite });
});

const addToFavoriteItem = asyncWrapper(async (req, res, next) => {
    const { productId } = req.body;
    const { userId } = req.tokenPayload;

    const product = await ProductModel.findById(productId);

    if (!product) {
        return next(AppError.create("Product Not Found", 404, httpStatusText.FAIL));
    }

    const newFavoriteItem = { product: productId };

    const favorite = await FavoriteModel.findOne({ userId });

    const productIndex = favorite.items.findIndex((item) => item.product.toString() === productId);

    if (productIndex !== -1) {
        return next(
            AppError.create("Product Already Exists in Favorites", 409, httpStatusText.FAIL),
        );
    }

    favorite.items.push(newFavoriteItem);

    await favorite.save();

    return res.status(200).json({ status: httpStatusText.SUCCESS });
});

const deleteFavoriteItem = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    const { userId } = req.tokenPayload;

    await FavoriteModel.findOneAndUpdate({ userId }, { $pull: { items: { product: productId } } });

    const updatedFavorite = await FavoriteModel.findOne({ userId }).populate("items.product");

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
    getFavorite,
    addToFavoriteItem,
    deleteFavoriteItem,
};
