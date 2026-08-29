require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "1234",
  database: process.env.DB_NAME || "planttrust",
});

async function viewTable() {
  try {
    const result = await pool.query("SELECT id, filename, sha256_hash, created_at FROM plant_records ORDER BY created_at DESC");
    console.log("\n🌿 --- PlantTrust Database Records --- 🌿\n");
    console.table(result.rows);
    console.log(`\nTotal records found: ${result.rows.length}`);
  } catch (err) {
    console.error("Error fetching data:", err.message);
  } finally {
    pool.end();
  }
}

viewTable();
