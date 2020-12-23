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
    const sub = await Sub.findById(req.params.subID)
      .populate({ path: "posts", populate: { path: "author comments sub" } })
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
    const [sub, user] = await Promise.all([
      Sub.findById(req.params.subID),
      User.findById(req.user._id),
    ]);
    sub.subscribers.push(user._id);
    user.subscriptions.push(sub._id);
    await Promise.all([sub.save(), user.save()]);
    res.status(200).json({
      message: `Successfully subscribed to ${sub.name}`,
      sub,
      user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.unsubscribe = async (req, res, next) => {
  try {
    const [sub, user] = await Promise.all([
      Sub.findByIdAndUpdate(
        req.params.subID,
        { $pull: { subscribers: req.user._id } },
        { new: true }
      ),
      User.findByIdAndUpdate(
        req.user._id,
        { $pull: { subscriptions: req.params.subID } },
        { new: true }
      ),
    ]);
    res.status(200).json({
      message: "Successfully unsubscribed",
      sub,
      user,
    });
  } catch (err) {
    return next(err);
  }
};
