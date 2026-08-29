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
    console.log("\n▶ Step 3/3: Saving record to PostgreSQL…");
    const record = await insertRecord({
      filename,
      extractedText,
      sha256Hash,
      txHash,
      explorerUrl,
    });

    // ── Clean up uploaded file ───────────────────────────────
    fs.unlinkSync(filePath);

    // ── Success Response ─────────────────────────────────────
    console.log("\n═══════════════════════════════════════════════");
    console.log("  ✅ Pipeline Complete — Record ID:", record.id);
    console.log("═══════════════════════════════════════════════\n");

    return res.status(201).json({
      success: true,
      data: {
        id: record.id,
        filename: record.filename,
        extractedText: record.extracted_text,
        sha256Hash: record.sha256_hash,
        txHash: record.xrpl_tx_hash,
        explorerUrl: record.xrpl_explorer_url,
        createdAt: record.created_at,
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
