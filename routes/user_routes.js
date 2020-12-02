const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user_controller");
const passport = require("passport");

router.post("/create", user_controller.create);

router.get(
  "/:username",
  passport.authenticate("jwt", { session: false }),
  user_controller.read
);

router.put(
  "/:username/update",
  passport.authenticate("jwt", { session: false }),
  user_controller.update
);

router.delete(
  "/:username/delete",
  passport.authenticate("jwt", { session: false }),
  user_controller.delete
);

router.post("/login", user_controller.login);

module.exports = router;
