const Item = require("../models/items");

async function checkItemOwner(req, res, next) {
  const { itemId } = req.params;
  const item = await Item.findById(itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  if (item.createdBy.toString() !== req.user.userId) {
    return res.status(403).json({ message: "Not authorized" });
  }

  req.item = item;
  next();
}

module.exports = checkItemOwner;
