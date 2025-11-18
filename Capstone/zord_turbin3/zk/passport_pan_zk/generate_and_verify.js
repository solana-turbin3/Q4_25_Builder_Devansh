// zk/generate_and_verify.js
// Runs your existing proof pipeline (generate_proof.js / yarn prove).
// On success, emits attestation JSON to stdout.

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

async function run(cmd, cwd) {
  console.log("> " + cmd);
  execSync(cmd, { stdio: "inherit", cwd });
}

function sha256hex(obj) {
  const json = typeof obj === "string" ? obj : JSON.stringify(obj);
  return crypto.createHash("sha256").update(json).digest("hex");
}

async function main() {
  const zkDir = path.join(__dirname);
  // 1) run the proof generation & verification command
  // Change this if you want to run `yarn prove` or `node generate_proof.js`
  const PROVE_CMD = "node generate_proof.js"; // or "yarn prove"
  try {
    run(PROVE_CMD, zkDir);
  } catch (e) {
    console.error("Proof generation or verification failed. Aborting.");
    process.exit(2);
  }

  // 2) read input.json to build attestation metadata
  const inputPath = path.join(zkDir, "input.json");
  if (!fs.existsSync(inputPath)) {
    console.error("input.json not found in zk dir:", inputPath);
    process.exit(3);
  }
  const input = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  // Build attestation JSON. Keep fields you want on-chain, minimally {is_valid, passport_hash, pan_hash, prov_time}
  const attestation = {
    is_valid: true,
    passport_hash: input.passport_hash,
    pan_hash: input.pan_hash,
    // add optional metadata:
    proof_generated_at: new Date().toISOString(),
  };

  const attestation_json = JSON.stringify(attestation);
  const attestation_hash_hex = sha256hex(attestation_json);

  const out = {
    attestation_json,
    attestation_hash_hex,
    attestation_object: attestation
  };

  // Print a single JSON object to stdout so the test harness can parse it
  console.log("\n===ATTESTATION_OUTPUT===");
  console.log(JSON.stringify(out));
  // exit success
  process.exit(0);
}

main();
