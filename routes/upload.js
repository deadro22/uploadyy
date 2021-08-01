const express = require("express");
const router = express.Router();
const { upload, download } = require("../controllers/upload.c");

router.get("/download/:key", download);
router.post("/upload", upload);

module.exports = router;
