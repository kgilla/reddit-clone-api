// author, content, date posted, date edited, karma, comments

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User" },
  content: { type: String },
  dateCreated: { type: Date, default: Date.now() },
  dateEdited: { type: Date },
});

module.exports = mongoose.model("Comment", commentSchema);
