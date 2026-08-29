// ──────────────────────────────────────────────────────────────
//  PlantTrust — Blockchain Module (Member 5)
//  Hashes extracted text (SHA-256) and anchors to XRPL Testnet
// ──────────────────────────────────────────────────────────────
const crypto = require("crypto");
const xrpl = require("xrpl");

const XRPL_NETWORK =
  process.env.XRPL_NETWORK || "wss://s.altnet.rippletest.net:51233";
const EXPLORER_BASE = "https://testnet.xrpl.org/transactions/";

/**
 * Computes SHA-256 hash of the given text.
 * @param {string} text
 * @returns {string} Hex-encoded SHA-256 hash.
 */
function computeHash(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

/**
 * Hashes the extracted deed text with SHA-256 and submits a
 * transaction to the XRPL Testnet with the hash embedded as a Memo.
 *
 * @param {string} text - The OCR-extracted text to hash and anchor.
 * @returns {Promise<{ sha256Hash: string, txHash: string, explorerUrl: string }>}
 */
async function hashAndAnchor(text) {
  // 1. Compute SHA-256
  const sha256Hash = computeHash(text);
  console.log("[XRPL] SHA-256 hash:", sha256Hash);

  // 2. Connect to XRPL Testnet
  const client = new xrpl.Client(XRPL_NETWORK);
  console.log("[XRPL] Connecting to Testnet…");
  await client.connect();

  try {
    // 3. Generate & fund a wallet from the Testnet faucet
    console.log("[XRPL] Funding wallet via Testnet faucet…");
    const { wallet } = await client.fundWallet();
    console.log("[XRPL] Wallet funded:", wallet.classicAddress);

    // 4. Encode memo fields as hex
    const memoData = Buffer.from(sha256Hash, "utf8").toString("hex");
    const memoType = Buffer.from("text/plain", "utf8").toString("hex");
    const memoFormat = Buffer.from("PlantTrust-DeedHash", "utf8").toString(
      "hex"
    );

    // 5. Build self-payment transaction with Memo
    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: wallet.classicAddress,
      Destination: wallet.classicAddress, // Self-payment to anchor data
      Amount: xrpl.xrpToDrops("0.000001"), // Minimum amount
      Memos: [
        {
          Memo: {
            MemoData: memoData,
            MemoType: memoType,
            MemoFormat: memoFormat,
          },
        },
      ],
    });

    // 6. Sign and submit
    console.log("[XRPL] Submitting transaction…");
    const signed = wallet.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    const txHash = result.result.hash;
    const explorerUrl = `${EXPLORER_BASE}${txHash}`;

    console.log("[XRPL] Transaction validated!");
    console.log("[XRPL] TX Hash:", txHash);
    console.log("[XRPL] Explorer:", explorerUrl);

    return { sha256Hash, txHash, explorerUrl };
  } finally {
    await client.disconnect();
    console.log("[XRPL] Disconnected.");
  }
}

module.exports = { hashAndAnchor, computeHash };
