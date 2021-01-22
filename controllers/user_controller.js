const { Comment, Post, Sub, User, Vote } = require("../models");
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
      .populate({
        path: "comments",
        options: { sort: { dateCreated: -1 } },
        populate: {
          path: "post",
          populate: { path: "author" },
        },
      })
      .populate({
        path: "posts",
        options: { sort: { dateCreated: -1 } },
        populate: { path: "author sub" },
      })
      .sort({ dateCreated: 1 });
    res.status(200).json({
      user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.updatePassword = [
  body("oldPassword").isLength({ min: 8, max: 60 }).trim(),
  body("password")
    .isLength({ min: 8, max: 60 })
    .withMessage("Passwords must be at least 8 characters long.")
    .trim(),
  body("password2")
    .isLength({ min: 8, max: 60 })
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password");
      }
      return true;
    })
    .trim(),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    try {
      const { oldPassword, password } = req.body;
      const user = await User.findById(req.user._id);
      const match = await bcrypt.compare(oldPassword, user.password);
      if (match) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const response = await User.findByIdAndUpdate(req.user._id, {
          password: hashedPassword,
        });
        if (response) return res.status(204).send();
      } else {
        return res.status(401).json({
          message: "Password incorrect",
        });
      }
    } catch (err) {
      return next(err);
    }
  },
];

exports.updateEmail = [
  body("email")
    .notEmpty()
    .isEmail()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      return user
        ? Promise.reject("Email already in use.")
        : Promise.resolve(true);
    })
    .trim()
    .normalizeEmail(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }
    try {
      const { email } = req.body;
      const response = await User.findByIdAndUpdate(
        req.user._id,
        { email },
        { new: true }
      );
      if (response) return res.status(200).json({ response });
    } catch (err) {
      return next(err);
    }
  },
];

exports.delete = async (req, res, next) => {};

exports.login = [
  body("username").trim().trim(),
  body("password").trim(),
  (req, res, next) => {
    passport.authenticate(
      "local",
      { session: false },
      async (err, user, info) => {
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
          const votes = await Vote.find({ user: user._id });
          return res.status(200).json({ user, token, votes });
        }
      }
    )(req, res);
  },
];

const changePassword = () => {
  bcrypt.compare(password, user.password, (err, res) => {
    if (res) {
      return done(null, user, {
        message: `Welcome back ${user.name}!`,
      });
    } else {
      return done(null, false, {
        message: "Incorrect password",
        name: "password",
      });
    }
  });
};
