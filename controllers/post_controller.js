const { Comment, Post, Sub, User } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("title").isLength({ min: 1, max: 100 }),
  body("content").isLength({ min: 1, max: 360 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { title, content } = req.body;

      const [user, sub] = await Promise.all([
        User.findById(req.user._id).exec(),
        Sub.findOne({ name: req.params.name }).exec(),
      ]);

      const post = new Post({
        title,
        content,
        author: req.user._id,
        sub: sub,
      });

      const savedPost = await post.save();

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

exports.update = [
  body("title").isLength({ min: 1, max: 100 }),
  body("content").isLength({ min: 1, max: 360 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { title, content } = req.body;
      const response = await Post.findByIdAndUpdate(
        req.params.id,
        { title, content, dateEdited: Date.now() },
        { new: true }
      );
      return res.status(200).json({
        response,
        message: "Post updated successfully",
      });
    } catch (err) {
      return res.status(400).json({
        error: err,
      });
    }
  },
];

// May need to change to make more performant.
exports.delete = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate("author")
      .exec();
    comments.forEach(async (comment) => {
      await User.findByIdAndUpdate(
        comment.author,
        { $pull: { comments: comment._id } },
        {}
      );
    });
    await Comment.deleteMany({ post: req.params.id });
    const post = await Post.findById(req.params.id);
    await User.findByIdAndUpdate(
      post.author,
      { $pull: { posts: req.params.id } },
      {}
    );
    await Sub.findByIdAndUpdate(
      post.sub,
      { $pull: { posts: req.params.id } },
      {}
    );
    const response = await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      response,
      message: "Post successfully deleted",
    });
  } catch (err) {
    return next(err);
  }
};
