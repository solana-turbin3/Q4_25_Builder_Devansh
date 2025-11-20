import * as anchor from "@coral-xyz/anchor";
import { Program, AnchorProvider, web3 } from "@coral-xyz/anchor";
import { expect } from "chai";
import os from "os";

const { SystemProgram, PublicKey, Keypair } = web3;

// Default environment vars
if (!process.env.ANCHOR_PROVIDER_URL) {
  process.env.ANCHOR_PROVIDER_URL = "http://127.0.0.1:8899";
}
if (!process.env.ANCHOR_WALLET) {
  process.env.ANCHOR_WALLET = os.homedir() + "/.config/solana/id.json";
}

describe("Zord KYC Program Tests", () => {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Zord as Program<any>;
  const user = provider.wallet.publicKey;

  let kycPda: web3.PublicKey;
  let vkPda: web3.PublicKey;

  before(async () => {
    // Derive PDAs
    [kycPda] = await PublicKey.findProgramAddress(
      [Buffer.from("kyc"), user.toBuffer()],
      program.programId
    );

    [vkPda] = await PublicKey.findProgramAddress(
      [Buffer.from("vk")],
      program.programId
    );

    console.log("Program ID:", program.programId.toString());
    console.log("User:", user.toString());
    console.log("KYC PDA:", kycPda.toString());
    console.log("VK PDA:", vkPda.toString());
  });

  describe("Initialize KYC", () => {
    it("should initialize a new KYC account", async () => {
      try {
        await (program.rpc as any).initializeKyc({
          accounts: {
            user,
            kycAccount: kycPda,
            systemProgram: SystemProgram.programId,
          },
        });

        const kycAccount = await (program.account as any).kycAccount.fetch(kycPda);
        
        expect(kycAccount.user.toString()).to.equal(user.toString());
        expect(kycAccount.isVerified).to.equal(false);
        expect(kycAccount.timestamp.toNumber()).to.equal(0);
        
        console.log("✓ KYC account initialized successfully");
      } catch (err: any) {
        if (err.message.includes("already in use")) {
          console.log("⚠ KYC account already exists, skipping initialization");
        } else {
          throw err;
        }
      }
    });

    it("should fail to initialize KYC account twice", async () => {
      try {
        await (program.rpc as any).initializeKyc({
          accounts: {
            user,
            kycAccount: kycPda,
            systemProgram: SystemProgram.programId,
          },
        });
        
        throw new Error("Should have failed");
      } catch (err: any) {
        expect(err.message).to.include("already in use");
        console.log("✓ Correctly prevents duplicate initialization");
      }
    });
  });

  describe("Submit Attestation", () => {
    it("should submit a valid attestation", async () => {
      const attestation = JSON.stringify({
        is_valid: true,
        passport_hash: "abc123def456",
        pan_hash: "789xyz012",
        proof_generated_at: new Date().toISOString(),
      });

      await (program.rpc as any).submitAttestation(attestation, {
        accounts: {
          user,
          kycAccount: kycPda,
        },
      });

      const kycAccount = await (program.account as any).kycAccount.fetch(kycPda);
      
      expect(kycAccount.isVerified).to.equal(true);
      expect(kycAccount.timestamp.toNumber()).to.be.greaterThan(0);
      expect(Array.from(kycAccount.attestationHash)).to.not.deep.equal(Array(32).fill(0));
      
      console.log("✓ Attestation submitted with is_valid: true");
      console.log("  Timestamp:", kycAccount.timestamp.toNumber());
    });

    it("should submit attestation with is_valid: false", async () => {
      const attestation = JSON.stringify({
        is_valid: false,
        passport_hash: "invalid_hash",
        pan_hash: "invalid_pan",
        proof_generated_at: new Date().toISOString(),
      });

      await (program.rpc as any).submitAttestation(attestation, {
        accounts: {
          user,
          kycAccount: kycPda,
        },
      });

      const kycAccount = await (program.account as any).kycAccount.fetch(kycPda);
      
      expect(kycAccount.isVerified).to.equal(false);
      console.log("✓ Attestation submitted with is_valid: false");
    });

    it("should update attestation hash on new submission", async () => {
      const attestation1 = JSON.stringify({
        is_valid: true,
        data: "first_submission",
      });

      await (program.rpc as any).submitAttestation(attestation1, {
        accounts: {
          user,
          kycAccount: kycPda,
        },
      });

      const account1 = await (program.account as any).kycAccount.fetch(kycPda);
      const hash1 = Array.from(account1.attestationHash);

      // Wait a bit to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      const attestation2 = JSON.stringify({
        is_valid: true,
        data: "second_submission",
      });

      await (program.rpc as any).submitAttestation(attestation2, {
        accounts: {
          user,
          kycAccount: kycPda,
        },
      });

      const account2 = await (program.account as any).kycAccount.fetch(kycPda);
      const hash2 = Array.from(account2.attestationHash);

      expect(hash1).to.not.deep.equal(hash2);
      console.log("✓ Attestation hash updated correctly");
    });

    it("should fail with invalid JSON", async () => {
      const invalidJson = "{ this is not valid json }";

      try {
        await (program.rpc as any).submitAttestation(invalidJson, {
          accounts: {
            user,
            kycAccount: kycPda,
          },
        });
        
        throw new Error("Should have failed");
      } catch (err: any) {
        expect(err.toString()).to.include("InvalidJson");
        console.log("✓ Correctly rejects invalid JSON");
      }
    });

    it("should fail when is_valid field is missing", async () => {
      const missingField = JSON.stringify({
        passport_hash: "abc123",
        // is_valid is missing
      });

      try {
        await (program.rpc as any).submitAttestation(missingField, {
          accounts: {
            user,
            kycAccount: kycPda,
          },
        });
        
        throw new Error("Should have failed");
      } catch (err: any) {
        expect(err.toString()).to.include("InvalidJson");
        console.log("✓ Correctly rejects JSON missing is_valid");
      }
    });
  });

  describe("Verify ZK Proof", () => {
    before(async () => {
      // Ensure vk account exists for tests
      try {
        const lamports = await provider.connection.getMinimumBalanceForRentExemption(8);
        const createIx = SystemProgram.createAccount({
          fromPubkey: user,
          newAccountPubkey: vkPda,
          space: 8,
          lamports,
          programId: program.programId,
        });

        const tx = new web3.Transaction().add(createIx);
        await provider.sendAndConfirm(tx, []);
      } catch (e) {
        // Account may already exist
      }
    });

    it("should verify a valid ZK proof", async () => {
      const proofBytes = Buffer.from("valid_proof_data_123");
      const publicInputs = [
        Array.from(Buffer.alloc(32, 1)),
        Array.from(Buffer.alloc(32, 2)),
      ];

      await (program.rpc as any).verifyZk(proofBytes, publicInputs, {
        accounts: {
          vkAccount: vkPda,
          signer: user,
          systemProgram: SystemProgram.programId,
        },
      });

      console.log("✓ ZK proof verified successfully");
    });

    it("should fail with empty proof", async () => {
      const emptyProof = Buffer.alloc(0);
      const publicInputs: number[][] = [];

      try {
        await (program.rpc as any).verifyZk(emptyProof, publicInputs, {
          accounts: {
            vkAccount: vkPda,
            signer: user,
            systemProgram: SystemProgram.programId,
          },
        });
        
        throw new Error("Should have failed");
      } catch (err: any) {
        expect(err.toString()).to.include("ProofDeserialize");
        console.log("✓ Correctly rejects empty proof");
      }
    });

    it("should handle large proof data", async () => {
      const largeProof = Buffer.alloc(256, 0xAB); // Reduced from 1024 to fit in transaction
      const publicInputs = [
        Array.from(Buffer.alloc(32, 0xFF)),
      ];

      await (program.rpc as any).verifyZk(largeProof, publicInputs, {
        accounts: {
          vkAccount: vkPda,
          signer: user,
          systemProgram: SystemProgram.programId,
        },
      });

      console.log("✓ Large proof data handled correctly");
    });
  });

  describe("Complete KYC Flow", () => {
    it("should complete full KYC flow from initialization to verification", async () => {
      // Use a different user for this test
      const newUser = Keypair.generate();
      
      // Airdrop SOL to new user
      const signature = await provider.connection.requestAirdrop(
        newUser.publicKey,
        2 * web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);

      const [newKycPda] = await PublicKey.findProgramAddress(
        [Buffer.from("kyc"), newUser.publicKey.toBuffer()],
        program.programId
      );

      // Step 1: Initialize
      await (program.rpc as any).initializeKyc({
        accounts: {
          user: newUser.publicKey,
          kycAccount: newKycPda,
          systemProgram: SystemProgram.programId,
        },
        signers: [newUser],
      });

      let account = await (program.account as any).kycAccount.fetch(newKycPda);
      expect(account.isVerified).to.equal(false);
      console.log("  ✓ Step 1: KYC initialized");

      // Step 2: Submit attestation
      const attestation = JSON.stringify({
        is_valid: true,
        passport_hash: "new_user_passport",
        pan_hash: "new_user_pan",
      });

      await (program.rpc as any).submitAttestation(attestation, {
        accounts: {
          user: newUser.publicKey,
          kycAccount: newKycPda,
        },
        signers: [newUser],
      });

      account = await (program.account as any).kycAccount.fetch(newKycPda);
      expect(account.isVerified).to.equal(true);
      console.log("  ✓ Step 2: Attestation submitted");

      // Step 3: Verify ZK proof
      const proofBytes = Buffer.from("new_user_proof");
      const publicInputs: number[][] = [];

      await (program.rpc as any).verifyZk(proofBytes, publicInputs, {
        accounts: {
          vkAccount: vkPda,
          signer: newUser.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [newUser],
      });

      console.log("  ✓ Step 3: ZK proof verified");
      console.log("✓ Complete KYC flow successful for new user");
    });
  });
});
