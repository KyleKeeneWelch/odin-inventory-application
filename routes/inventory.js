const express = require("express");
const router = express.Router();

const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");
const iteminstance_controller = require("../controllers/iteminstanceController");
const order_controller = require("../controllers/orderController");

// Category routes
router.get("/", category_controller.index);

router.get("/category/create", category_controller.category_create_get);

router.post("/category/create", category_controller.category_create_post);

router.get("/category/:id/delete", category_controller.category_delete_get);

router.post("/category/:id/delete", category_controller.category_delete_post);

router.get("/category/:id/update", category_controller.category_update_get);

router.post("/category/:id/update", category_controller.category_update_post);

router.get("/category/:id", category_controller.category_detail);

router.get("/categories", category_controller.category_list);

// Item routes

router.get("/item/create", item_controller.item_create_get);

router.post("/item/create", item_controller.item_create_post);

router.get("/item/:id/delete", item_controller.item_delete_get);

router.post("/item/:id/delete", item_controller.item_delete_post);

router.get("/item/:id/update", item_controller.item_update_get);

router.post("/item/:id/update", item_controller.item_update_post);

router.get("/item/:id", item_controller.item_detail);

router.get("/items", item_controller.item_list);

// Item Instance routes

router.get(
  "/iteminstance/create",
  iteminstance_controller.iteminstance_create_get
);

router.post(
  "/iteminstance/create",
  iteminstance_controller.iteminstance_create_post
);

router.get(
  "/iteminstance/:id/delete",
  iteminstance_controller.iteminstance_delete_get
);

router.post(
  "/iteminstance/:id/delete",
  iteminstance_controller.iteminstance_delete_post
);

router.get(
  "/iteminstance/:id/update",
  iteminstance_controller.iteminstance_update_get
);

router.post(
  "/iteminstance/:id/update",
  iteminstance_controller.iteminstance_update_post
);

router.get("/iteminstance/:id", iteminstance_controller.iteminstance_detail);

router.get("/iteminstances", iteminstance_controller.iteminstance_list);

// Order routes
router.get("/order/create", order_controller.order_create_get);

router.post("/order/create", order_controller.order_create_post);

router.get("/order/:id/delete", order_controller.order_delete_get);

router.post("/order/:id/delete", order_controller.order_delete_post);

router.get("/order/:id/update", order_controller.order_update_get);

router.post("/order/:id/update", order_controller.order_update_post);

router.get("/order/:id", order_controller.order_detail);

router.get("/orders", order_controller.order_list);

module.exports = router;
