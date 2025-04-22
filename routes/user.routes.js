const router = require("express").Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const checkRole = require("../middlewares/checkRole");
const validateSchema = require("../middlewares/validateSchema");
const userValidation = require("../utils/validation/userValidation");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    updateAvatar,
} = require("../controllers/user.controller");

router
    .route("/")
    .get(
        isAuthenticated,
        //  checkRole(["admin"]),
        getAllUsers,
    )
    .patch(isAuthenticated, validateSchema(userValidation.updateUserSchema), updateUser);

// For Admin Use
router.route("/:id").get(
    isAuthenticated,
    // checkRole(["admin"]),
    getUser,
);
//     .delete(isAuthenticated, deleteUser);

router.route("/me/user").get(isAuthenticated, getCurrentUser);

router.route("/me/avatar").put(isAuthenticated, upload.single("file"), updateAvatar);

module.exports = router;
