const Category = require("../models/category");
const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("category");

exports.index_get = asyncHandler(async (req, res) => {
  const allCategories = await Category.find().sort({ name: 1 });
  if (allCategories === null) {
    debug(`Categories not found`);
    const err = new Error("Categories not found");
    err.status = 404;
    return next(err);
  }
  res.render("index", { title: "Home", categories: allCategories });
});

exports.index_post = [
  body("category", "Invalid Search Category")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res) => {
    // db.users.find(name: new RegExp(search)) //For substring search, case sensitive.
    // db.users.find(name: new RegExp('^' + search + '$')) //For exact search, case sensitive
    // db.users.find(name: new RegExp(search， ‘i')) //For substring search, case insensitive
    // db.users.find(name: new RegExp('^' +search + '$', 'i')); //For exact search, case insensitive

    if (req.body.category == "") {
      res.redirect("/inventory");
      return;
    }

    const resultCategories = await Category.find({
      name: new RegExp(req.body.category, "i"),
    });

    if (!resultCategories.length) {
      debug(`No results for searched category: ${req.body.category}`);
      res.render("index", {
        title: "Home",
        search_category: req.body.category,
        errors: [{ msg: "Category Not Found" }],
      });
      return;
    }
    debug(`Searched for category: ${req.body.category}`);
    res.render("index", { title: "Home", categories: resultCategories });
  }),
];

exports.category_create_get = (req, res) => {
  res.render("category_form", { title: "Create Category" });
};

exports.category_create_post = [
  body("name", "Name is required").trim().isLength({ min: 1 }).escape(),
  body("description", "Description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${category.name}`);
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      await category.save();
      debug(`Created new category: ${category._id}`);
      res.redirect(category.url);
    }
  }),
];

exports.category_delete_get = asyncHandler(async (req, res) => {
  const [category, items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    debug(`Category to delete not found: ${req.params.id}`);
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    items: items,
  });
});

exports.category_delete_post = asyncHandler(async (req, res) => {
  const [category, items] = await Promise.all([
    Category.findById(req.params.id).exec(),
    Item.find({ category: req.params.id }).exec(),
  ]);

  if (items.length > 0) {
    debug(`Items exist for category delete: ${req.params.id}`);
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      items: items,
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.body.categoryid);
    debug(`Deleted category: ${category._id}`);
    res.redirect("/inventory/categories");
  }
});

exports.category_update_get = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    debug(`Category to update not found ${req.params.id}`);
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_form", { title: "Update Category", category: category });
});

exports.category_update_post = [
  body("name", "Name is required").trim().isLength({ min: 1 }).escape(),
  body("description").trim().isLength({ min: 1 }).escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${category.name}`);
      res.render("category_form", {
        title: "Update Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        category,
        {}
      );
      res.redirect(updatedCategory.url);
    }
  }),
];

exports.category_detail = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id).exec();

  if (category === null) {
    debug(`Category not found: ${req.params.id}`);
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
  });
});

exports.category_list = asyncHandler(async (req, res) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  if (allCategories === null) {
    debug("Categories not found");
    const err = new Error("Categories not found");
    err.staus = 404;
    next(err);
  }

  res.render("category_list", {
    title: "Category List",
    category_list: allCategories,
  });
});
