const { Comment, Post, User } = require("../models");
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
        post: req.params.postID,
        parent,
      });
      const response = await comment.save();
      const [author, post] = await Promise.all([
        User.findById(req.user.id),
        Post.findById(req.params.postID),
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
    const comment = await Comment.findById(req.params.commentID)
      .populate("author", "username")
      .populate("parent post")
      .exec();
    return res.status(200).json({
      comment,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = [
  body("content").isLength({ min: 1, max: 360 }),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { content } = req.body;
      const response = await Comment.findByIdAndUpdate(
        req.params.commentID,
        { content: content, dateEdited: Date.now() },
        { new: true }
      );
      return res.status(201).json({
        response,
        message: "Comment edited successfully.",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.delete = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.commentID);

    const [response, responseTwo] = await Promise.all([
      User.findByIdAndUpdate(
        comment.author,
        { $pull: { comments: req.params.commentID } },
        {}
      ),
      Post.findByIdAndUpdate(
        comment.post,
        { $pull: { comments: req.params.commentID } },
        {}
      ),
    ]);

    return res.status(200).json({
      response,
      responseTwo,
      message: "Comment deleted successfully",
    });
  } catch (err) {
    return next(err);
  }
};
