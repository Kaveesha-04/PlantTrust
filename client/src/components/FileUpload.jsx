// ──────────────────────────────────────────────────────────────
//  PlantTrust — FileUpload Component (Member 1: Frontend)
//  Drag-and-drop file upload with preview and form submission
// ──────────────────────────────────────────────────────────────
import { useState, useRef, useCallback } from "react";
import "./FileUpload.css";

const API_URL = "http://localhost:3001/api/deed";

export default function FileUpload({ onResult, onProcessing }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // ── File Selection ──────────────────────────────────────────
  const handleFileSelect = useCallback((selectedFile) => {
    if (!selectedFile) return;

    const allowed = /\.(jpg|jpeg|png|gif|bmp|tiff|webp|pdf)$/i;
    if (!allowed.test(selectedFile.name)) {
      setError("Invalid file type. Please upload an image (JPG, PNG, etc.) or PDF.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum size is 10 MB.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Generate thumbnail preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }, []);

  // ── Drag & Drop handlers ───────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect]
  );

  // ── Form Submission ────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || isLoading) return;

    setIsLoading(true);
    setError(null);
    onProcessing?.(true);

    try {
      const formData = new FormData();
      formData.append("deed", file);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        let errMsg = data.error || "Server returned an error.";
        if (data.details) errMsg += ` Details: ${data.details}`;
        throw new Error(errMsg);
      }

      // Success — send result to parent
      onResult?.(data.data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.message || "Failed to process the deed. Is the server running?");
    } finally {
      setIsLoading(false);
      onProcessing?.(false);
    }
  };

  // ── Remove File ────────────────────────────────────────────
  const removeFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  // ── Format file size ──────────────────────────────────────
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section className="upload-section">
      <form onSubmit={handleSubmit} className="upload-card glass-card">
        {/* Header */}
        <div className="upload-card-header">
          <div className="upload-icon-wrapper">📄</div>
          <div>
            <h2>Upload Deed</h2>
            <p>Upload a Bim Saviya deed image for verification</p>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`dropzone ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload deed file"
        >
          <div className="dropzone-content">
            <span className="dropzone-icon">🌿</span>
            <p className="dropzone-text">
              Drag and drop your deed here, or <strong>click to browse</strong>
            </p>
            <p className="dropzone-hint">
              Supports JPG, PNG, GIF, BMP, TIFF, WebP, PDF — Max 10 MB
            </p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          className="file-input-hidden"
          accept="image/*,.pdf"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />

        {/* File Preview */}
        {file && (
          <div className="file-preview">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="preview-thumbnail"
              />
            ) : (
              <div
                className="preview-thumbnail"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-surface)",
                  fontSize: "1.5rem",
                }}
              >
                📎
              </div>
            )}
            <div className="preview-info">
              <div className="preview-name">{file.name}</div>
              <div className="preview-size">{formatSize(file.size)}</div>
            </div>
            <button
              type="button"
              className="preview-remove"
              onClick={removeFile}
              aria-label="Remove file"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="upload-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-btn"
          disabled={!file || isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner" />
              Processing Deed…
            </>
          ) : (
            <>
              🔍 Verify & Anchor to Blockchain
            </>
          )}
        </button>
      </form>
    </section>
  );
}
