const express = require("express");
const router = express.Router();
const comment_controller = require("../controllers/comment_controller");
const passport = require("passport");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  comment_controller.create
);

router.get("/", comment_controller.readAll);

router.get("/:id", comment_controller.read);

router.post(
  "/update",
  passport.authenticate("jwt", { session: false }),
  comment_controller.update
);

router.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  comment_controller.delete
);
module.exports = router;
