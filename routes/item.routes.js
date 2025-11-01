const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const checkOwner = require("../middleware/ownership.middleware");
const itemController = require("../service/item.service");

router.post("/", auth, itemController.createItem);
router.get("/", itemController.listItems);
router.patch("/:itemId", auth, checkOwner, itemController.editItem);
router.patch("/:itemId/return", auth, checkOwner, itemController.markReturned);

module.exports = router;
