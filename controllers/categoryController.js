const Category = require("../models/categoryModel");
const AppError = require("../utilities/appError");
const catchAsync = require("../utilities/catchAsync");

const getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find();
  res.status(200).json({
    status: "success",
    results: categories.length,
    data: {
      categories,
    },
  });
});

const createCategory = catchAsync(async (req, res, next) => {
  const newCategory = await Category.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      category: newCategory,
    },
  });
});
const updateCategory = catchAsync(async (req, res, next) => {
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedCategory) {
    return next(new AppError("No category found with that id"), 404);
  }
  res.status(200).json({
    status: "success",
    data: updatedCategory,
  });
});
const getCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("No category found with that id", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      category,
    },
  });
});
const deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return next(new AppError("No category found with that id", 404));
  }
  await Category.findByIdAndDelete(req.params.id);
  res.status(200).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategory,
};
