const { Comment, Post, Sub, User } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("name")
    .notEmpty()
    .withMessage("Community name is required")
    .isLength({ min: 3, max: 21 })
    .withMessage("Community name must be between 3-21 characters")
    .custom(async (value) => {
      const sub = await Sub.findOne({ name: value });
      return sub
        ? Promise.reject("Sub name already in use.")
        : Promise.resolve(true);
    })
    .trim(),
  body("description")
    .isLength({ min: 8, max: 600 })
    .withMessage("Description cannot exceed 600 characters"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { name, description, color } = req.body;
      const sub = new Sub({
        name,
        description,
        color,
        creator: req.user._id,
      });
      await sub.save();
      return res.status(201).json({
        sub,
        message: "Sub created!",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.read = async (req, res, next) => {
  try {
    const sub = await Sub.findById(req.params.subID);
    const posts = await Post.find({ sub: sub._id }).populate("author sub");
    return res.status(200).json({
      sub,
      posts,
    });
  } catch (err) {
    return next(err);
  }
};

exports.index = async (req, res, next) => {
  try {
    const subs = await Sub.find().sort("name");
    return res.status(200).json({
      subs,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  const { description, color, picture } = req.body;
  try {
    const sub = await Sub.findById(req.params.subID);
    if (sub.creator.equals(req.user._id)) {
      await sub.updateOne({ description, color, picture }, {});
      return res.status(204).send();
    } else {
      return res.status(401).send();
    }
  } catch (err) {
    return next(err);
  }
};

// unsure if i want to implement this or not.
exports.delete = async (req, res, next) => {};

exports.userSubs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const subs = await Sub.find().where("_id").in(user.subscriptions);
    return res.status(200).json({
      subs,
    });
  } catch (err) {
    return next(err);
  }
};

exports.subscribe = async (req, res, next) => {
  try {
    const sub = await Sub.findById(req.params.subID);
    await Promise.all([
      sub.updateOne({ $inc: { subscribers: 1 } }, {}),
      await User.findByIdAndUpdate(
        req.user._id,
        { $push: { subscriptions: sub._id } },
        {}
      ),
    ]);
    res.status(204).send();
  } catch (err) {
    return next(err);
  }
};

exports.unsubscribe = async (req, res, next) => {
  try {
    await Promise.all([
      Sub.findById(
        req.params.subID,
        { $dec: { $inc: { subscribers: -1 } } },
        {}
      ),
      User.findByIdAndUpdate(
        req.user._id,
        { $pull: { subscriptions: req.params.subID } },
        {}
      ),
    ]);
    res.status(204).send();
  } catch (err) {
    return next(err);
  }
};
