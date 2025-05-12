
import express from "express";
import multer from "multer";
import axios from "axios";
import fs from "fs/promises";

const router = express.Router();
const upload = multer({ dest: "tmp/" }); 
const noFiles = upload.none(); 

router.post("/", upload.single("fingerprint_image"), async (req, res) => {
  try {
    const { template = "", ipaddress = "" } = req.body;
    const file = req.file;

    if (!template || !ipaddress) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing template or IP address." });
    }

    if (!file) {
      return res
        .status(400)
        .json({ status: "error", message: "No fingerprint image received." });
    }

   
    const imgBuf = await fs.readFile(file.path);
    const fingerprint_image = imgBuf.toString("base64");


    await fs.unlink(file.path).catch(() => {});

    await axios.post(
      "http://localhost:3000/send-fingerprint",
      {
        template,
        fingerprint_image,
        ipaddress,
      },
      { headers: { "Content-Type": "application/json" } },
    );

    return res.json({
      status: "success",
      message: "Fingerprint data sent to WebSocket!",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

router.post("/match-fingerprint", noFiles, async (req, res) => {
  try {

    const { id = "", ip = "" } = req.body;

    if (!id || !ip) {
      return res
        .status(400)
        .json({ status: "error", message: "Missing id or IP address." });
    }
    
    const payload = { id, ipaddress: ip };

    const { data } = await axios.post(
      "http://localhost:3000/match-fingerprint",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return res.json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: err instanceof Error ? err.message : "Unknown error",
    });
  }
});


export default router;
