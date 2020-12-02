const express = require("express");
const router = express.Router({ mergeParams: true });
const post_controller = require("../controllers/post_controller");
const passport = require("passport");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  post_controller.create
);

router.get("/:id", post_controller.read);

router.put(
  "/update/:id",
  passport.authenticate("jwt", { session: false }),
  post_controller.update
);

router.delete(
  "/delete/:id",
  passport.authenticate("jwt", { session: false }),
  post_controller.delete
);

module.exports = router;
