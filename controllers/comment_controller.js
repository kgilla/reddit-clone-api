const { Comment, Post, Sub, User } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("content").isLength({ min: 1, max: 360 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { content, parent } = req.body;
      const comment = new Comment({
        content,
        author: req.user.id,
        parent,
      });
      const response = await comment.save();
      const [author, post] = await Promise.all([
        User.findById(req.user.id),
        Post.findById(req.params.id),
      ]);
      author.comments.push(comment);
      post.comments.push(comment);
      await Promise.all([author.save(), post.save()]);
      return res.status(201).json({
        response,
        message: "Comment submitted successfully.",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.read = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("author post parent")
      .exec();
    return res.status(200).json({
      comment,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {};
exports.delete = async (req, res, next) => {};
