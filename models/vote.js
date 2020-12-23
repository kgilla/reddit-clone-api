const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  value: { type: Boolean },
  dateCreated: { type: Date, default: Date.now() },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  comment: { type: Schema.Types.ObjectId, ref: "Comment" },
});

module.exports = mongoose.model("Vote", voteSchema);
