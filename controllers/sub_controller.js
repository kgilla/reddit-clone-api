const { Comment, Post, Sub, User } = require("../models");
const { body, validationResult } = require("express-validator");

exports.create = async (req, res, next) => {
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
};
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
    const sub = await Sub.findOne({ name: req.params.name })
      .populate("posts")
      .exec();
    return res.status(200).json({
      sub,
    });
  } catch (err) {
    return next(err);
  }
};

exports.update = async (req, res, next) => {};
exports.delete = async (req, res, next) => {};
