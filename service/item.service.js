const Item = require("../models/items");
const Comment = require("../models/comments");

// Create new item
exports.createItem = async (req, res) => {
  try {
    const item = new Item({
      title: req.body.title,
      description: req.body.description,
      image: req.body.image,
      location: req.body.location,
      createdBy: req.user.userId,
    });
    const savedItem = await item.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// List items
exports.listItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.returned) filter.returned = req.query.returned === "true";
    const items = await Item.find(filter).populate("createdBy", "fullName emailAddress");
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Edit item
exports.editItem = async (req, res) => {
  try {
    const updates = req.body;
    Object.assign(req.item, updates, { updatedAt: new Date() });
    const updatedItem = await req.item.save();
    res.status(200).json(updatedItem);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mark as returned
exports.markReturned = async (req, res) => {
  try {
    req.item.returned = true;
    await req.item.save();
    res.status(200).json({ message: "Item marked as returned" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
