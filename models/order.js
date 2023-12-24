const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  items: [{ type: Schema.Types.ObjectId, ref: "Item", required: true }],
  order_date: { type: Date, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Shipping", "Delivered"],
  },
  total: { type: Number, required: true },
});

orderSchema.virtual("url").get(function () {
  return `/inventory/order/${this._id}`;
});
