const { Comment, Post, User, Vote } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("content").isLength({ min: 1, max: 720 }),
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
      await comment.save();
      if (parent) {
        const [author, parentComment, post] = await Promise.all([
          User.findById(req.user.id),
          Comment.findById(parent),
          Post.findById(req.params.postID),
        ]);
        author.comments.push(comment);
        parentComment.replies.push(comment);
        post.commentCount += 1;
        await Promise.all([author.save(), parentComment.save(), post.save()]);
      } else {
        const [author, post] = await Promise.all([
          User.findById(req.user.id),
          Post.findById(req.params.postID),
        ]);
        author.comments.push(comment);
        post.comments.push(comment);
        post.commentCount += 1;
        await Promise.all([author.save(), post.save()]);
      }
      return res.status(201).json({
        comment,
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
      const comment = await Comment.findById(req.params.commentID);
      if (comment.author.equals(req.user._id)) {
        await comment.updateOne({ content, dateEdited: Date.now() }, {});
        return res.status(204).send();
      } else {
        return res.status(401).send();
      }
    } catch (err) {
      return next(err);
    }
  },
];

exports.delete = async (req, res, next) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.commentID);

    const response = await Promise.all([
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
      message: "Comment deleted successfully",
      response,
    });
  } catch (err) {
    return next(err);
  }
};

exports.vote = async (req, res, next) => {
  try {
    const { value } = req.body;
    const query = { user: req.user, comment: req.params.commentID };
    const [oldVote, comment] = await Promise.all([
      Vote.findOne(query),
      Comment.findById(req.params.commentID),
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
        value === true ? (comment.score += 1) : (comment.score -= 1);
      } else if (vote.value === null) {
        oldVote.value === true ? (comment.score -= 1) : (comment.score += 1);
      } else if (oldVote.value === null) {
        vote.value === true ? (comment.score += 1) : (comment.score -= 1);
      } else {
        vote.value === true ? (comment.score += 2) : (comment.score -= 2);
      }
      await comment.save();
      return res.status(204);
    }
  } catch (err) {
    return next(err);
  }
};
