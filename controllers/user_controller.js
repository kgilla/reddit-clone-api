const { Comment, Post, Sub, User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const { body, validationResult } = require("express-validator");

exports.create = (req, res, next) => {
  const { username, password } = req.body;
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return next(err);
    new User({
      username: username,
      password: hashedPassword,
    }).save((err, user) => {
      if (err) return next(err);
      res.status(201).json({
        user,
        message: "Saved successfully",
      });
    });
  });
};

exports.read = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    res.status(200).json({
      user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {};

exports.delete = async (req, res, next) => {};

exports.login = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      res.status(400).json({
        message: info.message,
      });
    } else if (!user) {
      return res.status(401).json({
        user,
        message: info.message,
      });
    } else {
      const token = jwt.sign({ user }, process.env.JWT_SECRET);
      return res.status(200).json({ user, token, message: info.message });
    }
  })(req, res);
};
