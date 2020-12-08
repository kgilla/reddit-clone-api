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

exports.readAll = async (req, res, next) => {
  try {
    const allSubs = await Sub.find();
    return res.status(200).json({
      allSubs,
    });
  } catch (err) {
    return next(err);
  }
};

exports.read = async (req, res, next) => {
  try {
    const sub = await Sub.findById(req.params.subID)
      .populate("posts author")
      .exec();
    return res.status(200).json({
      sub,
    });
  } catch (err) {
    return next(err);
  }
};

exports.allPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("author sub").exec();
    return res.status(200).json({
      posts,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {
  // able to update sub description
};
exports.delete = async (req, res, next) => {};
