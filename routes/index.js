const express = require("express");
const router = express.Router();

router.use("/users", require("./user_routes"));
router.use("/s", require("./sub_routes"));
router.use("/s/:subID/posts", require("./post_routes"));
router.use("/s/:subID/posts/:postID/comments", require("./comment_routes"));

module.exports = router;
