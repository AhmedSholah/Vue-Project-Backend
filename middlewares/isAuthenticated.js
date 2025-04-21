const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");
const jwt = require("jsonwebtoken");

module.exports = function isAuthenticated(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
        try {
            const tokenPayload = jwt.verify(token, process.env.JWT_SECRET_KEY);
            req.tokenPayload = tokenPayload;
            return next();
        } catch (err) {
            return next(
                AppError.create("Unauthorized", 401, httpStatusText.ERROR)
            );
        }
    } else {
        return next(AppError.create("Unauthorized", 401, httpStatusText.ERROR));
    }
};
