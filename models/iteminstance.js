const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const iteminstanceSchema = new Schema({
  item: { type: Schema.Types.ObjectId, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Pending", "Shipped", "Available"],
    default: "Available",
  },
  import_date: { type: Date, required: true },
  export_date: { type: Date },
  details: { type: String },
});

iteminstanceSchema.virtual("url").get(function () {
  return `/inventory/iteminstance/${this._id}`;
});

module.exports = mongoose.model("Iteminstance", iteminstanceSchema);
