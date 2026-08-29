// ──────────────────────────────────────────────────────────────
//  PlantTrust — Express Server Entry Point (Member 2: Backend)
//  Exposes POST /api/deed to receive React frontend requests
//  and orchestrate OCR, XRPL, and Database modules.
// ──────────────────────────────────────────────────────────────
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { initDB } = require("./modules/database");
const deedRoute = require("./routes/deed");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Ensure uploads directory exists ──────────────────────────
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ── Middleware ────────────────────────────────────────────────

// CORS — Allow the React dev server (Vite on port 5173)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
  })
);

// JSON body parser
app.use(express.json());

// Multer — File upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|pdf)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only image files (JPG, PNG, GIF, BMP, TIFF, WebP) and PDF are accepted."
        )
      );
    }
  },
});

// ── Routes ───────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "PlantTrust API", timestamp: new Date() });
});

// Deed upload & processing pipeline
app.use("/api/deed", upload.single("deed"), deedRoute);

// ── Error handling ───────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res
      .status(400)
      .json({ success: false, error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
  next();
});

// ── Start Server ─────────────────────────────────────────────
async function start() {
  try {
    // Initialize database table
    await initDB();
    console.log("✅ Database initialized.");
  } catch (err) {
    console.warn(
      "⚠️  Database connection failed — server will start but DB features may not work."
    );
    console.warn("   Error:", err.message);
    console.warn(
      '   Make sure PostgreSQL is running and the "planttrust" database exists.\n'
    );
  }

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🌿  PlantTrust API Server                       ║
║                                                   ║
║   Running on:  http://localhost:${PORT}              ║
║   Health:      http://localhost:${PORT}/api/health    ║
║   Upload:      POST /api/deed                     ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
    `);
  });
}

start();
