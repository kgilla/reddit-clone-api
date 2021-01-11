const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  type: { type: String },
  title: { type: String },
  content: { type: String },
  score: { type: Number, default: 0 },
  dateCreated: { type: Date, default: Date.now() },
  dateEdited: { type: Date },
  commentCount: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  sub: { type: Schema.Types.ObjectId, ref: "Sub" },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);
