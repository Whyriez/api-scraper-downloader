import express from "express";
import {
  facebookdl,
  instagramDl,
  tikVideo,
  youtubedl,
} from "../controller/MediaDownloader.js";

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

router.post("/tiktok", async (req, res) => {
  try {
    const { link } = req.body;
    const response = await tikVideo(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/facebook", async (req, res) => {
  try {
    const { link } = req.body;
    const response = await facebookdl(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/youtube", async (req, res) => {
  try {
    const { link } = req.body;
    const response = await youtubedl(link);
    res.status(response.status).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
