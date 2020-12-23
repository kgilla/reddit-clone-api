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
      const { sub, title, content } = req.body;

      const [user, subDoc] = await Promise.all([
        User.findById(req.user._id).exec(),
        Sub.findById(sub).exec(),
      ]);

      const post = new Post({
        title,
        content,
        author: req.user._id,
        sub,
      });

      const savedPost = await post.save();

      user.posts.push(post._id);
      subDoc.posts.push(post._id);

      await Promise.all([user.save(), subDoc.save()]);

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
    const posts = await Post.find().populate("author comments sub").exec();
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
        await post.updateOne({ title, content, dateEdited: Date.now() }, {});
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

// May need to change to make more performant. Perhaps adopt a more reddit type approach to only deleting the document and not removing all child nodes...
exports.delete = async (req, res, next) => {
  try {
    const comments = await Comment.find({ post: req.params.postID })
      .populate("author")
      .exec();
    comments.forEach(async (comment) => {
      await User.findByIdAndUpdate(
        comment.author,
        { $pull: { comments: comment._id } },
        {}
      );
    });
    await Comment.deleteMany({ post: req.params.postID });
    const post = await Post.findById(req.params.postID);
    await User.findByIdAndUpdate(
      post.author,
      { $pull: { posts: req.params.postID } },
      {}
    );
    await Sub.findByIdAndUpdate(
      post.sub,
      { $pull: { posts: req.params.postID } },
      {}
    );
    const response = await Post.findByIdAndDelete(req.params.postID);
    return res.status(200).json({
      response,
      message: "Post successfully deleted",
    });
  } catch (err) {
    return next(err);
  }
};

exports.homepage = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const posts = await Post.find().where("sub").in(user.subscriptions).exec();
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
