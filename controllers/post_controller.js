const { Comment, Post, Sub, User, Vote } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("title").isLength({ min: 1, max: 300 }),
  body("content").isLength({ max: 720 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { sub, title, content, type } = req.body;
      const post = new Post({
        title,
        content,
        type,
        author: req.user._id,
        sub,
      });
      await post.save();
      await User.findByIdAndUpdate(
        req.user.id,
        { $push: { posts: post._id } },
        {}
      );
      return res.status(201).json({
        post,
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
    const post = await Post.findById(req.params.postID)
      .populate("author comments sub")
      .exec();
    return res.status(200).json({
      post,
    });
  } catch (err) {
    return next(err);
  }
};

exports.index = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate("author comments sub")
      .sort({ _id: -1 });
    return res.status(200).json({
      posts,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = [
  body("title").isLength({ min: 1, max: 300 }),
  body("content").isLength({ max: 720 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { title, content } = req.body;
      const post = await Post.findById(req.params.postID);
      if (post.author.equals(req.user._id)) {
        await post.updateOne({ title, content, dateEdited: new Date() }, {});
        return res.status(204).send();
      } else {
        return res.status(401).send();
      }
    } catch (err) {
      return res.status(400).json({
        error: err,
      });
    }
  },
];

exports.delete = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.postID);
    if (post.author.equals(req.user.id)) {
      await Promise.all([
        User.findByIdAndUpdate(
          post.author,
          { $pull: { posts: req.params.postID } },
          {}
        ),
        await Post.findByIdAndDelete(post._id),
      ]);
      return res.status(204).send();
    } else {
      return res.status(401).send();
    }
  } catch (err) {
    return next(err);
  }
};

exports.homepage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find()
      .where("sub")
      .in(user.subscriptions)
      .populate("author sub")
      .sort({ _id: -1 });
    return res.status(200).json({
      posts,
    });
  } catch (err) {
    return next(err);
  }
};

exports.vote = async (req, res, next) => {
  try {
    const { value } = req.body;
    const query = { user: req.user, post: req.params.postID };
    const [oldVote, post] = await Promise.all([
      Vote.findOne(query),
      Post.findById(req.params.postID),
    ]);
    if (oldVote && oldVote.value === value) {
      return res.status(400).json({ error: "vote already cast" });
    } else {
      const vote = await Vote.findOneAndUpdate(
        query,
        { value },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (!oldVote) {
        value === true ? (post.score += 1) : (post.score -= 1);
      } else if (vote.value === null) {
        oldVote.value === true ? (post.score -= 1) : (post.score += 1);
      } else if (oldVote.value === null) {
        vote.value === true ? (post.score += 1) : (post.score -= 1);
      } else {
        vote.value === true ? (post.score += 2) : (post.score -= 2);
      }
      await post.save();
      return res.status(204);
    }
  } catch (err) {
    return next(err);
  }
};
