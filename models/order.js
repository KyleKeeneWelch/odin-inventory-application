const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  iteminstances: [
    { type: Schema.Types.ObjectId, ref: "Iteminstance", required: true },
  ],
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

orderSchema.virtual("order_date_formatted").get(function () {
  return this.order_date
    ? DateTime.fromJSDate(this.order_date).toLocaleString(DateTime.DATE_MED)
    : "";
});

orderSchema.virtual("order_date_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.order_date).toISODate();
});

module.exports = mongoose.model("Order", orderSchema);
