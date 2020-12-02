const { Comment, Post, Sub, User } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("title").isLength({ min: 1 }),
  body("content").isLength({ min: 1 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { title, content, subID } = req.body;
      const post = new Post({
        title,
        content,
        author: req.user._id,
        sub: subID,
      });
      const savedPost = await post.save();
      const [user, sub] = await Promise.all([
        User.findById(req.user._id).exec(),
        Sub.findById(subID).exec(),
      ]);
      user.posts.push(post._id);
      sub.posts.push(post._id);
      await Promise.all([user.save(), sub.save()]);
      return res.status(200).json({
        user,
        sub,
        savedPost,
        message: "Post created successfully",
      });
    } catch (err) {
      return res.status(400).json({
        error: err,
      });
    }
  },
];

exports.read = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author comments")
      .exec();
    return res.status(200).json({
      post,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {};

exports.delete = async (req, res, next) => {};
