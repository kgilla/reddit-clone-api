const express = require("express");
const router = express.Router();
const sub_controller = require("../controllers/sub_controller");
const passport = require("passport");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  sub_controller.create
);

router.get("/all", sub_controller.allPosts);
router.get("/", sub_controller.readAll);
router.get("/:name", sub_controller.read);

router.put(
  ":name/update",
  passport.authenticate("jwt", { session: false }),
  sub_controller.update
);

router.delete(
  ":name/delete",
  passport.authenticate("jwt", { session: false }),
  sub_controller.delete
);

module.exports = router;
