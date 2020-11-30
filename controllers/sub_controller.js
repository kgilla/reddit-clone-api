const { Comment, Post, Sub, User } = require("../models");

exports.getIndex = (req, res, next) => {
  res.send("Hello sub");
};
