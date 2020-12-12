const { Comment, Post, Sub, User } = require("../models");
const { body, validationResult } = require("express-validator");

function populateReplies(node) {
  return Node.populate(node, { path: "replies author" }).then(function (node) {
    return node.replies ? populateParents(node.replies) : Promise.fulfill(node);
  });
}

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
      const response = await Post.findByIdAndUpdate(
        req.params.postID,
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
