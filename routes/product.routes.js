const router = require("express").Router();
const productsController = require("../controllers/product.controller");
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const validateSchema = require("../middlewares/validateSchema");
const {
    getProductsSchema,
    deleteProductSchema,
    updateProductSchema,
    addProductSchema,
} = require("../utils/validation/productValidation");
const checkPermission = require("../middlewares/checkPermission");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
    .route("/")
    .get(validateSchema(getProductsSchema, "query"), productsController.getProducts)
    .post(
        isAuthenticated,
        // checkRole(["seller", "admin"]),
        checkPermission("create_product"),
        validateSchema(addProductSchema),
        productsController.addOneProduct,
    );

router
    .route("/:productId")
    .get(productsController.getOneProduct)
    .patch(
        isAuthenticated,
        // checkRole(["seller", "admin"]),
        // validateSchema(updateProductSchema),
        productsController.updateOneProduct,
    )
    .delete(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(deleteProductSchema, "params"),
        productsController.deleteOneProduct,
    );

router
    .route("/:productId/image")
    .put(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(updateProductSchema),
        upload.single("file"),
        productsController.addProductImage,
    );

router
    .route("/:productId/image/:imageIndex")
    .delete(
        isAuthenticated,
        checkRole(["seller", "admin"]),
        validateSchema(updateProductSchema),
        upload.single("file"),
        productsController.deleteProductImage,
    );

module.exports = router;
