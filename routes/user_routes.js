const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user_controller");
const passport = require("passport");

router.post("/create", user_controller.create);
router.get("/:username", user_controller.read);
router.post("/login", user_controller.login);

module.exports = router;
