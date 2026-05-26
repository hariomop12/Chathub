import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import { r2, R2_BUCKET, R2_PUBLIC } from "../config/r2.js";

const MAX_SIZE = 50 * 1024 * 1024;

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file provided" });
    }

    if (file.size > MAX_SIZE) {
      return res.status(400).json({ error: "File exceeds 50MB limit" });
    }

    const ext = file.originalname.split(".").pop() || "";
    const key = `${crypto.randomUUID()}${ext ? "." + ext : ""}`;

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const url = `${R2_PUBLIC}/${key}`;

    res.json({
      url,
      name: file.originalname,
      type: file.mimetype,
      size: file.size,
    });
  } catch (err) {
    console.error("uploadFile error:", err);
    res.status(500).json({ error: "Failed to upload file" });
  }
};
