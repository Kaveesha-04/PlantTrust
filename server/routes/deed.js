// ──────────────────────────────────────────────────────────────
//  PlantTrust — Deed Route (Member 2: Backend Orchestration)
//  POST /api/deed — receives file, orchestrates OCR → XRPL → DB
// ──────────────────────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const { extractText } = require("../modules/ocr");
const { hashAndAnchor } = require("../modules/blockchain");
const { insertRecord } = require("../modules/database");

/**
 * POST /api/deed
 *
 * Accepts a multipart file upload (field name: "deed").
 * Orchestrates the full pipeline:
 *   1. OCR  → Extract text from the uploaded deed image
 *   2. XRPL → Hash the text (SHA-256) and anchor to blockchain
 *   3. DB   → Save the complete record to PostgreSQL
 *
 * Returns the full result to the frontend.
 */
router.post("/", async (req, res) => {
  try {
    // ── Validate upload ──────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded. Please upload a deed image.",
      });
    }

    const filePath = req.file.path;
    const filename = req.file.originalname;
    console.log("\n═══════════════════════════════════════════════");
    console.log("  PlantTrust Pipeline Started");
    console.log("  File:", filename);
    console.log("═══════════════════════════════════════════════\n");

    // ── Step 1: OCR — Extract text ───────────────────────────
    console.log("▶ Step 1/3: Running OCR…");
    const extractedText = await extractText(filePath);

    if (!extractedText || extractedText.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      return res.status(422).json({
        success: false,
        error:
          "OCR could not extract any text from this image. Please upload a clearer deed image.",
      });
    }

    // ── Step 2: Blockchain — Hash & Anchor ───────────────────
    console.log("\n▶ Step 2/3: Hashing & anchoring to XRPL…");
    const { sha256Hash, txHash, explorerUrl } = await hashAndAnchor(
      extractedText
    );

    // ── Step 3: Database — Save record ───────────────────────
    let record = null;
    let dbSkipped = false;
    try {
      console.log("\n▶ Step 3/3: Saving record to PostgreSQL…");
      record = await insertRecord({
        filename,
        extractedText,
        sha256Hash,
        txHash,
        explorerUrl,
      });
      console.log("[DB] Record saved with ID:", record.id);
    } catch (dbErr) {
      console.warn("[DB] Could not save to PostgreSQL (is it running?):", dbErr.message);
      console.warn("[DB] Skipping database step — returning results without DB record.");
      dbSkipped = true;
    }

    // ── Clean up uploaded file ───────────────────────────────
    fs.unlinkSync(filePath);

    // ── Success Response ─────────────────────────────────────
    const recordId = record ? record.id : "N/A (DB offline)";
    console.log("\n═══════════════════════════════════════════════");
    console.log("  ✅ Pipeline Complete — Record ID:", recordId);
    console.log("═══════════════════════════════════════════════\n");

    return res.status(201).json({
      success: true,
      data: {
        id: record ? record.id : 0,
        filename: filename,
        extractedText: extractedText,
        sha256Hash: sha256Hash,
        txHash: txHash,
        explorerUrl: explorerUrl,
        createdAt: record ? record.created_at : new Date().toISOString(),
        dbSkipped: dbSkipped,
      },
    });
  } catch (err) {
    console.error("[Route Error]", err);

    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      error: "An internal error occurred while processing the deed.",
      details: err.message,
    });
  }
});

module.exports = router;
