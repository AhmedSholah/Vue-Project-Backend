const router = require("express").Router();
const categoryController = require("../controllers/category.controller");
const validateSchema = require("../middlewares/validateSchema");
const categorySchema = require("../utils/validation/categoryValidation");

const isAuthenticated = require("../middlewares/isAuthenticated");
const checkPermission = require("../middlewares/checkPermission");

const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.route("/").get(categoryController.getCategories).post(
    isAuthenticated,
    // validateSchema(categorySchema.addCategorySchema),
    checkPermission("create_category"),
    categoryController.addCategory,
);
// .patch(checkPermission("update_category"), categoryController.updateCategory);

router.route("/:categoryId").patch(categoryController.updateCategory).delete(
    isAuthenticated,
    // validateSchema(categorySchema.deletCategorySchema, "params"),
    checkPermission("delete_category"),
    categoryController.deletCategory,
);

router
    .route("/:categoryId/image")
    .put(
        isAuthenticated,
        checkPermission("update_category"),
        upload.single("file"),
        categoryController.updateCategoryImage,
    );

module.exports = router;
