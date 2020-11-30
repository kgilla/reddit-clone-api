// author, title, content, karma, comments

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: { type: String },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String },
  dateCreated: { type: Date, default: Date.now() },
  dateEdited: { type: Date },
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);
