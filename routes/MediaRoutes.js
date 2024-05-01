import express from "express";
import {
  facebookdl,
  instagramDl,
  tikVideo,
  youtubedl,
} from "../controller/MediaDownloader.js";

import apiKeys from "../utils/apiKey.js";

const router = express.Router();

router.post("/instagram", checkApiKey, async (req, res) => {
  try {
    const { link } = req.body;
    const response = await instagramDl(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tiktok", checkApiKey, async (req, res) => {
  try {
    const { link } = req.body;
    const response = await tikVideo(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/facebook", checkApiKey, async (req, res) => {
  try {
    const { link } = req.body;
    const response = await facebookdl(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/youtube", checkApiKey, async (req, res) => {
  try {
    const { link } = req.body;
    const response = await youtubedl(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

function checkApiKey(req, res, next) {
  const apiKey = req.query.api_key;

  if (!apiKey || !apiKeys.has(apiKey)) {
    return res.status(401).json({ message: "Unauthorized: Invalid API Key" });
  }

  next();
}

export default router;
