const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subSchema = new Schema({
  name: { type: String },
  description: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  color: { type: String },
  picture: { type: String },
  dateCreated: { type: Date, default: Date.now() },
  subscribers: { type: Number, default: 0 },
});

module.exports = mongoose.model("Sub", subSchema);
