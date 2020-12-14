const { Comment, Post, Sub, User } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("name")
    .notEmpty()
    .withMessage("Community name is required")
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
      const { name, description } = req.body;
      const sub = new Sub({
        name,
        description,
      });
      const response = await sub.save();
      return res.status(201).json({
        response,
        message: "Sub created!",
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.read = async (req, res, next) => {
  try {
    const sub = await Sub.findById(req.params.subID)
      .populate({ path: "posts", populate: { path: "author comments" } })
      .exec();
    return res.status(200).json({
      sub,
    });
  } catch (err) {
    return next(err);
  }
};

exports.index = async (req, res, next) => {
  try {
    const subs = await Sub.find();
    return res.status(200).json({
      subs,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  // able to update sub description
};
exports.delete = async (req, res, next) => {};

exports.allPosts = async (req, res, next) => {
  try {
    const allSubs = await Sub.find();
    return res.status(200).json({
      allSubs,
    });
  } catch (err) {
    return next(err);
  }
};

exports.subscribe = async (req, res, next) => {
  try {
    console.log("here");
    const [sub, user] = await Promise.all([
      Sub.findById(req.params.subID),
      User.findById(req.user._id),
    ]);
    sub.subscribers.push(user._id);
    user.subscriptions.push(sub._id);
    const response = await Promise.all([sub.save(), user.save()]);
    res.status(200).json({
      message: `Successfully subscribed to ${sub.name}`,
      response,
    });
  } catch (err) {
    return next(err);
  }
};

exports.unsubscribe = async (req, res, next) => {
  try {
    const response = await Promise.all([
      Sub.findByIdAndUpdate(
        req.params.subID,
        { $pull: { subscribers: req.user._id } },
        {}
      ),
      User.findByIdAndUpdate(
        req.user._id,
        { $pull: { subscriptions: req.params.subID } },
        {}
      ),
    ]);

    res.status(200).json({
      message: `Successfully unsubscribed from ${sub.name}`,
      response,
    });
  } catch (err) {
    return next(err);
  }
};
