const Order = require("../models/order");
const Iteminstance = require("../models/iteminstance");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const debug = require("debug")("order");

exports.order_create_get = asyncHandler(async (req, res) => {
  const allIteminstances = await Iteminstance.find({ status: "Available" })
    .populate("item")
    .sort({ item: 1 })
    .exec();

  if (allIteminstances === null) {
    debug("Item Instances not found");
    const error = new Error("Item Instances not found");
    error.status = 404;
    return next(err);
  }

  res.render("order_form", {
    title: "Create Order",
    iteminstances: allIteminstances,
  });
});

exports.order_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.iteminstances)) {
      req.body.iteminstances =
        typeof req.body.iteminstances === "undefined"
          ? []
          : [req.body.iteminstances];
    }
    next();
  },
  body("iteminstances.*", "Item Instances is required")
    .isLength({ min: 1 })
    .escape(),
  body("status"),
  asyncHandler(async (req, res) => {
    // Iteminstances are the ones that are available. You want to create an order with available instances. Insert the date and total manually.
    const errors = validationResult(req);

    let total = 0.0;
    const itemPricePromises = [];

    req.body.iteminstances.forEach((iteminstance) => {
      const newPromise = new Promise(async (resolve, reject) => {
        const result = await Iteminstance.findById(iteminstance).populate(
          "item"
        );
        resolve(result.item.price);
      });

      itemPricePromises.push(newPromise);
    });

    const itemPrices = await Promise.all(itemPricePromises);

    if (itemPrices.length) {
      itemPrices.forEach((price) => {
        total += price;
      });
    }

    const order = new Order({
      iteminstances: req.body.iteminstances,
      order_date: Date.now(),
      status: "Pending",
      total: total,
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${order._id}`);

      const allIteminstances = await Iteminstance.find({ status: "available" })
        .populate("item")
        .sort({ item: 1 })
        .exec();

      for (const iteminstance of allIteminstances) {
        if (order.iteminstances.includes(iteminstance._id)) {
          iteminstance.checked = "true";
        }
      }

      res.render("order_form", {
        title: "Create Order",
        allIteminstances: allIteminstances,
        order: order,
        errors: errors.array(),
      });
      return;
    } else {
      await order.save();

      const newOrder = await Order.findById(order._id).populate(
        "iteminstances"
      );
      newOrder.iteminstances.forEach(
        asyncHandler(async (iteminstance) => {
          iteminstance.status = "Pending";
          await iteminstance.save();
        })
      );

      debug(`Created new order: ${order._id}`);
      res.redirect(order.url);
    }
  }),
];

exports.order_delete_get = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).exec();

  if (order === null) {
    debug(`Order to delete not found: ${req.params.id}`);
    const err = new Error("Order not found");
    err.status = 404;
    return next(err);
  }

  res.render("order_delete", { title: "Delete Order", order: order });
});

exports.order_delete_post = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).exec();

  if (order === null) {
    debug(`Order to delete not found: ${req.params.id}`);
    const err = new Error("Order not found");
    err.status = 404;
    return next(err);
  }

  const resetIteminstances = [];

  order.iteminstances.forEach((iteminstance) => {
    const newPromise = new Promise(async (resolve, reject) => {
      const pendingIteminstance = await Iteminstance.findById(iteminstance);
      pendingIteminstance.status = "Available";
      await pendingIteminstance.save();
      resolve();
    });
    resetIteminstances.push(newPromise);
  });

  await Promise.all(resetIteminstances);

  await Order.findByIdAndDelete(req.body.orderid);

  debug(`Updated order item instances to available: ${order._id}`);
  debug(`Deleted order: ${order._id}`);
  res.redirect("/inventory/orders");
});

exports.order_update_get = asyncHandler(async (req, res) => {
  const [order, allIteminstances] = await Promise.all([
    Order.findById(req.params.id),
    Iteminstance.find({ status: "Available" })
      .populate("item")
      .sort({ item: 1 })
      .exec(),
  ]);

  if (allIteminstances === null) {
    debug("Item Instances not found");
    const error = new Error("Item Instances not found");
    error.status = 404;
    return next(err);
  }

  if (order === null) {
    debug(`Order to update not found ${req.params.id}`);
    const err = new Error("Order not found");
    err.status = 404;
    return next(err);
  }

  for (const iteminstance of allIteminstances) {
    if (order.iteminstances.includes(iteminstance._id)) {
      iteminstance.checked = "true";
    }
  }

  res.render("order_form", {
    title: "Update Order",
    iteminstances: allIteminstances,
    order: order,
  });
});

exports.order_update_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.iteminstances)) {
      req.body.iteminstances =
        typeof req.body.iteminstances === "undefined"
          ? []
          : [req.body.iteminstances];
    }
    next();
  },
  body("iteminstances.*", "Item Instances is required")
    .isLength({ min: 1 })
    .escape(),
  body("status"),
  asyncHandler(async (req, res) => {
    // Iteminstances are the ones that are available. You want to create an order with available instances. Insert the date and total manually.
    const errors = validationResult(req);

    let total = 0.0;
    const itemPricePromises = [];

    req.body.iteminstances.forEach((iteminstance) => {
      const newPromise = new Promise(async (resolve, reject) => {
        const result = await Iteminstance.findById(iteminstance).populate(
          "item"
        );
        resolve(result.item.price);
      });

      itemPricePromises.push(newPromise);
    });

    const itemPrices = await Promise.all(itemPricePromises);

    if (itemPrices.length) {
      itemPrices.forEach((price) => {
        total += price;
      });
    }

    const order = new Order({
      iteminstances: req.body.iteminstances,
      order_date: Date.now(),
      status: "Pending",
      total: total,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      debug(`Validation Error(s) for ${order._id}`);

      const allIteminstances = await Iteminstance.find({ status: "available" })
        .populate("item")
        .sort({ item: 1 })
        .exec();

      for (const iteminstance of allIteminstances) {
        if (order.iteminstances.includes(iteminstance._id)) {
          iteminstance.checked = "true";
        }
      }

      res.render("order_form", {
        title: "Update Order",
        allIteminstances: allIteminstances,
        order: order,
        errors: errors.array(),
      });
      return;
    } else {
      const oldOrder = await Order.findById(req.params.id).populate(
        "iteminstances"
      );

      const [__, updatedOrder] = await Promise.all([
        oldOrder.iteminstances.forEach(
          asyncHandler(async (iteminstance) => {
            iteminstance.status = "Available";
            await iteminstance.save();
          })
        ),
        await Order.findByIdAndUpdate(req.params.id, order, {}).populate(
          "iteminstances"
        ),
      ]);

      updatedOrder.iteminstances.forEach(
        asyncHandler(async (iteminstance) => {
          iteminstance.status = "Pending";
          console.log(iteminstance);
          await iteminstance.save();
        })
      );

      debug(`Updated order: ${updatedOrder._id}`);
      res.redirect(updatedOrder.url);
    }
  }),
];

exports.order_detail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate({
      path: "iteminstances",
      populate: { path: "item", model: "Item" },
    })
    .exec();

  if (order === null) {
    debug(`Order not found: ${req.params.id}`);
    const err = new Error("Order not found");
    err.status = 404;
    return next(err);
  }

  res.render("order_detail", {
    title: "Order Detail",
    order: order,
    total: order.total,
  });
});

exports.order_list = asyncHandler(async (req, res) => {
  const allOrders = await Order.find().populate("iteminstances").exec();

  if (allOrders === null) {
    debug("Orders not found");
    const err = new Error("Orders not found");
    err.status = 404;
    return next(err);
  }

  res.render("order_list", {
    title: "Order List",
    order_list: allOrders,
  });
});
