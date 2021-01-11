const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const voteSchema = new Schema({
  value: { type: Boolean },
  dateCreated: { type: Date, default: new Date() },
  user: { type: Schema.Types.ObjectId, ref: "User" },
  post: { type: Schema.Types.ObjectId, ref: "Post" },
  comment: { type: Schema.Types.ObjectId, ref: "Comment" },
});

module.exports = mongoose.model("Vote", voteSchema);
