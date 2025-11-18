import * as anchor from "@coral-xyz/anchor";
import { ArciumClient } from "@arcium/arcium-js";
import { expect } from "chai";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";

describe("Arcium AddTogether Test", () => {
    const provider = anchor.AnchorProvider.local();
    anchor.setProvider(provider);

    const program = anchor.workspace.Rust;   // your arcium anchor program
    const wallet = provider.wallet as anchor.Wallet;

    let arcium: ArciumClient;

    before(async () => {
        arcium = await ArciumClient.connect(
            provider.connection,
            wallet.payer,
            { cluster: "localnet" }
        );
    });

    it("Runs add_together computation", async () => {
        // Values encrypted externally — use dummy encryptions for test
        const ciphertext0 = new Array(32).fill(1);
        const ciphertext1 = new Array(32).fill(2);

        const pubKey = new Array(32).fill(9);
        const nonce = BigInt(1234);

        // 1️⃣ Init computation definition once
        await program.methods
            .initAddTogetherCompDef()
            .accounts({
                payer: wallet.publicKey,
                mxeAccount: arcium.mxePda,
                compDefAccount: arcium.compDefPda(program.programId, "add_together"),
                arciumProgram: arcium.programId,
                systemProgram: SystemProgram.programId
            })
            .rpc();

        // Compute offset = 0 for testing
        const compOffset = new anchor.BN(0);

        // 2️⃣ Queue the computation
        const tx = await program.methods
            .addTogether(
                compOffset,
                ciphertext0,
                ciphertext1,
                pubKey,
                nonce
            )
            .accounts({
                payer: wallet.publicKey,
                signPdaAccount: arcium.signerPda(wallet.publicKey),
                mxeAccount: arcium.mxePda,
                mempoolAccount: arcium.mempoolPda,
                executingPool: arcium.execPoolPda,
                computationAccount: arcium.computationPda(compOffset),
                compDefAccount: arcium.compDefPda(program.programId, "add_together"),
                clusterAccount: arcium.clusterPda,
                poolAccount: arcium.feePoolPda,
                clockAccount: arcium.clockPda,
                arciumProgram: arcium.programId,
                systemProgram: SystemProgram.programId
            })
            .rpc();

        console.log("Queued computation:", tx);

        // 3️⃣ Wait for Arcium executor to compute result
        const result = await arcium.waitForComputation(program.programId, compOffset);

        console.log("Arcium Output:", result);

        expect(result.success).to.be.true;
        expect(result.output.field_0.ciphertexts).to.have.length(1);
    });
});
