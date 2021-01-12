const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: { type: String },
  score: { type: Number, default: 0 },
  dateCreated: { type: Date, default: new Date() },
  dateEdited: { type: Date },
  author: { type: Schema.Types.ObjectId, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  parent: { type: Schema.Types.ObjectId, ref: "Comment" },
  replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

function autoPopulateReplies(next) {
  this.populate("author").populate({
    path: "replies",
    options: { sort: { score: -1 } },
  });
  next();
}

commentSchema
  .pre("find", autoPopulateReplies)
  .pre("findOne", autoPopulateReplies);

module.exports = mongoose.model("Comment", commentSchema);
