
//  PlantTrust — OCR Module
//  Extracts text from uploaded deed images using Tesseract.js
// ──────────────────────────────────────────────────────────────
const { createWorker } = require("tesseract.js");


/**
 * Extracts text from an image file using Tesseract.js OCR engine.
 * @param {string} imagePath - Absolute path to the uploaded image file.
 * @returns {Promise<string>} - The extracted text content.
 */
async function extractText(imagePath) {
  console.log("[OCR] Initializing Tesseract worker…");
  const worker = await createWorker("eng");

  try {
    console.log("[OCR] Recognizing text from:", imagePath);
    const {
      data: { text },
    } = await worker.recognize(imagePath);

    const trimmed = text.trim();
    console.log(
      "[OCR] Extraction complete —",
      trimmed.length,
      "characters extracted."
    );
    return trimmed;
  } finally {
    await worker.terminate();
    console.log("[OCR] Worker terminated.");
  }
}

module.exports = { extractText };
