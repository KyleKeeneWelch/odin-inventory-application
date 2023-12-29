const Iteminstance = require("../models/iteminstance");
const Item = require("../models/item");
const Order = require("../models/order");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("iteminstance");

exports.iteminstance_create_get = asyncHandler(async (req, res) => {
  const allItems = await Item.find().sort({ name: 1 }).exec();

  if (allItems === null) {
    debug("Items not found");
    const error = new Error("Items not found");
    error.status = 404;
    return next(err);
  }

  res.render("iteminstance_form", {
    title: "Create Item Instance",
    items: allItems,
  });
});

exports.iteminstance_create_post = [
  body("item", "Item is required").isLength({ min: 1 }).escape(),
  body("status", "Status is required").isLength({ min: 1 }).escape(),
  body("import_date", "Invalid date").isISO8601().toDate(),
  body("export_date", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("details")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 200 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const iteminstance = new Iteminstance({
      item: req.body.item,
      status: req.body.status,
      import_date: req.body.import_date,
      export_date: req.body.export_date,
      details: req.body.details,
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${iteminstance._id}`);

      const allItems = await Item.find().sort({ name: 1 }).exec();

      if (allItems === null) {
        debug("Items not found");
        const error = new Error("Items not found");
        error.status = 404;
        return next(err);
      }

      res.render("iteminstance_form", {
        title: "Create Item Instance",
        items: allItems,
        iteminstance: iteminstance,
        errors: errors.array(),
      });
      return;
    } else {
      await iteminstance.save();
      debug(`Created new iteminstance: ${iteminstance._id}`);
      res.redirect(iteminstance.url);
    }
  }),
];

exports.iteminstance_delete_get = asyncHandler(async (req, res) => {
  const [iteminstance, order] = await Promise.all([
    Iteminstance.findById(req.params.id).exec(),
    Order.find({ iteminstances: req.params.id }).exec(),
  ]);

  if (iteminstance === null) {
    debug(`Item Instance to delete not found: ${req.params.id}`);
    const err = new Error("Item Instance not found");
    err.status = 404;
    return next(err);
  }

  res.render("iteminstance_delete", {
    title: "Delete Item Instance",
    iteminstance: iteminstance,
    order: order,
  });
});

exports.iteminstance_delete_post = asyncHandler(async (req, res) => {
  const iteminstance = await Iteminstance.findById(req.params.id).exec();

  if (iteminstance === null) {
    debug(`Item Instance to delete not found: ${req.params.id}`);
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  await Iteminstance.findByIdAndDelete(req.body.iteminstanceid);
  debug(`Deleted item instance: ${iteminstance._id}`);
  res.redirect("/inventory/iteminstances");
});

exports.iteminstance_update_get = asyncHandler(async (req, res) => {
  const [iteminstance, allItems] = await Promise.all([
    Iteminstance.findById(req.params.id).exec(),
    Item.find().sort({ name: 1 }).exec(),
  ]);

  if (iteminstance === null) {
    debug(`Item Instance to update not found ${req.params.id}`);
    const err = new Error("Item Instance not found");
    err.status = 404;
    return next(err);
  }

  if (allItems === null) {
    debug("Items not found");
    const error = new Error("Items not found");
    error.status = 404;
    return next(err);
  }
  console.log(iteminstance.item);
  res.render("iteminstance_form", {
    title: "Update Item Instance",
    items: allItems,
    iteminstance: iteminstance,
  });
});

exports.iteminstance_update_post = [
  body("item", "Item is required").isLength({ min: 1 }).escape(),
  body("status", "Status is required").isLength({ min: 1 }).escape(),
  body("import_date", "Invalid date").isISO8601().toDate(),
  body("export_date", "Invalid date")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),
  body("details")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 200 })
    .escape(),
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const iteminstance = new Iteminstance({
      item: req.body.item,
      status: req.body.status,
      import_date: req.body.import_date,
      export_date: req.body.export_date,
      details: req.body.details,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${iteminstance._id}`);

      const allItems = await Item.find().sort({ name: 1 }).exec();

      if (allItems === null) {
        debug("Items not found");
        const error = new Error("Items not found");
        error.status = 404;
        return next(err);
      }

      res.render("iteminstance_form", {
        title: "Create Item Instance",
        items: allItems,
        iteminstance: iteminstance,
        errors: errors.array(),
      });
      return;
    } else {
      const updatedIteminstance = await Iteminstance.findByIdAndUpdate(
        req.params.id,
        iteminstance,
        {}
      );
      debug(`Updated item instance: ${updatedIteminstance._id}`);
      res.redirect(updatedIteminstance.url);
    }
  }),
];

exports.iteminstance_detail = asyncHandler(async (req, res) => {
  const iteminstance = await Iteminstance.findById(req.params.id)
    .populate("item")
    .exec();

  if (iteminstance === null) {
    debug(`Item Instance not found: ${req.params.id}`);
    const err = new Error("Item Instance not found");
    err.status = 404;
    return next(err);
  }

  res.render("iteminstance_detail", {
    title: "Item Instance Detail",
    iteminstance: iteminstance,
  });
});

exports.iteminstance_list = asyncHandler(async (req, res) => {
  const allIteminstances = await Iteminstance.find().populate("item").exec();

  if (allIteminstances === null) {
    debug("Item Instances not found");
    const err = new Error("Item Instances not found");
    err.status = 404;
    return next(err);
  }

  res.render("iteminstance_list", {
    title: "Item Instance List",
    iteminstance_list: allIteminstances,
  });
});
