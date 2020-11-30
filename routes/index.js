const models = require("../models");
const comment_routes = require("./comment_routes");
const post_routes = require("./post_routes");
const sub_routes = require("./sub_routes");
const user_routes = require("./user_routes");

module.exports = {
  comment_routes,
  post_routes,
  sub_routes,
  user_routes,
};
