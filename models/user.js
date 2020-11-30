// Username, password, email, date joined, subs, karma, bio section - picture ? , details, posts, comments

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  password: { type: String },
  email: { type: String },
  username: { type: String },
  dateJoined: { type: Date, default: Date.now() },
  posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
});

module.exports = mongoose.model("User", userSchema);
