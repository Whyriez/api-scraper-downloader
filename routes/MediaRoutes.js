const express = require("express");
const {
  // allDownload,
  downInstFB,
  // downTiktok
  // downYoutube,
} = require("../controller/MediaDownloader.js");

const configDotenv = require("dotenv");

configDotenv.config();

const router = express.Router();

// router.post(`/${process.env.ALLDOWNLOAD}`, allDownload);
router.post(`/${process.env.INSTAFB}`, downInstFB);
// router.post(`/${process.env.TIKTOK}`, downTiktok);
// router.post(`/${process.env.YOUTUBE}`, downYoutube);

module.exports = router;
