// ──────────────────────────────────────────────────────────────
//  PlantTrust — Database Module (Member 3)
//  PostgreSQL schema & query logic using the `pg` package
// ──────────────────────────────────────────────────────────────
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "planttrust",
});

/**
 * Initializes the database by creating the `plant_records` table
 * if it does not already exist.
 *
 * Schema rationale (PostgreSQL over MongoDB):
 *   - ACID compliance ensures data integrity for financial escrow records.
 *   - Relational schema enforces strict data structure (no orphan fields).
 *   - SERIAL primary key guarantees unique, sequential record IDs.
 */
async function initDB() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS plant_records (
      id               SERIAL PRIMARY KEY,
      filename         VARCHAR(255) NOT NULL,
      extracted_text   TEXT,
      sha256_hash      VARCHAR(64)  NOT NULL,
      xrpl_tx_hash     VARCHAR(128),
      xrpl_explorer_url TEXT,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableSQL);
    console.log("[DB] Table 'plant_records' is ready.");
  } catch (err) {
    console.error("[DB] Failed to initialize table:", err.message);
    throw err;
  }
}

/**
 * Inserts a new plant deed record into the database.
 *
 * Uses parameterized queries ($1, $2…) to prevent SQL injection.
 *
 * @param {{ filename: string, extractedText: string, sha256Hash: string, txHash: string, explorerUrl: string }} data
 * @returns {Promise<Object>} The newly inserted row.
 */
async function insertRecord({
  filename,
  extractedText,
  sha256Hash,
  txHash,
  explorerUrl,
}) {
  const insertSQL = `
    INSERT INTO plant_records (filename, extracted_text, sha256_hash, xrpl_tx_hash, xrpl_explorer_url)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [filename, extractedText, sha256Hash, txHash, explorerUrl];

  try {
    const result = await pool.query(insertSQL, values);
    console.log("[DB] Record inserted with ID:", result.rows[0].id);
    return result.rows[0];
  } catch (err) {
    console.error("[DB] Insert failed:", err.message);
    throw err;
  }
}

/**
 * Retrieves all plant deed records from the database.
 * @returns {Promise<Array>} Array of all records.
 */
async function getAllRecords() {
  const result = await pool.query(
    "SELECT * FROM plant_records ORDER BY created_at DESC"
  );
  return result.rows;
}

/**
 * Checks if a record with the given SHA-256 hash already exists.
 * @param {string} hash
 * @returns {Promise<Object|null>} The existing record, or null if not found.
 */
async function getRecordByHash(hash) {
  const result = await pool.query(
    "SELECT * FROM plant_records WHERE sha256_hash = $1",
    [hash]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

module.exports = { initDB, insertRecord, getAllRecords, getRecordByHash, pool };
