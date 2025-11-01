const express = require("express");
const router = express.Router({ mergeParams: true });
const auth = require("../middleware/auth");
const commentController = require("../service/comment.service");

router.post("/:itemId/comments", auth, commentController.addComment);
router.get("/:itemId/comments", commentController.listComments);

module.exports = router;
