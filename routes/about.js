const express = require("express");
const router = express.Router();
const { getLatestRelease } = require("../controllers/aboutController");

router.get("/", getLatestRelease);

module.exports = router;
