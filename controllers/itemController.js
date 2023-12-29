const Item = require("../models/item");
const Category = require("../models/category");
const Iteminstance = require("../models/iteminstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("item");

exports.item_create_get = asyncHandler(async (req, res) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  if (allCategories === null) {
    debug("Categories not found");
    const error = new Error("Categories not found");
    error.status = 404;
    return next(err);
  }

  res.render("item_form", { title: "Create Item", categories: allCategories });
});

exports.item_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  body("name", "Name is required")
    .trim()
    .isLength({ min: 1 })
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters")
    .escape(),
  body("description", "Description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*", "Category is required").isLength({ min: 1 }).escape(),
  body("price", "Price is required")
    .isLength({ min: 1 })
    .isCurrency()
    .withMessage("Price needs to be a valid currency")
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      image:
        typeof req.file === "undefined" ? "" : req.file.path.split("public")[1],
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${item.name}`);

      const allCategories = await Category.find().sort({ name: 1 }).exec();

      if (allCategories === null) {
        debug("Categories not found");
        const error = new Error("Categories not found");
        error.status = 404;
        return next(err);
      }

      for (const category of allCategories) {
        if (item.category.includes(category._id)) {
          category.checked = "true";
        }
      }

      res.render("item_form", {
        title: "Create Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      await item.save();
      debug(`Created new item: ${item._id}`);
      res.redirect(item.url);
    }
  }),
];

exports.item_delete_get = asyncHandler(async (req, res) => {
  const [item, iteminstances] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Iteminstance.find({ item: req.params.id }).exec(),
  ]);

  if (item === null) {
    debug(`Item to delete not found: ${req.params.id}`);
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }
  res.render("item_delete", {
    title: "Delete Item",
    item: item,
    iteminstances: iteminstances,
  });
});

exports.item_delete_post = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    debug(`Item to delete not found: ${req.params.id}`);
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  await Item.findByIdAndDelete(req.body.itemid);
  debug(`Deleted item: ${item._id}`);
  res.redirect("/inventory/items");
});

exports.item_update_get = asyncHandler(async (req, res) => {
  const [item, allCategories] = await Promise.all([
    Item.findById(req.params.id).exec(),
    Category.find().sort({ name: 1 }).exec(),
  ]);

  if (allCategories === null) {
    debug("Categories not found");
    const error = new Error("Categories not found");
    error.status = 404;
    return next(err);
  }

  if (item === null) {
    debug(`Item to update not found ${req.params.id}`);
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  for (const category of allCategories) {
    if (item.category.includes(category._id)) {
      category.checked = "true";
    }
  }

  res.render("item_form", {
    title: "Update Item",
    categories: allCategories,
    item: item,
  });
});

exports.item_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.category)) {
      req.body.category =
        typeof req.body.category === "undefined" ? [] : [req.body.category];
    }
    next();
  },
  body("name", "Name is required")
    .trim()
    .isLength({ min: 1 })
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters")
    .escape(),
  body("description", "Description is required")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("category.*", "Category is required").isLength({ min: 1 }).escape(),
  body("price", "Price is required")
    .isLength({ min: 1 })
    .isCurrency()
    .withMessage("Price needs to be a valid currency")
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      image:
        typeof req.file === "undefined" ? "" : req.file.path.split("public")[1],
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${item.name}`);

      const allCategories = await Category.find().sort({ name: 1 }).exec();

      if (allCategories === null) {
        debug("Categories not found");
        const error = new Error("Categories not found");
        error.status = 404;
        return next(err);
      }

      for (const category of allCategories) {
        if (item.category.includes(category._id)) {
          category.checked = "true";
        }
      }

      res.render("item_form", {
        title: "Update Item",
        categories: allCategories,
        item: item,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedItem = await Item.findByIdAndUpdate(req.params.id, item, {});
      debug(`Updated item: ${updatedItem._id}`);
      res.redirect(updatedItem.url);
    }
  }),
];

exports.item_detail = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate("category").exec();

  if (item === null) {
    debug(`Item not found: ${req.params.id}`);
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  res.render("item_detail", { title: "Item Detail", item: item });
});

exports.item_list = asyncHandler(async (req, res) => {
  const allItems = await Item.find()
    .sort({ name: 1 })
    .populate("category")
    .exec();

  if (allItems === null) {
    debug("Items not found");
    const err = new Error("Items not found");
    err.staus = 404;
    next(err);
  }

  res.render("item_list", {
    title: "Item List",
    item_list: allItems,
  });
});
