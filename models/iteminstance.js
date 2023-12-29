const { DateTime } = require("luxon");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const iteminstanceSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: "Item", required: true },
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

iteminstanceSchema.virtual("import_date_formatted").get(function () {
  return this.import_date
    ? DateTime.fromJSDate(this.import_date).toLocaleString(DateTime.DATE_MED)
    : "";
});

iteminstanceSchema.virtual("export_date_formatted").get(function () {
  return this.export_date
    ? DateTime.fromJSDate(this.export_date).toLocaleString(DateTime.DATE_MED)
    : "";
});

iteminstanceSchema.virtual("import_date_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.import_date).toISODate();
});

iteminstanceSchema.virtual("export_date_yyyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.export_date).toISODate();
});

module.exports = mongoose.model("Iteminstance", iteminstanceSchema);
