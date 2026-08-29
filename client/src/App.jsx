// ──────────────────────────────────────────────────────────────
//  PlantTrust — Main Application Component (Member 1: Frontend)
//  React SPA featuring file upload form and results display
// ──────────────────────────────────────────────────────────────
import { useState } from "react";
import FileUpload from "./components/FileUpload";
import ResultsDisplay from "./components/ResultsDisplay";
import "./App.css";

export default function App() {
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="app">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">🌿</span>
            <span className="logo-text">PlantTrust</span>
          </div>
          <div className="header-badge">PoC Testnet</div>
        </div>
      </header>

      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="hero">
        <h1>
          <span className="gradient-text">Blockchain-Powered</span>
          <br />
          Deed Verification
        </h1>
        <p>
          Upload a Bim Saviya land deed to extract text via OCR, generate a
          tamper-proof SHA-256 hash, and permanently anchor it on the XRP
          Ledger Testnet.
        </p>

        {/* Pipeline visualization */}
        <div className="pipeline-badges">
          <span className="pipe-badge">📄 React SPA</span>
          <span className="pipe-arrow">→</span>
          <span className="pipe-badge">⚙️ Express API</span>
          <span className="pipe-arrow">→</span>
          <span className="pipe-badge">🔍 Tesseract OCR</span>
          <span className="pipe-arrow">→</span>
          <span className="pipe-badge">⛓️ XRPL</span>
          <span className="pipe-arrow">→</span>
          <span className="pipe-badge">💾 PostgreSQL</span>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────── */}
      <main className="main-content">
        <FileUpload
          onResult={setResult}
          onProcessing={setIsProcessing}
        />
        <ResultsDisplay
          result={result}
          isProcessing={isProcessing}
        />
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="app-footer">
        <div>PlantTrust © 2026 — Proof of Concept</div>
        <div className="footer-tech">
          <span>React</span>
          <span>Express</span>
          <span>PostgreSQL</span>
          <span>Tesseract.js</span>
          <span>XRPL</span>
        </div>
      </footer>
    </div>
  );
}
