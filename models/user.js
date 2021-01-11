const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String },
  password: { type: String },
  email: { type: String },
  dateJoined: { type: Date, default: new Date() },
  subscriptions: [{ type: Schema.Types.ObjectId, ref: "Sub" }],
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("User", userSchema);
