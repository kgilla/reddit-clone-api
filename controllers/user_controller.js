const { Comment, Post, Sub, User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

exports.create = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (value) => {
      const user = await User.findOne({ username: value });
      return user
        ? Promise.reject("Username already in use.")
        : Promise.resolve(true);
    })
    .trim(),
  body("password")
    .isLength({ min: 8, max: 60 })
    .withMessage("Passwords must be at least 8 characters long.")
    .trim(),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be valid email address")
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      return user
        ? Promise.reject("Email already in use.")
        : Promise.resolve(true);
    })
    .trim()
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { username, password, email } = req.body;
      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        const user = new User({
          username: username,
          password: hashedPassword,
          email,
        });
        const response = await user.save();
        res.status(201).json({
          user: response,
          message: "Saved successfully",
        });
      });
    } catch (err) {
      return next(err);
    }
  },
];

exports.read = async (req, res, next) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    })
      .populate({ path: "comments", populate: { path: "author post" } })
      .populate({ path: "posts", populate: { path: "author sub" } });
    res.status(200).json({
      user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {};

exports.delete = async (req, res, next) => {};

exports.login = [
  body("username").trim().trim(),
  body("password").trim(),
  (req, res, next) => {
    passport.authenticate("local", { session: false }, (err, user, info) => {
      if (err) {
        res.status(400).json({
          message: info.message,
          err,
          name: info.name,
        });
      } else if (!user) {
        return res.status(401).json({
          user,
          message: info.message,
          name: info.name,
        });
      } else {
        const token = jwt.sign({ user }, process.env.JWT_SECRET);
        return res.status(200).json({ user, token });
      }
    })(req, res);
  },
];
