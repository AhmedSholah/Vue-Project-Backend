const appError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

module.exports = function (roles) {
    return (req, res, next) => {
        if (!roles.includes(req.tokenPayload.role)) {
            return next(
                appError.create("Unauthorized", 401, httpStatusText.FAIL)
            );
        }
        return next();
    };
};
