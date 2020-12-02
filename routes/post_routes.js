const express = require("express");
const router = express.Router();
const post_controller = require("../controllers/post_controller");
const passport = require("passport");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  post_controller.create
);

router.get("/", post_controller.readAll);

router.get("/:id", post_controller.read);

router.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  post_controller.update
);

router.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  post_controller.delete
);

module.exports = router;
