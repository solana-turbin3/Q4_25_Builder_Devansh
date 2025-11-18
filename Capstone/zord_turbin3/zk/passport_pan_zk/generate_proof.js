const { execSync } = require("child_process");
const fs = require("fs");
const circomlib = require("circomlibjs");

function run(cmd) {
  console.log("> " + cmd);
  execSync(cmd, { stdio: "inherit" });
}

// Convert string → bigint for Poseidon
function strToBigInt(str) {
  return BigInt("0x" + Buffer.from(str).toString("hex"));
}

async function main() {
  // Load input
  const input = JSON.parse(fs.readFileSync("input.json"));

  // Build Poseidon hasher
  const poseidon = await circomlib.buildPoseidon();

  // Convert all string fields to BigInt
  const passportNameBigInt = strToBigInt(input.passport_name);
  const passportDobBigInt = strToBigInt(input.passport_dob);
  const passportNumberBigInt = strToBigInt(input.passport_number);
  
  const panNameBigInt = strToBigInt(input.pan_name);
  const panDobBigInt = strToBigInt(input.pan_dob);
  const panNumberBigInt = strToBigInt(input.pan_number);

  // Compute Poseidon hashes for passport fields
  const passportHash = poseidon([
    passportNameBigInt,
    passportDobBigInt,
    passportNumberBigInt
  ]);

  // Compute Poseidon hashes for PAN fields
  const panHash = poseidon([
    panNameBigInt,
    panDobBigInt,
    panNumberBigInt
  ]);

  // Update input.json with numeric values for circuit
  input.passport_name = passportNameBigInt.toString();
  input.passport_dob = passportDobBigInt.toString();
  input.passport_number = passportNumberBigInt.toString();
  input.pan_name = panNameBigInt.toString();
  input.pan_dob = panDobBigInt.toString();
  input.pan_number = panNumberBigInt.toString();
  input.passport_hash = poseidon.F.toString(passportHash);
  input.pan_hash = poseidon.F.toString(panHash);

  // Save the updated input.json
  fs.writeFileSync("input.json", JSON.stringify(input, null, 2));

  console.log("Generated hashes:", {
    passport_hash: input.passport_hash,
    pan_hash: input.pan_hash
  });

  const CIRCUIT_FILE = "proof.circom";
  const CIRCOM_PATH = process.env.HOME + "/.cargo/bin/circom";

  // Compile the circuit with circom 2.x
  run(`${CIRCOM_PATH} ${CIRCUIT_FILE} --r1cs --wasm --sym -l node_modules`);

  // Powers of Tau ceremony - Phase 1
  console.log("Starting Powers of Tau ceremony...");
  run(`npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v`);
  run(`npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v -e="random entropy"`);
  run(`npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v`);

  // Generate .zkey file - Phase 2
  console.log("Generating zkey...");
  run(`npx snarkjs groth16 setup proof.r1cs pot12_final.ptau circuit_0000.zkey`);
  run(`npx snarkjs zkey contribute circuit_0000.zkey circuit_final.zkey --name="1st Contributor" -v -e="random entropy"`);

  // Export verification key
  run(`npx snarkjs zkey export verificationkey circuit_final.zkey verification_key.json`);

  // Generate witness
  run(`node proof_js/generate_witness.js proof_js/proof.wasm input.json witness.wtns`);

  // Generate proof
  run(`npx snarkjs groth16 prove circuit_final.zkey witness.wtns proof.json public.json`);

  // Verify proof
  run(`npx snarkjs groth16 verify verification_key.json public.json proof.json`);

  console.log("ZK proof generated and verified");
}

main();