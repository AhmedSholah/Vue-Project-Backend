const mongoose = require("mongoose");
const asyncWrapper = require("../middlewares/asyncWrapper");
const UserModel = require("../models/user.model");
const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");
const bcryptjs = require("bcryptjs");
const generateJWT = require("../utils/generateJWT");
const CartModel = require("../models/cart.model");
const FavoriteModel = require("../models/favorite.model");
const Role = require("../models/role.model");

const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI,
);

const register = asyncWrapper(async function (req, res, next) {
    const { name, email, password, image, gender, segments } = req.body;

    const oldUser = await UserModel.findOne({ email });

    if (oldUser) {
        return next(AppError.create("User Already Exists", 409, httpStatusText.FAIL));
    }

    await UserModel.validate(req.body);

    const hashedPassword = await bcryptjs.hash(password, 12);

    const defaultRole = await Role.findOne({ name: "customer" }).populate("permissions", "code");
    const defaultRoleId = defaultRole?._id;
    const permissions = defaultRole?.permissions.map((p) => p.code);

    const newUser = await UserModel.create({
        name,
        email,
        password: hashedPassword,
        image: "",
        gender,
        role: defaultRoleId,
        segments,
    });

    await CartModel.create({ user: newUser._id });
    await FavoriteModel.create({ userId: newUser._id });

    const tokenPayload = {
        userId: newUser._id,
        permissions,
    };

    const token = await generateJWT(tokenPayload);

    res.status(201).json({ status: httpStatusText.SUCCESS, data: { token } });
});

const login = asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;
    const foundUser = await UserModel.findOne({ email }).populate("permissions", "code");

    if (!foundUser) {
        return next(AppError.create("Invalid Credentials", 404, httpStatusText.FAIL));
    }

    const isCorretPassword = await bcryptjs.compare(password, foundUser.password);
    if (!isCorretPassword) {
        return next(AppError.create("Invalid Credentials", 501, httpStatusText.FAIL));
    }

    const userRole = await Role.findById(foundUser.role).populate("permissions", "code");
    // console.log(userRole.name);
    // if (userRole.name === "admin") {
    // }
    const rolePermissions = userRole?.permissions.map((p) => p.code) || [];
    const userExtraPermissions = foundUser?.permissions.map((p) => p.code) || [];

    const permissions = [...rolePermissions, ...userExtraPermissions];
    // console.log(permissions);

    const tokenPayload = {
        userId: foundUser._id,
        permissions,
    };

    const token = await generateJWT(tokenPayload);

    return res.status(200).json({ status: httpStatusText.SUCCESS, data: { token } });
});

const google = asyncWrapper(async (req, res, next) => {
    const authUrl = client.generateAuthUrl({
        access_type: "offline",
        scope: ["profile", "email"],
    });
    res.status(200).json(authUrl);
});

const googleCallback = asyncWrapper(async (req, res, next) => {
    const { code } = req.query;

    try {
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);

        const userInfo = await client.request({
            url: "https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,photos",
        });

        const userData = userInfo.data;
        const email = userData.emailAddresses[0].value;
        const name = userData.names[0].displayName;
        const picture = userData.photos[0].url;

        const foundUser = await UserModel.findOne({ email });

        let token;
        if (foundUser) {
            const tokenPayload = {
                userId: foundUser._id,
                // role: foundUser.role,
            };

            token = await generateJWT(tokenPayload);
        } else {
            const newUser = await UserModel.create({
                name: name.split(" ")[0] + name.split(" ")[1],
                email,
                provider: "google",
                avatar: picture,
                // role: "client",
            });

            const tokenPayload = {
                id: newUser._id,
                // role: newUser.role,
            };
            token = await generateJWT(tokenPayload);
        }

        res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
    } catch (error) {
        console.error("Authentication failed:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
});

module.exports = {
    register,
    login,
    google,
    googleCallback,
};
