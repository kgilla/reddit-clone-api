// Name, description, date created, subscribers

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subSchema = new Schema({
  name: { type: String },
  description: { type: String },
  dateCreated: { type: Date, default: Date.now() },
  subscribers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

module.exports = mongoose.model("Sub", subSchema);
