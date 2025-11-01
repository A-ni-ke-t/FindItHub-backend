const Item = require("../models/items");
const Comment = require("../models/comments");
const { sendResponse, sendError } = require("../utils/response");

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
    return sendResponse(res, 201, "Item created successfully", savedItem);
  } catch (err) {
    return sendError(res, 500, "Server error", err.message);
  }
};

// List items
exports.listItems = async (req, res) => {
  try {
    const filter = {};

    // Filter by returned status (optional)
    if (req.query.returned) {
      filter.returned = req.query.returned === "true";
    }

    // Search by description (and optionally title)
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, "i"); // 'i' = case-insensitive
      filter.$or = [
        { description: searchRegex },
        { title: searchRegex } // optional: include title in search
      ];
    }

    const items = await Item.find(filter)
      .populate("createdBy", "fullName emailAddress")
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, "Items fetched successfully", items);
  } catch (err) {
    return sendError(res, 500, "Server error", err.message);
  }
};


// Edit item
exports.editItem = async (req, res) => {
  try {
    const updates = req.body;
    Object.assign(req.item, updates, { updatedAt: new Date() });
    const updatedItem = await req.item.save();
    return sendResponse(res, 200, "Item updated successfully", updatedItem);
  } catch (err) {
    return sendError(res, 500, "Server error", err.message);
  }
};

// Mark as returned
exports.markReturned = async (req, res) => {
  try {
    req.item.returned = true;
    const updatedItem = await req.item.save();
    return sendResponse(res, 200, "Item marked as returned", updatedItem);
  } catch (err) {
    return sendError(res, 500, "Server error", err.message);
  }
};
