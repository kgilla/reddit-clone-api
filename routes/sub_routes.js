const express = require("express");
const router = express.Router();
const sub_controller = require("../controllers/sub_controller");

router.get("/", sub_controller.getIndex);

module.exports = router;
