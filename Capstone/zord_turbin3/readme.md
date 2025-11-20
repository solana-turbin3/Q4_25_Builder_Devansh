# ZORD - Zero-Knowledge & Confidential Computing KYC System

A privacy-preserving KYC (Know Your Customer) verification system built on Solana blockchain, combining Zero-Knowledge proofs and Arcium's confidential computing network for secure identity verification.

## 🎯 Overview

ZORD is a decentralized identity verification platform that enables users to prove their identity without revealing sensitive personal information. The system uses three layers of privacy protection:

1. **Zero-Knowledge Proofs (ZK-SNARK)** - Verify passport and PAN card matching without revealing actual data
2. **Arcium Confidential Computing** - Perform encrypted hash comparisons off-chain
3. **Solana Blockchain** - Immutable attestation storage and verification

## 🏗️ Architecture

![Screenshot 3](./screenshots/Screenshot%20From%202025-11-20%2015-14-09.png)
*high level architecture*

### `/zord` - Main Solana Program
The primary Anchor program handling KYC verification and attestation storage.

**Key Features:**
- Initialize KYC accounts
- Submit attestations
- Verify ZK proofs on-chain
- Store verification status

**Program ID:** `EgdCU8dmSb3mchFbgchYt28PCk4dnmKrYgQGMJsjMckf`

**Instructions:**
- `initialize_kyc` - Create a new KYC account
- `submit_attestation` - Submit JSON attestation data
- `verify_zk` - Verify zero-knowledge proofs

### `/arcium_module` - Confidential Computing Module
Arcium-powered encrypted computation for secure hash comparison.

- arcium integraion is not completed yet.

**Key Components:**
- `encrypted-ixs/` - Arcis circuits for encrypted operations
- `programs/rust/` - On-chain initialization and callback handlers
- Secure off-chain computation via Arcium MXE network

**Instructions:**
- `init_kyc_match_comp_def` - Initialize computation definition
- `kyc_match` - Queue encrypted hash comparison
- `kyc_match_callback` - Process computation results

### `/zk/passport_pan_zk` - Zero-Knowledge Circuit
Circom-based ZK-SNARK circuit for privacy-preserving identity verification.

> **⚠️ Note:** Currently, ZK proof generation and verification happens **off-chain**. Future versions will integrate on-chain verification using **Light Protocol** or similar ZK verification infrastructure on Solana.

**Circuit Logic:**
- Verifies passport and PAN card data match
- Compares name and date of birth
- Uses Poseidon hash for commitment
- Outputs validity proof without revealing data

**Files:**
- `proof.circom` - Main circuit definition
- `generate_and_verify.js` - Proof generation script
- `verification_key.json` - Public verification key

## 📸 Screenshots

### Terminal Output Examples

The `screenshots/` folder contains terminal outputs showing:

![Screenshot 1](./screenshots/Screenshot%20From%202025-11-20%2015-11-53.png)
*Solana program deployment*

![Screenshot 2](./screenshots/Screenshot%20From%202025-11-20%2015-13-25.png)
*Testing the program*

![Screenshot 4](./screenshots/Screenshot%20From%202025-11-20%2015-15-17.png)
*Zk proof generation*

![Screenshot 5](./screenshots/Screenshot%20From%202025-11-20%2015-15-38.png)
*Zk proof generation attestations*

## 🔐 Privacy Mechanisms

### 1. Zero-Knowledge Proofs
- User proves passport matches PAN without revealing actual data
- Circuit validates name and DOB match
- Poseidon hash ensures data integrity
- **Currently off-chain verification** - proof generation and verification done off-chain
- **Roadmap:** On-chain verification planned using Light Protocol or similar ZK infrastructure

### 2. Arcium Confidential Computing
- Hash comparison happens in encrypted environment
- Arcium MXE network acts as trusted co-processor
- Results returned via callback without exposing inputs
- Supports encrypted state transitions

### 3. On-Chain Attestations
- Verification results stored immutably
- No personal data stored on-chain
- Only cryptographic commitments and proofs
- Public verifiability with private inputs

## 🔧 Configuration

### Anchor Configuration

**ZORD Program (`zord/Anchor.toml`):**
```toml
[programs.devnet]
zord = "EgdCU8dmSb3mchFbgchYt28PCk4dnmKrYgQGMJsjMckf"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

**Arcium Module (`arcium_module/rust/Anchor.toml`):**
```toml
[programs.localnet]
rust = "6NK6Cejzcj2bJMTSQ2WAhaazQnuDUijESQmW2nWhkNDG"

[provider]
cluster = "localnet"
```

### Arcium Configuration

The Arcium module uses encrypted instructions defined in `encrypted-ixs/src/lib.rs`:

```rust
pub struct KycMatchInput {
    pub passport_hash: [u8; 32],
    pub pan_hash: [u8; 32],
}

#[instruction]
pub fn kyc_match(input_ctxt: Enc<Shared, KycMatchInput>) -> Enc<Shared, u8>
```

---

**Built by Devansh (haze)**
