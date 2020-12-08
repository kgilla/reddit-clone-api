const express = require("express");
const router = express.Router({ mergeParams: true });
const post_controller = require("../controllers/post_controller");
const passport = require("passport");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  post_controller.create
);

router.get("/:postID", post_controller.read);

router.put(
  "/:postID/update",
  passport.authenticate("jwt", { session: false }),
  post_controller.update
);

router.delete(
  "/:postID/delete",
  passport.authenticate("jwt", { session: false }),
  post_controller.delete
);

module.exports = router;
