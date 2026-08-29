// ──────────────────────────────────────────────────────────────
//  PlantTrust — ResultsDisplay Component (Member 1: Frontend)
//  Displays OCR text, SHA-256 hash, XRPL TX, and DB record info
// ──────────────────────────────────────────────────────────────
import "./ResultsDisplay.css";

export default function ResultsDisplay({ result, isProcessing }) {
  // ── Processing State ────────────────────────────────────────
  if (isProcessing) {
    return (
      <section className="processing-section">
        <div className="processing-card glass-card">
          <div className="processing-spinner" />
          <h2 className="processing-title">Processing Your Deed</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)" }}>
            This may take 15–30 seconds depending on the image
          </p>
          <ul className="processing-steps">
            <li className="processing-step active">
              <span className="step-icon">🔍</span>
              <span>Step 1 — Extracting text with OCR engine…</span>
            </li>
            <li className="processing-step">
              <span className="step-icon">⛓️</span>
              <span>Step 2 — Hashing & anchoring to XRPL Testnet…</span>
            </li>
            <li className="processing-step">
              <span className="step-icon">💾</span>
              <span>Step 3 — Saving record to PostgreSQL database…</span>
            </li>
          </ul>
        </div>
      </section>
    );
  }

  // ── No result yet ───────────────────────────────────────────
  if (!result) return null;

  // ── Format date ─────────────────────────────────────────────
  const formattedDate = new Date(result.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return (
    <section className="results-section">
      <div className="results-card glass-card">
        {/* Header */}
        <div className="results-header">
          <div className="results-icon-wrapper">✅</div>
          <div>
            <h2>Verification Complete</h2>
            <p className="record-id">
              Record #{result.id} • {result.filename}
            </p>
          </div>
          <div className="status-badge">
            <span className="status-dot" />
            Anchored
          </div>
        </div>

        {/* Result Rows */}
        <div className="result-rows">
          {/* Extracted Text */}
          <div className="result-row">
            <div className="result-label">
              <span className="result-label-icon">🔍</span>
              Extracted Text (OCR)
            </div>
            <div className="extracted-text-box">
              {result.extractedText || "No text extracted."}
            </div>
          </div>

          {/* SHA-256 Hash */}
          <div className="result-row">
            <div className="result-label">
              <span className="result-label-icon">🔐</span>
              SHA-256 Hash
            </div>
            <div className="hash-value">{result.sha256Hash}</div>
          </div>

          {/* XRPL TX Hash */}
          <div className="result-row">
            <div className="result-label">
              <span className="result-label-icon">⛓️</span>
              XRPL Transaction Hash
            </div>
            <div className="result-value" style={{ fontFamily: "'Courier New', monospace" }}>
              {result.txHash}
            </div>
          </div>

          {/* Explorer Link */}
          <div className="result-row">
            <div className="result-label">
              <span className="result-label-icon">🌐</span>
              XRPL Testnet Explorer
            </div>
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="explorer-link"
            >
              View Transaction on XRPL Explorer
              <span className="link-arrow">→</span>
            </a>
          </div>

          {/* Database Record ID */}
          <div className="result-row">
            <div className="result-label">
              <span className="result-label-icon">💾</span>
              Database Record
            </div>
            <div className="result-value">
              Record <strong>#{result.id}</strong> saved to PostgreSQL{" "}
              <code style={{ color: "var(--text-muted)", fontSize: "var(--font-size-xs)" }}>
                (plant_records table)
              </code>
            </div>
          </div>
        </div>

        {/* Timestamp */}
        <div className="timestamp">Processed at {formattedDate}</div>
      </div>
    </section>
  );
}
