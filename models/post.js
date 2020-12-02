// author, title, content, karma, comments

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String },
  content: { type: String },
  dateCreated: { type: Date, default: Date.now() },
  dateEdited: { type: Date },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  sub: { type: Schema.Types.ObjectId, ref: "Sub" },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);
