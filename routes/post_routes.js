const express = require("express");
const router = express.Router({ mergeParams: true });
const post_controller = require("../controllers/post_controller");
const passport = require("passport");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  post_controller.create
);

router.get(
  "/home",
  passport.authenticate("jwt", { session: false }),
  post_controller.homepage
);

router.get("/", post_controller.index);

router.get("/:postID", post_controller.read);

router.put(
  "/:postID/update",
  passport.authenticate("jwt", { session: false }),
  post_controller.update
);

router.put(
  "/:postID/vote",
  passport.authenticate("jwt", { session: false }),
  post_controller.vote
);

router.delete(
  "/:postID/delete",
  passport.authenticate("jwt", { session: false }),
  post_controller.delete
);

module.exports = router;
