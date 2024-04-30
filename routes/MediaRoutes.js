import express from "express";
import {
  // allDownload,
  instagramDl,
  // downTiktok
  // downYoutube,
} from "../controller/MediaDownloader.js";
import configDotenv from "dotenv";

configDotenv.config();

const router = express.Router();

router.post("/instagram", async (req, res) => {
  try {
    const { link } = req.body;
    const response = await instagramDl(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// router.post(`/${process.env.ALLDOWNLOAD}`, allDownload);
// router.post(`/${process.env.INSTAFB}`, downInstFB);
// router.post(`/${process.env.TIKTOK}`, downTiktok);
// router.post(`/${process.env.YOUTUBE}`, downYoutube);

export default router;
