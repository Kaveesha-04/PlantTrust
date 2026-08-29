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
    // 3. Generate & fund two wallets from the Testnet faucet
    //    (Self-payments are rejected as temREDUNDANT, so we need a destination)
    console.log("[XRPL] Funding sender wallet via Testnet faucet…");
    const { wallet: sender } = await client.fundWallet();
    console.log("[XRPL] Sender funded:", sender.classicAddress);

    console.log("[XRPL] Funding destination wallet via Testnet faucet…");
    const { wallet: receiver } = await client.fundWallet();
    console.log("[XRPL] Receiver funded:", receiver.classicAddress);

    // 4. Encode memo fields as hex
    const memoData = Buffer.from(sha256Hash, "utf8").toString("hex");
    const memoType = Buffer.from("text/plain", "utf8").toString("hex");
    const memoFormat = Buffer.from("PlantTrust-DeedHash", "utf8").toString(
      "hex"
    );

    // 5. Build payment transaction with deed hash as Memo
    const prepared = await client.autofill({
      TransactionType: "Payment",
      Account: sender.classicAddress,
      Destination: receiver.classicAddress,
      Amount: xrpl.xrpToDrops("1"),
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
    const signed = sender.sign(prepared);
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
