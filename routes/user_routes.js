const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/user_controller");

router.post("/create", user_controller.create);
router.get("/:id", user_controller.read);
router.post("/login", user_controller.login);

module.exports = router;
