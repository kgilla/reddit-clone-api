const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String },
  score: { type: Number, default: 1 },
  dateCreated: { type: Date, default: Date.now() },
  dateEdited: { type: Date },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  parent: { type: Schema.Types.ObjectId, ref: "Comment" },
});

module.exports = mongoose.model("Comment", commentSchema);
