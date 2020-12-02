const express = require("express");
const router = express.Router();

router.use("/users", require("./user_routes"));
router.use("/s", require("./sub_routes"));
router.use("/s/:name/posts", require("./post_routes"));
router.use("/s/:name/posts/:id/comments", require("./comment_routes"));

module.exports = router;
