const Comment = require("../models/comments");
const Item = require("../models/items");

// Add comment
exports.addComment = async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.returned) return res.status(400).json({ message: "Cannot comment on returned item" });

    const comment = new Comment({
      itemId: item._id,
      userId: req.user.userId,
      content: req.body.content,
    });

    const savedComment = await comment.save();
    res.status(201).json(savedComment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// List comments
exports.listComments = async (req, res) => {
  try {
    const comments = await Comment.find({ itemId: req.params.itemId }).populate("userId", "fullName emailAddress");
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
