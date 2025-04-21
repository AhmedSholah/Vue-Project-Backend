const asyncWrapper = require("../middlewares/asyncWrapper");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");
const UserModel = require("../models/user.model");
const CartModel = require("../models/cart.model");
const ProductModel = require("../models/product.model");

const getCart = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const cart = await CartModel.findOne({ user: userId }).populate(
        "items.product"
    );
    if (!cart) {
        return next(AppError.create("Cart Not Found"));
    }
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: cart });
});

const addToCart = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const { productId, quantity } = req.body;

    const product = await ProductModel.findById(productId);
    if (!product) {
        return next(AppError.create("Product Not Found"));
    }

    let cart = await CartModel.findOne({ user: userId });

    if (!cart) {
        cart = new CartModel({
            user: userId,
            items: [{ product: productId, quantity }],
        });
    } else {
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        // if (cart.items[itemIndex]?.quantity) {
        //     if (
        //         (cart.items[itemIndex].quantity += quantity) > product.quantity
        //     ) {
        //         return next(
        //             AppError.create(
        //                 `Only ${product.quantity} items available in stock`,
        //                 409,
        //                 httpStatusText.FAIL
        //             )
        //         );
        //     }
        // }

        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }
    }
    await cart.save();

    const updatedCart = await CartModel.findOne({ user: userId }).populate(
        "items.product"
    );

    return res
        .status(200)
        .json({ success: httpStatusText.SUCCESS, data: updatedCart });
});

const updateCartItem = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const { productId, quantity } = req.body;

    const cart = await CartModel.findOne({ user: userId });
    if (!cart) {
        return next(AppError.create("Cart Not Found"));
    }
    const itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
    );
    if (itemIndex === -1) {
        return next(AppError.create("Product Not Found In Cart"));
    }
    const newQuantity = cart.items[itemIndex].quantity + quantity;
    if (newQuantity <= 0) {
        cart.items.splice(itemIndex, 1);
    } else {
        cart.items[itemIndex].quantity = newQuantity;
    }
    await cart.save();

    const updatedCart = await CartModel.findOne({ user: userId }).populate(
        "items.product"
    );

    return res
        .status(200)
        .json({ success: httpStatusText.SUCCESS, data: updatedCart });
});

const removeCartItem = asyncWrapper(async (req, res, next) => {
    const productId = req.params.productId;
    const { userId } = req.tokenPayload;
    const cart = await CartModel.findOne({ user: userId });

    if (!cart) {
        return next(
            AppError.create("Cart Not Found", 404, httpStatusText.FAIL)
        );
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await CartModel.findOne({ user: userId }).populate(
        "items.product"
    );

    return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: updatedCart });
});

const clearCart = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;

    const cart = await CartModel.findOne({ user: userId });
    if (!cart) {
        return next(AppError.create("Cart Not Found"));
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
};

// get
// const { userId } = req.tokenPayload;

// const updatedCart = await CartModel.findOne(
//     { userId },
//     { __v: false }
// ).populate("items.productId");

// return res
//     .status(200)
//     .json({ status: httpStatusText.SUCCESS, data: updatedCart });

// add
// const { productId, quantity } = req.body;
// const { userId } = req.tokenPayload;

// const product = await ProductModel.findById(productId);

// if (!product) {
//     return next(
//         AppError.create("Product Not Found", 404, httpStatusText.FAIL)
//     );
// }

// const newCartItem = {
//     productId,
//     quantity,
// };

// const cart = await CartModel.findOne({ userId });

// const productIndex = cart.items.findIndex(
//     (item) => item.productId.toString() === productId
// );

// if (productIndex === -1 && quantity < 0) {
//     return next(
//         AppError.create("Product Not Found", 404, httpStatusText.FAIL)
//     );
// }

// if (productIndex === -1) {
//     cart.items.push(newCartItem);
// } else {
//     const oldQuantity = cart.items[productIndex].quantity;
//     const newQuantity = oldQuantity + quantity;

//     if (newQuantity <= 0) {
//         await CartModel.updateOne(
//             { userId, "items.productId": productId },
//             { $pull: { items: { productId } } }
//         );

//         const updatedCart = await CartModel.findOne(
//             { userId },
//             { __v: false }
//         ).populate("items.productId");

//         return res.status(200).json({
//             status: httpStatusText.SUCCESS,
//             data: updatedCart,
//         });
//     } else {
//         cart.items[productIndex].quantity = newQuantity;
//     }
// }

// await cart.save();

// const updatedCart = await CartModel.findOne(
//     { userId },
//     { __v: false }
// ).populate("items.productId");

// return res
//     .status(200)
//     .json({ status: httpStatusText.SUCCESS, data: updatedCart });

// remove cart item
// const productId = req.params.productId;
// const { userId } = req.tokenPayload;

// await CartModel.findOneAndUpdate(
//     { userId },
//     { $pull: { items: { productId } } }
// );

// const updatedCart = await CartModel.findOne({ userId }).populate(
//     "items.productId"
// );

// return res
//     .status(200)
//     .json({ status: httpStatusText.SUCCESS, data: updatedCart });
