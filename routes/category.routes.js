const router = require("express").Router();
const categoryController = require("../controllers/category.controller");
const validateSchema = require("../middlewares/validateSchema");
const categorySchema = require("../utils/validation/categoryValidation");

const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router
    .route("/")
    .get(categoryController.getCategories)
    .post(
        isAuthenticated,
        validateSchema(categorySchema.addCategorySchema),
        checkRole(["admin"]),
        categoryController.addCategory
    );
// .patch(updateCategory)

router
    .route("/:categoryId")
    .delete(
        isAuthenticated,
        checkRole(["admin"]),
        validateSchema(categorySchema.deletCategorySchema, "params"),
        categoryController.deletCategory
    );

router
    .route("/:categoryId/image")
    .put(
        isAuthenticated,
        checkRole(["admin"]),
        upload.single("file"),
        categoryController.updateCategoryImage
    );

module.exports = router;
