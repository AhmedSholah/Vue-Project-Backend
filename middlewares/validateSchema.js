const AppError = require("../utils/AppError");
const httpStatusText = require("../utils/httpStatusText");

function validateSchema(schema, validationTarget = "body") {
    let result;
    return (req, res, next) => {
        switch (validationTarget) {
            case "body":
                result = schema.safeParse(req.body);
                req.body = result.data;
                break;
            case "query":
                result = schema.safeParse(req.query);
                req.query = result.data;
                break;
            case "params":
                result = schema.safeParse(req.params);
                break;

            default:
                result = schema.safeParse(req.body);
                break;
        }

        if (!result.success) {
            return next(
                AppError.create(`Invalid request ${validationTarget}`, 400, httpStatusText.FAIL),
            );
        }

        next();
    };
}

module.exports = validateSchema;
