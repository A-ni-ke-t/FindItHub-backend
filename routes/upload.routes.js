const express = require("express");
const router = express.Router();
const uploadController = require("../service/upload.service");
const { uploaderMiddleware } = require("../middleware/upload");

router.post("/", uploaderMiddleware, uploadController.upload);


module.exports = router;
