const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { s3Client } = require("../utils/s3.utils");
const asyncWrapper = require("../middlewares/asyncWrapper");
const UserModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");
const APIFeatures = require("../utils/apiFeatures");
const Role = require("../models/role.model");
const bcryptjs = require("bcryptjs");

// const getAllUsers = asyncWrapper(async (req, res, next) => {
//     // const users = await UserModel.find({}, { __v: false, password: false });
//     // if (!users) {
//     //     return next(
//     //         AppError.create("No Users Found", 404, httpStatusText.FAIL)
//     //     );
//     // }
//     // return res
//     //     .status(200)
//     //     .json({ status: httpStatusText.SUCCESS, data: { users } });
//     const features = new APIFeatures(UserModel.find({}, { __v: false, password: false }), req.query)
//         .filter()
//         .sort()
//         .limitFields()
//         .paginate();

//     const users = await features.query;

//     if (!users || users.length === 0) {
//         return next(AppError.create("No Users Found", 404, httpStatusText.FAIL));
//     }

//     return res.status(200).json({ status: httpStatusText.SUCCESS, data: { users } });
// });
const getAllUsers = asyncWrapper(async (req, res, next) => {
    const queryObj = { ...req.query };

    // if (queryObj.role) {
    //     // const roleDoc = await Role.findOne({ name: queryObj.role });
    //     // if (!roleDoc) {
    //     //     return next(AppError.create("Role not found", 404, httpStatusText.FAIL));
    //     // }
    //     // queryObj.role = roleDoc._id.toString();
    //     const roleDoc = await Role.findOne({ name: queryObj.role });
    //     if (!roleDoc) {
    //         queryObj.role = roleDoc ? roleDoc._id : null;
    //         delete queryObj.category;
    //     }
    // }
    if (queryObj.role) {
        const roleDoc = await Role.findOne({ name: queryObj.role });

        if (roleDoc) {
            queryObj.role = roleDoc._id.toString();
        } else {
            queryObj.role = null;
        }
    }

    const features = new APIFeatures(
        UserModel.find({}, { __v: false, password: false }).populate("role", "name"),
        queryObj,
    )
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const users = await features.query;
    const totalUsers = await UserModel.countDocuments();

    // if (!users || users.length === 0) {
    //     return next(AppError.create("No Users Found", 404, httpStatusText.FAIL));
    // }

    return res.status(200).json({ status: httpStatusText.SUCCESS, totalUsers, data: { users } });
});

// For Admin Use
const getUser = asyncWrapper(async (req, res, next) => {
    const id = req.params.id;
    const user = await UserModel.findOne({ _id: id }, { __v: false, password: false }).populate(
        "permissions",
    );
    if (!user) {
        return next(AppError.create("User Not Found", 404, httpStatusText.FAIL));
    }
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { user } });
});

// For Current User Use
const getCurrentUser = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;
    const currentUser = await UserModel.findById(userId, {
        __v: false,
        password: false,
    });
    if (!currentUser) {
        return next(AppError.create("User Not Found", 404, httpStatusText.FAIL));
    }
    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { currentUser } });
});

const updateUser = asyncWrapper(async (req, res, next) => {
    // const { userId } = req.tokenPayload;
    const userId = req.params.id;
    const body = req.body;

    const isEmailRegistered = await UserModel.findOne({ email: body.email });
    const user = await UserModel.findById(userId, { email: true });

    if (isEmailRegistered && !(user.email === body.email)) {
        return next(AppError.create("Email Already Exist", 404, httpStatusText.FAIL));
    }
    if (!req.body.password) {
        body.password = user.password;
    }
    const updatedUser = await UserModel.findByIdAndUpdate(userId, body, {
        new: true,
        runValidators: true,
    }).select("-__v -password");

    if (!updatedUser) {
        return next(AppError.create("User Not Found", 404, httpStatusText.FAIL));
    }

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: updatedUser });
});

const deleteUser = asyncWrapper(async (req, res, next) => {
    const { userId } = req.tokenPayload;

    const user = await UserModel.findById(userId);

    if (!user) {
        return next(AppError.create("User Not Found", 404, httpStatusText.FAIL));
    }
    await user.delete();

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: null });
});

const updateAvatar = asyncWrapper(async (req, res, next) => {
    let userId = req.tokenPayload.userId;
    if (req.params.id) {
        userId = req.params.id;
    }

    const user = await UserModel.findById(userId);

    if (!user) {
        return next(AppError.create("User Not Found", 404, httpStatusText.FAIL));
    }

    const deleteCommand = new DeleteObjectCommand({
        Bucket: "vue-project",
        Key: user.avatar,
    });

    if (user.avatar) {
        try {
            await s3Client.send(deleteCommand);
        } catch (error) {}
    }

    const newAvatarPath = `users/${userId}/avatar-${Date.now()}.${req.file.mimetype.split("/")[1]}`;

    const params = {
        Bucket: "vue-project",
        Key: newAvatarPath,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    try {
        await s3Client.send(command);
        user.avatar = newAvatarPath;
        await user.save();
    } catch (error) {
        return next(AppError.create("Error uploading new avatar", 500, httpStatusText.FAIL));
    }

    await res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            avatar: `${process.env.AWS_S3_PUBLIC_BUCKET_URL}${newAvatarPath}`,
            user,
        },
    });
});
const createUser = asyncWrapper(async function (req, res, next) {
    let {
        name,
        email,
        password,
        image = "",
        gender,
        segments,
        phoneNumber,
        permissions,
        role,
        tags,
        wallet = 0,
        address,
    } = req.body;

    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
        return next(AppError.create("User Already Exists", 409, httpStatusText.FAIL));
    }

    await UserModel.validate(req.body);

    const hashedPassword = await bcryptjs.hash(password, 12);

    if (!permissions || !permissions.length) {
        const defaultRole = await Role.findOne({ name: "customer" }).populate(
            "permissions",
            "code",
        );
        permissions = defaultRole?.permissions.map((p) => p._id) || [];
    }

    const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        image,
        gender,
        role,
        segments,
        permissions,
        phoneNumber,
        tags,
        wallet,
        address,
    });

    res.status(201).json({ status: httpStatusText.SUCCESS, data: { newUser } });
});

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    getCurrentUser,
    updateAvatar,
    createUser,
};
