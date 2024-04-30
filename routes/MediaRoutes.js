import express from "express";
import {
  // allDownload,
  downInstFB,
  // downTiktok
  // downYoutube,
} from "../controller/MediaDownloader.js";
import configDotenv from "dotenv";

configDotenv.config();

const router = express.Router();

// router.post(`/${process.env.ALLDOWNLOAD}`, allDownload);
router.post(`/${process.env.INSTAFB}`, downInstFB);
// router.post(`/${process.env.TIKTOK}`, downTiktok);
// router.post(`/${process.env.YOUTUBE}`, downYoutube);

export default router;
