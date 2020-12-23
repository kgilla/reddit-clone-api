const express = require("express");
const router = express.Router({ mergeParams: true });
const comment_controller = require("../controllers/comment_controller");
const passport = require("passport");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  comment_controller.create
);

router.get(
  "/:commentID",
  passport.authenticate("jwt", { session: false }),
  comment_controller.read
);

router.put(
  "/:commentID/update",
  passport.authenticate("jwt", { session: false }),
  comment_controller.update
);

router.put(
  "/:commentID/vote",
  passport.authenticate("jwt", { session: false }),
  comment_controller.vote
);

router.delete(
  "/:commentID/delete",
  passport.authenticate("jwt", { session: false }),
  comment_controller.delete
);

module.exports = router;
