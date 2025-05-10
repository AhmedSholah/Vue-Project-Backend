const asyncWrapper = require("../middlewares/asyncWrapper");
const storeSettingsModel = require("../models/storeSettings.model");
const APIFeatures = require("../utils/apiFeatures");
const httpStatusText = require("../utils/httpStatusText");
const AppError = require("../utils/AppError");

const getStoreSettings = asyncWrapper(async (req, res, next) => {
    const features = new APIFeatures(storeSettingsModel.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const storeSettings = await features.query;
    if (!storeSettings) {
        return next(AppError.create("Store Settings Not found", 404, httpStatusText.FAIL));
    }

    return res.json({
        status: httpStatusText.SUCCESS,
        data: {
            storeSettings,
        },
    });
});

const updateStoreSettings = asyncWrapper(async (req, res, next) => {
    const updatedSettings = await storeSettingsModel.findOneAndUpdate(
        {},
        { $set: req.body },
        { new: true, runValidators: true, upsert: false },
    );

    if (!updatedSettings) {
        return next(AppError.create("Failed to update store settings", 400, httpStatusText.FAIL));
    }

    return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
            storeSettings: updatedSettings,
        },
    });
});

module.exports = { getStoreSettings, updateStoreSettings };
