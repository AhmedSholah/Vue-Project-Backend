const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const seedSettings = require("../seed/defaultSettings");
const AppError = require("../utilities/appError");
const catchAsync = require("../utilities/catchAsync");

const getAllProducts = catchAsync(async (req, res, next) => {
  seedSettings();
  // BUILD THE QUERY
  const queryObj = { ...req.query };

  // 1) FILTERING
  const execludedFields = ["sort", "page", "limit", "fields"];
  execludedFields.forEach((el) => delete queryObj[el]);

  // /products?price[gte]=400
  let queryString = JSON.stringify(queryObj).replace(
    /\b(gt|gte|lt|lte)\b/g,
    (match) => `$${match}`
  );

  let filter = JSON.parse(queryString);

  // Handle gender filter (in case of array queries)
  if (req.query.gender) {
    const genderArray = req.query.gender.split(",");
    filter.gender = { $in: genderArray };
  }

  // Convert category name to ObjectId if it's provided
  if (req.query.category) {
    const category = await Category.findOne({ name: req.query.category });

    if (category) {
      filter.category = category._id; // Replace category filter with ObjectId
    } else {
      return res.status(404).json({
        status: "fail",
        message: "Category not found",
      });
    }
  }

  // Build the query
  let query = Product.find(filter);

  // 2) SORTING
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-release_date");
  }

  // 3) FIELD LIMITING
  if (req.query.fields) {
    const fields = req.query.fields.split(",").join(" ");
    query = query.select(fields);
  } else {
    query = query.select("-__v");
  }

  // 4)PAGInATION
  // /products?page=2&limit=10
  const page = Number(req.query.page);
  const limit = Number(req.query.limit);

  const skip = (page - 1) * limit;
  let numProducts;
  if (req.query.page) {
    numProducts = await Product.countDocuments(query);
    console.log(numProducts);
    query = query.skip(skip).limit(limit);
    if (skip >= numProducts) {
      throw new Error("This page doesn't exist");
    }
  }
  // EXECUTE THE QUERY
  const products = await query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: products.length,
    numProducts,
    data: {
      products,
    },
  });
});

// const getAllProducts = catchAsync(async (req, res, next) => {
//   // BUILD THE QUERY
//   const queryObj = { ...req.query };

//   // 1) FILTERING
//   const excludedFields = ["sort", "page", "limit", "fields"];
//   excludedFields.forEach((el) => delete queryObj[el]);

//   let queryString = JSON.stringify(queryObj).replace(
//     /\b(gt|gte|lt|lte)\b/g,
//     (match) => `$${match}`
//   );

//   let filter = JSON.parse(queryString);

//   if (req.query.gender) {
//     const genderArray = req.query.gender.split(",");
//     filter.gender = { $in: genderArray };
//   }

//   if (req.query.category) {
//     const category = await Category.findOne({ name: req.query.category });

//     if (category) {
//       filter.category = category._id;
//     } else {
//       return next(new AppError("Category not found", 404));
//     }
//   }

//   let query = Product.find(filter);

//   // 3) SORTING
//   if (req.query.sort) {
//     const sortBy = req.query.sort.split(",").join(" ");
//     query = query.sort(sortBy);
//   } else {
//     query = query.sort("-release_date");
//   }

//   // 4) FIELD LIMITING
//   if (req.query.fields) {
//     const fields = req.query.fields.split(",").join(" ");
//     query = query.select(fields);
//   } else {
//     query = query.select("-__v");
//   }

//   // 5) PAGINATION
//   const page = Number(req.query.page) || 1;
//   const limit = Number(req.query.limit) || 10;
//   const skip = (page - 1) * limit;

//   const numProducts = await Product.countDocuments(filter);

//   if (numProducts === 0) {
//     return next(new AppError("No products match this query", 404));
//   }

//   if (skip >= numProducts) {
//     return res.status(200).json({
//       status: "success",
//       results: 0,
//       products: [],
//     });
//   }

//   query = query.skip(skip).limit(limit);

//   // EXECUTE QUERY
//   const products = await query;

//   // SEND RESPONSE
//   res.status(200).json({
//     status: "success",
//     results: products.length,
//     numProducts,
//     data: {
//       products,
//     },
//   });
// });

const getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("reviews");
  console.log(product);
  if (!product) {
    return next(new AppError("No product found with that id"), 404);
  }
  res.status(200).json({
    status: "success",
    data: product,
  });
});
const createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  res.status(200).json({
    status: "success",
    data: newProduct,
  });
});
const updateProduct = catchAsync(async (req, res, next) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!updatedProduct) {
    return next(new AppError("No product found with that id"), 404);
  }
  res.status(200).json({
    status: "success",
    data: updatedProduct,
  });
});
const deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("No product found with that id"), 404);
  }
  res.status(200).json({
    satus: "success",
    data: null,
  });
});
module.exports = {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
