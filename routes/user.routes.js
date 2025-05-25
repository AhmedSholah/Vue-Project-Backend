const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const validateSchema = require("../middlewares/validateSchema");
const multer = require("multer");
const userValidation = require("../utils/validation/userValidation");
const authValidation = require("../utils/validation/authValidation");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    updateAvatar,
    createUser,
    deleteAvatar,
} = require("../controllers/user.controller");
const checkPermission = require("../middlewares/checkPermission");

router
    .route("/")
    .get(isAuthenticated, checkPermission("view_all_users"), getAllUsers)
    .patch(
        isAuthenticated,
        // validateSchema(userValidation.updateUserSchema)
        updateUser,
    )
    .post(
        isAuthenticated,
        checkPermission("create_user"),
        // validateSchema(authValidation.registerSchema),
        createUser,
    );

// For Admin Use
router
    .route("/:id")
    .get(isAuthenticated, checkPermission("view_any_user"), getUser)
    .delete(isAuthenticated, checkPermission("delete_user"), deleteUser)
    .patch(isAuthenticated, updateUser);

router.route("/me/user").get(isAuthenticated, getCurrentUser);

router.route("/me/avatar").put(isAuthenticated, upload.single("file"), updateAvatar);

router
    .route("/:id/avatar")
    .put(isAuthenticated, upload.single("file"), updateAvatar)
    .delete(isAuthenticated, deleteAvatar);

module.exports = router;
