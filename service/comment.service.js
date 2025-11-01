const Comment = require("../models/comments");
const Item = require("../models/items");
const { sendResponse, sendError } = require("../utils/response");

// Add comment
exports.addComment = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return sendError(res, 404, "Item not found");
    if (item.returned) return sendError(res, 400, "Cannot comment on returned item");

    const comment = new Comment({
      itemId: item._id,
      userId: req.user.userId,
      content: req.body.content,
    });

    const savedComment = await comment.save();
    return sendResponse(res, 201, "Comment added successfully", savedComment);
  } catch (err) {
    return sendError(res, 500, "Server error", err.message);
  }
};

// List comments
exports.listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ itemId: req.params.itemId }).populate(
      "userId",
      "fullName emailAddress"
    );
    return sendResponse(res, 200, "Comments fetched successfully", comments);
  } catch (err) {
    return sendError(res, 500, "Server error", err.message);
  }
};
